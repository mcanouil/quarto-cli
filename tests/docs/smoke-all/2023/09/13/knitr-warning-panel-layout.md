---
title: Knitr Table Test
keep-md: true
---

::: {#tbl-tables .cell layout-ncol="2" tbl-cap='Tables'}

```{.r .cell-code}
library(knitr)
```

::: {.cell-output .cell-output-stderr}

```
Warning: le package 'knitr' a été compilé avec la version R 4.2.3
```

:::

```{.r .cell-code}
kable(head(cars), caption = "Cars {#tbl-cars}")
```

::: {.cell-output-display}

Table: Cars {#tbl-cars}

| speed | dist |
| ----: | ---: |
|     4 |    2 |
|     4 |   10 |
|     7 |    4 |
|     7 |   22 |
|     8 |   16 |
|     9 |   10 |

:::

```{.r .cell-code}
kable(head(pressure), caption = "Pressure {#tbl-pressure}")
```

::: {.cell-output-display}

Table: Pressure {#tbl-pressure}

| temperature | pressure |
| ----------: | -------: |
|           0 |   0.0002 |
|          20 |   0.0012 |
|          40 |   0.0060 |
|          60 |   0.0300 |
|          80 |   0.0900 |
|         100 |   0.2700 |

:::
:::

See @tbl-cars for more information.
