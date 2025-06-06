/*
 * ghpages.ts
 *
 * Copyright (C) 2020-2022 Posit Software, PBC
 */

import { debug, info } from "../../deno_ral/log.ts";
import { dirname, join, relative } from "../../deno_ral/path.ts";
import { copy } from "../../deno_ral/fs.ts";
import * as colors from "fmt/colors";

import { Confirm } from "cliffy/prompt/confirm.ts";

import { removeIfExists } from "../../core/path.ts";
import { execProcess } from "../../core/process.ts";

import { ProjectContext } from "../../project/types.ts";
import {
  AccountToken,
  PublishFiles,
  PublishProvider,
} from "../provider-types.ts";
import { PublishOptions, PublishRecord } from "../types.ts";
import { shortUuid } from "../../core/uuid.ts";
import { sleep } from "../../core/wait.ts";
import { joinUrl } from "../../core/url.ts";
import { completeMessage, withSpinner } from "../../core/console.ts";
import { renderForPublish } from "../common/publish.ts";
import { RenderFlags } from "../../command/render/types.ts";
import { gitBranchExists, gitCmds, gitVersion } from "../../core/git.ts";
import {
  anonymousAccount,
  gitHubContextForPublish,
  verifyContext,
} from "../common/git.ts";
import { createTempContext } from "../../core/temp.ts";
import { projectScratchPath } from "../../project/project-scratch.ts";

export const kGhpages = "gh-pages";
const kGhpagesDescription = "GitHub Pages";

export const ghpagesProvider: PublishProvider = {
  name: kGhpages,
  description: kGhpagesDescription,
  requiresServer: false,
  listOriginOnly: false,
  accountTokens,
  authorizeToken,
  removeToken,
  publishRecord,
  resolveTarget,
  publish,
  isUnauthorized,
  isNotFound,
};

function accountTokens() {
  return Promise.resolve([anonymousAccount()]);
}

async function authorizeToken(options: PublishOptions) {
  const ghContext = await gitHubContextForPublish(options.input);
  verifyContext(ghContext, "GitHub Pages");

  // good to go!
  return Promise.resolve(anonymousAccount());
}

function removeToken(_token: AccountToken) {
}

async function publishRecord(
  input: string | ProjectContext,
): Promise<PublishRecord | undefined> {
  const ghContext = await gitHubContextForPublish(input);
  if (ghContext.ghPagesRemote) {
    return {
      id: "gh-pages",
      url: ghContext.siteUrl || ghContext.originUrl,
    };
  }
}

function resolveTarget(
  _account: AccountToken,
  target: PublishRecord,
): Promise<PublishRecord | undefined> {
  return Promise.resolve(target);
}

