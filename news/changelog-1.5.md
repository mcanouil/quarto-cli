All changes included in 1.5:

## HTML Format

- ([#6992](https://github.com/quarto-dev/quarto-cli/issues/6992)): Properly render custom license URLs in HTML page appendix,
- ([#8118](https://github.com/quarto-dev/quarto-cli/issues/8118)): Add support for `body-classes` to add classes to the document body.
- ([#8311](https://github.com/quarto-dev/quarto-cli/issues/8311)): Correct z-order for margins with no contents
- ([#8862](https://github.com/quarto-dev/quarto-cli/issues/8862)): Properly deal with an `aside` within a definition list.
- ([#8990](https://github.com/quarto-dev/quarto-cli/issues/8990)): Copy button now works for embedded code source in modal window when optin-in `code-tools` feature.
- ([#9076](https://github.com/quarto-dev/quarto-cli/issues/9076)): Fix issue with `layout-ncol` and `column` settings in executable code cells.
- ([#9125](https://github.com/quarto-dev/quarto-cli/issues/9125)): Fix issue in browser console with TOC selection when the document is using ids for headers with specific characters (e.g russian language headers).

## PDF Format

- ([#8299](https://github.com/quarto-dev/quarto-cli/issues/8299)): Don't use `rsvg-convert` to convert an SVG to PDF when the PDF is already available; add `use-rsvg-convert` option to control this behavior.
- ([#8684](https://github.com/quarto-dev/quarto-cli/issues/8684)): Improve detection and automatic installation of locale specific hyphenation files.
- ([#8711](https://github.com/quarto-dev/quarto-cli/issues/8711)): Enforce rendering of tables as `tabular` environments when custom float environments are present.
- ([#8841](https://github.com/quarto-dev/quarto-cli/issues/8841)): Do not parse LaTeX table when crossref label doesn't start with `tbl-`.

## RevealJS Format

- ([#8382](https://github.com/quarto-dev/quarto-cli/issues/8382)): Strip whitespace from `div.columns` elements that might have been introduced by third-party processing.
- ([#9117](https://github.com/quarto-dev/quarto-cli/issues/9117)): Fix an issue with input filename containing special characters.

## Docusaurus Format

- ([#8919](https://github.com/quarto-dev/quarto-cli/issues/8919)): Ensure enough backticks in code cell declarations.
- ([#9179](https://github.com/quarto-dev/quarto-cli/issues/9179)): Emit tables that Pandoc would write as HTML as RawBlock elements to ensure they are rendered correctly in Docusaurus.

## Website

- ([#6779](https://github.com/quarto-dev/quarto-cli/issues/6779)): Add support for `logo-href` and `logo-alt` in `sidebar` (books and websites)
- ([#7318](https://github.com/quarto-dev/quarto-cli/issues/7318)): Don't improperly overwrite page titles
- ([#8108](https://github.com/quarto-dev/quarto-cli/issues/8108)): Individual pages can suppress breadcrumbs using `bread-crumbs: false`
- ([#8132](https://github.com/quarto-dev/quarto-cli/issues/8132)): Properly escape urls in the sitemap.
- ([#8267](https://github.com/quarto-dev/quarto-cli/issues/8267)): Improve responsive layout of `page-footer`
- ([#8294](https://github.com/quarto-dev/quarto-cli/issues/8294)): Add support for website announcements, using the `announcement` key under `website`.
- ([#8426](https://github.com/quarto-dev/quarto-cli/issues/8426)): Ignore invalid dates for references when generating Google Scholar data.
- ([#8544](https://github.com/quarto-dev/quarto-cli/issues/8544)): Fix about page layout when using an `id` to provide contents.
- ([#8588](https://github.com/quarto-dev/quarto-cli/issues/8588)): Fix display of `bread-crumbs` on pages with banner style title blocks.
- ([#8830](https://github.com/quarto-dev/quarto-cli/issues/8830)): Add support for `tools-collapse` to control whether the tools collapse when the navbar does.
- ([#8851](https://github.com/quarto-dev/quarto-cli/issues/8851)): Don't strip `index.html` from external paths.
- ([#8977](https://github.com/quarto-dev/quarto-cli/issues/8977)): Don't decorate about links within external link icons.
- ([#9356](https://github.com/quarto-dev/quarto-cli/issues/9356)): Don't process column classes for figures inside the About divs.

## Book

- ([#8737](https://github.com/quarto-dev/quarto-cli/issues/8737)): Fix issue in `page-footer` when url are used in `href` for book's configuration.
- ([#8814](https://github.com/quarto-dev/quarto-cli/issues/8814)): Fix issue with `bibliography` field using urls in book's configuration.
- ([#9269](https://github.com/quarto-dev/quarto-cli/issues/9269)): Fix issue with icons in download dropdown for multiple book formats.

## OJS

- ([#8327](https://github.com/quarto-dev/quarto-cli/issues/8327)): Issue error messages on console so they're visible in the case of hidden OJS cells.

## Typst

- ([#8539](https://github.com/quarto-dev/quarto-cli/issues/8539)): Support for Typst theorems and their ilk via [typst-theorems](https://github.com/sahasatvik/typst-theorems).
- ([#9293](https://github.com/quarto-dev/quarto-cli/pull/9293)): Add `toc-indent` to control indentation of entries in the table of contents.
- Upgrade Typst to 0.11
- Upgrade the Typst template to draw tables without grid lines by default, in accordance with latest Pandoc.

## Jupyter

- ([#4802](https://github.com/quarto-dev/quarto-cli/issues/4802)): Change name of temporary input notebook to avoid accidental overwriting.
- ([#8433](https://github.com/quarto-dev/quarto-cli/issues/8433)): Escape jupyter widget states that contain `</script>` so they can be embedded in HTML documents.
- When searching for kernelspecs that match `python`, prefer one one that matches an active Python venv.
- ([#8454](https://github.com/quarto-dev/quarto-cli/issues/8454)): Allow Jupyter engine to handle markdown files with mixed-case extensions.
- ([#8919](https://github.com/quarto-dev/quarto-cli/issues/8919)): Ensure enough backticks in `quarto convert` from `.ipynb` to `.qmd` files.
- ([#8998](https://github.com/quarto-dev/quarto-cli/issues/8998)): Interpret slide separation markers `---` correctly when creating the `.ipynb` intermediate notebook from a `.qmd` file.
- ([#9133](https://github.com/quarto-dev/quarto-cli/issues/9133)): Fix issue with Jupyter engine when using paths containing special characters.
- ([#9255](https://github.com/quarto-dev/quarto-cli/issues/9255)): Support cell source fields of type `string`.
- ([#9422](https://github.com/quarto-dev/quarto-cli/issues/9422)): Improve the stream merging algorithm in output cells to avoid merging outputs that should not be merged.

## Website Listings

- ([#8147](https://github.com/quarto-dev/quarto-cli/issues/8147)): Ensure that listings don't include the contents of the output directory
- ([#8435](https://github.com/quarto-dev/quarto-cli/issues/8435)): Improve listing filtering using special characters
- ([#8627](https://github.com/quarto-dev/quarto-cli/issues/8627)): Localize the text that appears as placeholder in listing filters.
- ([#8715](https://github.com/quarto-dev/quarto-cli/issues/8715)): Listings should respect `image: false`
- ([#8860](https://github.com/quarto-dev/quarto-cli/discussions/8860)): Don't show duplicate author names.
- ([#9030](https://github.com/quarto-dev/quarto-cli/discussions/9030)): Warn (rather than error) when listing globs produce an empty listing (as this is permissable).
- ([#9447](https://github.com/quarto-dev/quarto-cli/pull/9447)): Add support for the boolean `image-lazy-loading` option to enable lazy loading of images in listings (default: `true`).

## Manuscripts

- ([#8277](https://github.com/quarto-dev/quarto-cli/issues/8277)): Improve notebook ordering within Manuscript projects
- ([#8974](https://github.com/quarto-dev/quarto-cli/issues/8974)): Fix theorem rendering in Manuscript projects

## Extensions

- ([#8385](https://github.com/quarto-dev/quarto-cli/issues/8385)): Properly copy project resources when extensions are installed at project level.
- ([#8547](https://github.com/quarto-dev/quarto-cli/issues/8547)): Support installing extensions from github branch with forward slash in the name.

## Shortcodes

- ([#8316](https://github.com/quarto-dev/quarto-cli/issues/8316)): Add fallback value for the `env` shortcode.
- ([#9011](https://github.com/quarto-dev/quarto-cli/issues/9011)): `embed` shortcode now renders the embedded document without error when it is using knitr engine and have some outputs with HTML dependencies.

## Lightbox Images

- ([#8607](https://github.com/quarto-dev/quarto-cli/issues/8607)): Ensure we properly use the `description` attribute if it is present.

## Filters

- ([#8417](https://github.com/quarto-dev/quarto-cli/issues/8417)): Maintain a single AST element in the output cells when parsing HTML from RawBlock elements.
- ([#8582](https://github.com/quarto-dev/quarto-cli/issues/8582)): Improve the algorithm for extracting table elements from HTML RawBlock elements.
- ([#8770](https://github.com/quarto-dev/quarto-cli/issues/8770)): Handle inconsistently-defined float types and identifier names more robustly in HTML tables.

## Engines

- ([#8388](https://github.com/quarto-dev/quarto-cli/issues/8388)): add `QUARTO_PROJECT_ROOT` and `QUARTO_DOCUMENT_PATH` to the environment when invoking execution engines.

## Article Layout

- ([#8614](https://github.com/quarto-dev/quarto-cli/issues/8614)): Don't improperly forward column classes onto grids.

## Publishing

- ([#9308](https://github.com/quarto-dev/quarto-cli/issues/9308)): Improved error message when trying to publish to Github pages with `quarto publish gh-pages`.

## `quarto inspect`

- ([#8939](https://github.com/quarto-dev/quarto-cli/pull/8939)): `quarto inspect` now takes an additional optional parameter to specify the output file, and provides the graph of include dependencies for the inspection target.
- ([#9264](https://github.com/quarto-dev/quarto-cli/pull/9264)): `quarto inspect` now provides information about the code cells in the inspection target.

## `quarto check`

- `quarto check` now checks a minimal version of Typst and prints the version, to aid with troubleshooting.

## `quarto typst`

- ([#9106])(#https://github.com/quarto-dev/quarto-cli/issues/9106)): Do not allow `quarto typst update`.

## Quarto's input format

- Quarto now supports raw block and raw inline elements of types `pandoc-native` and `pandoc-json`, and will use Pandoc's `native` and `json` reader to convert these elements to Pandoc's AST. This is useful in situations where emitting Markdown is not sufficient or convient enough to express the desired structure of a document.

## Other Fixes and Improvements

- ([#8119](https://github.com/quarto-dev/quarto-cli/issues/8119)): More intelligently detect when ejs templates are modified during development, improving quality of life during preview.
- ([#8177](https://github.com/quarto-dev/quarto-cli/issues/8177)): Use an explicit path to `sysctl` when detecting MacOS architecture. (author: @kevinushey)
- ([#8274](https://github.com/quarto-dev/quarto-cli/issues/8274)): set `LUA_CPATH` to '' if unset, avoiding accidentally loading incompatible system-wide libraries.
- ([#8401](https://github.com/quarto-dev/quarto-cli/issues/8401)): Ensure that files created with `quarto create <project_name>` have lowercase filenames.
- ([#8438](https://github.com/quarto-dev/quarto-cli/issues/8438)): Ensure that sub commands properly support logging control flags (e.g. `--quiet`, etc).
- ([#8422](https://github.com/quarto-dev/quarto-cli/issues/8422)): Improve dashboard validation and sauto-completion support for external tools
- ([#8486](https://github.com/quarto-dev/quarto-cli/issues/8486)): Improve arrow theme differentation of Keywords and Control Flow elements
- ([#8524](https://github.com/quarto-dev/quarto-cli/issues/8524)): Improve detection of R environment which configuring Binder using 'quarto use'. Check for lock files, pre and post render scripts that use R.
- ([#8540](https://github.com/quarto-dev/quarto-cli/issues/8540)): Allow title to be specifed separately when creating a project
- ([#8652](https://github.com/quarto-dev/quarto-cli/issues/8652)): Make code cell detection in IDE tooling consistent across editor modes.
- ([#8779](https://github.com/quarto-dev/quarto-cli/issues/8779)): Resolve shortcode includes before engine and target determination.
- ([#8873](https://github.com/quarto-dev/quarto-cli/issues/8873)): Don't overwrite supporting files when creating a project.
- ([#8937](https://github.com/quarto-dev/quarto-cli/issues/8937)): Fix unix launcher script to properly handle spaces in the path to the quarto executable.
- ([#8898](https://github.com/quarto-dev/quarto-cli/issues/8898)): `.deb` and `.tar.gz` bundle contents are now associated to root user and group instead of default user and group for CI build runners.
- ([#9041](https://github.com/quarto-dev/quarto-cli/issues/9041)): When creating an automatic citation key, replace spaces with underscores in inferred keys.
- ([#9059](https://github.com/quarto-dev/quarto-cli/issues/9059)): `quarto run` now properly works on Windows with Lua scripts.
- ([#9282](https://github.com/quarto-dev/quarto-cli/issues/9282)): Fix name clash in Lua local declarations for `mediabag` in bundled releases.
- ([#9394](https://github.com/quarto-dev/quarto-cli/issues/9394)): Make `template` a required field in the `about` schema.
- ([#9426](https://github.com/quarto-dev/quarto-cli/issues/9426)): Update `crossref.lua` filter to avoid crashes and hangs in documents with custom AST nodes.
- ([#9492](https://github.com/quarto-dev/quarto-cli/issues/9492)): Improve performance of `quarto preview` when serving resource files of the following formats: HTML, PDF, DOCX, and plaintext.
- Add support for `{{< lipsum >}}` shortcode, which is useful for emitting placeholder text. Provide a specific number of paragraphs (`{{< lipsum 3 >}}`).
- Resolve data URIs in Pandoc's mediabag when rendering documents.
- Increase v8's max heap size by default, to avoid out-of-memory errors when rendering large documents (also cf. https://github.com/denoland/deno/issues/18935).
- When running `quarto check` from a development build (from a git repository), show the git commit hash in addition to the version string.
- Upgrade Deno to 1.41.0
- `quarto install tinytex` will now try to set the default CTAN repository to the nearest mirror resolved from https://mirror.ctan.org.