async function publish(
  _account: AccountToken,
  type: "document" | "site",
  input: string,
  title: string,
  _slug: string,
  render: (flags?: RenderFlags) => Promise<PublishFiles>,
  options: PublishOptions,
  target?: PublishRecord,
): Promise<[PublishRecord | undefined, URL | undefined]> {
  // convert input to dir if necessary
  input = Deno.statSync(input).isDirectory ? input : dirname(input);

  // check if git version is new enough
  const version = await gitVersion();

  // git 2.17.0 appears to be the first to support git-worktree add --track
  // https://github.com/git/git/blob/master/Documentation/RelNotes/2.17.0.txt#L368
  if (version.compare("2.17.0") < 0) {
    throw new Error(
      "git version 2.17.0 or higher is required to publish to GitHub Pages",
    );
  }

  // get context
  const ghContext = await gitHubContextForPublish(options.input);
  verifyContext(ghContext, "GitHub Pages");

  // create gh pages branch on remote and local if there is none yet
  const createGhPagesBranchRemote = !ghContext.ghPagesRemote;
  const createGhPagesBranchLocal = !ghContext.ghPagesLocal;
  if (createGhPagesBranchRemote) {
    // confirm
    let confirmed = await Confirm.prompt({
      indent: "",
      message: `Publish site to ${
        ghContext.siteUrl || ghContext.originUrl
      } using gh-pages?`,
      default: true,
    });
    if (confirmed && !createGhPagesBranchLocal) {
      confirmed = await Confirm.prompt({
        indent: "",
        message:
          `A local gh-pages branch already exists. Should it be pushed to remote 'origin'?`,
        default: true,
      });
    }

    if (!confirmed) {
      throw new Error();
    }

    const stash = !(await gitDirIsClean(input));
    if (stash) {
      await gitStash(input);
    }
    const oldBranch = await gitCurrentBranch(input);
    try {
      // Create and push if necessary, or just push local branch
      if (createGhPagesBranchLocal) {
        await gitCreateGhPages(input);
      } else {
        await gitPushGhPages(input);
      }
    } catch {
      // Something failed so clean up, i.e
      // if we created the branch then delete it.
      // Example of failure: Auth error on push (https://github.com/quarto-dev/quarto-cli/issues/9585)
      if (createGhPagesBranchLocal && await gitBranchExists("gh-pages")) {
        await gitCmds(input, [
          ["checkout", oldBranch],
          ["branch", "-D", "gh-pages"],
        ]);
      }
      throw new Error(
        "Publishing to gh-pages with `quarto publish gh-pages` failed.",
      );
    } finally {
      if (await gitCurrentBranch(input) !== oldBranch) {
        await gitCmds(input, [["checkout", oldBranch]]);
      }
      if (stash) {
        await gitStashApply(input);
      }
    }
  }

  // sync from remote
  await gitCmds(input, [
    ["remote", "set-branches", "--add", "origin", "gh-pages"],
    ["fetch", "origin", "gh-pages"],
  ]);

  // render
  const renderResult = await renderForPublish(
    render,
    "gh-pages",
    type,
    title,
    type === "site" ? target?.url : undefined,
  );

  const kPublishWorktreeDir = "quarto-publish-worktree-";
  // allocate worktree dir
  const temp = createTempContext(
    { prefix: kPublishWorktreeDir, dir: projectScratchPath(input) },
  );
  const tempDir = temp.baseDir;
  removeIfExists(tempDir);

  // cleaning up leftover by listing folder with prefix .quarto-publish-worktree- and calling git worktree rm on them
  const worktreeDir = Deno.readDirSync(projectScratchPath(input));
  for (const entry of worktreeDir) {
    if (
      entry.isDirectory && entry.name.startsWith(kPublishWorktreeDir)
    ) {
      debug(
        `Cleaning up leftover worktree folder ${entry.name} from past deploys`,
      );
      const worktreePath = join(projectScratchPath(input), entry.name);
      await execProcess({
        cmd: "git",
        args: ["worktree", "remove", worktreePath],
        cwd: projectScratchPath(input),
      });
      removeIfExists(worktreePath);
    }
  }

  // create worktree and deploy from it
  const deployId = shortUuid();
  debug(`Deploying from worktree ${tempDir} with deployId ${deployId}`);
  await withWorktree(input, relative(input, tempDir), async () => {
    // copy output to tempdir and add .nojekyll (include deployId
    // in .nojekyll so we can poll for completed deployment)
    await copy(renderResult.baseDir, tempDir, { overwrite: true });
    Deno.writeTextFileSync(join(tempDir, ".nojekyll"), deployId);

    // push
    await gitCmds(tempDir, [
      ["add", "-Af", "."],
      ["commit", "--allow-empty", "-m", "Built site for gh-pages"],
      ["remote", "-v"],
      ["push", "--force", "origin", "HEAD:gh-pages"],
    ]);
  });
  temp.cleanup();
  info("");

  // if this is the creation of gh-pages AND this is a user home/default site
  // then tell the user they need to switch it to use gh-pages. also do this
  // if the site is getting a 404 error
  let notifyGhPagesBranch = false;
  let defaultSiteMatch: RegExpMatchArray | null;
  if (ghContext.siteUrl) {
    defaultSiteMatch = ghContext.siteUrl.match(
      /^https:\/\/(.+?)\.github\.io\/$/,
    );
    if (defaultSiteMatch) {
      if (createGhPagesBranchRemote) {
        notifyGhPagesBranch = true;
      } else {
        try {
          const response = await fetch(ghContext.siteUrl);
          if (response.status === 404) {
            notifyGhPagesBranch = true;
          }
        } catch {
          //
        }
      }
    }
  }

  // if this is an update then warn that updates may require a browser refresh
  if (!createGhPagesBranchRemote && !notifyGhPagesBranch) {
    info(colors.yellow(
      "NOTE: GitHub Pages sites use caching so you might need to click the refresh\n" +
        "button within your web browser to see changes after deployment.\n",
    ));
  }

  // wait for deployment if we are opening a browser
  let verified = false;
  const start = new Date();

  if (options.browser && ghContext.siteUrl && !notifyGhPagesBranch) {
    await withSpinner({
      message:
        "Deploying gh-pages branch to website (this may take a few minutes)",
    }, async () => {
      const noJekyllUrl = joinUrl(ghContext.siteUrl!, ".nojekyll");
      while (true) {
        const now = new Date();
        const elapsed = now.getTime() - start.getTime();
        if (elapsed > 1000 * 60 * 5) {
          info(colors.yellow(
            "Deployment took longer than 5 minutes, giving up waiting for deployment to complete",
          ));
          break;
        }
        await sleep(2000);
        const response = await fetch(noJekyllUrl);
        if (response.status === 200) {
          if ((await response.text()).trim() === deployId) {
            verified = true;
            await sleep(2000);
            break;
          }
        } else if (response.status !== 404) {
          break;
        }
      }
    });
  }

  completeMessage(`Published to ${ghContext.siteUrl || ghContext.originUrl}`);
  info("");

  if (notifyGhPagesBranch) {
    info(
      colors.yellow(
        "To complete publishing, change the source branch for this site to " +
          colors.bold("gh-pages") + ".\n\n" +
          `Set the source branch at: ` +
          colors.underline(
            `https://github.com/${defaultSiteMatch![1]}/${
              defaultSiteMatch![1]
            }.github.io/settings/pages`,
          ) + "\n",
      ),
    );
  } else if (!verified) {
    info(colors.yellow(
      "NOTE: GitHub Pages deployments normally take a few minutes (your site updates\n" +
        "will be visible once the deploy completes)\n",
    ));
  }

  return Promise.resolve([
    undefined,
    verified ? new URL(ghContext.siteUrl!) : undefined,
  ]);
}

function isUnauthorized(_err: Error) {
  return false;
}

function isNotFound(_err: Error) {
  return false;
}

async function gitStash(dir: string) {
  const result = await execProcess({
    cmd: "git",
    args: ["stash"],
    cwd: dir,
  });
  if (!result.success) {
    throw new Error();
  }
}

async function gitStashApply(dir: string) {
  const result = await execProcess({
    cmd: "git",
    args: ["stash", "apply"],
    cwd: dir,
  });
  if (!result.success) {
    throw new Error();
  }
}

async function gitDirIsClean(dir: string) {
  const result = await execProcess({
    cmd: "git",
    args: ["diff", "HEAD"],
    cwd: dir,
    stdout: "piped",
  });
  if (result.success) {
    return result.stdout!.trim().length === 0;
  } else {
    throw new Error();
  }
}

async function gitCurrentBranch(dir: string) {
  const result = await execProcess({
    cmd: "git",
    args: ["rev-parse", "--abbrev-ref", "HEAD"],
    cwd: dir,
    stdout: "piped",
  });
  if (result.success) {
    return result.stdout!.trim();
  } else {
    throw new Error();
  }
}

async function withWorktree(
  dir: string,
  siteDir: string,
  f: () => Promise<void>,
) {
  await execProcess({
    cmd: "git",
    args: [
      "worktree",
      "add",
      "--track",
      "-B",
      "gh-pages",
      siteDir,
      "origin/gh-pages",
    ],
    cwd: dir,
  });

  // remove files in existing site, i.e. start clean
  await execProcess({
    cmd: "git",
    args: ["rm", "-r", "--quiet", "."],
    cwd: join(dir, siteDir),
  });

  try {
    await f();
  } finally {
    await execProcess({
      cmd: "git",
      args: ["worktree", "remove", siteDir],
      cwd: dir,
    });
  }
}

async function gitCreateGhPages(dir: string) {
  await gitCmds(dir, [
    ["checkout", "--orphan", "gh-pages"],
    ["rm", "-rf", "--quiet", "."],
    ["commit", "--allow-empty", "-m", "Initializing gh-pages branch"],
  ]);
  await gitPushGhPages(dir);
}

async function gitPushGhPages(dir: string) {
  if (await gitCurrentBranch(dir) !== "gh-pages") {
    await gitCmds(dir, [["checkout", "gh-pages"]]);
  }
  await gitCmds(dir, [["push", "origin", "HEAD:gh-pages"]]);
}
