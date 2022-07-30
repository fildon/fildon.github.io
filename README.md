# fildon.github.io

A simple directory page for my other projects.

Hosted at [fildon.me](https://fildon.me/)

## Build process

I use [11ty](https://www.11ty.dev/). This allows the use of markdown files which get converted to HTML.

By default everything in `./src` will get compiled by `11ty`. For any files which must be deployed but not built, they can be added to `./static`. Everything in `./static` will be copied as-is to the build output directory `./_site`. See `./.eleventy.js` for configuration.

## Building Mermaid Diagrams

A custom script at `./buildmermaid.js` handles conversion of mermaid files to SVGs at build time. Markdown posts can reference the compiled SVGs and display them inline. This approach avoids client browsers needing to load very heavy mermaid renderers.

## Deployment

Having produced a build in `_site`, the entire directory is pushed up on a `gh-pages` branch to GitHub, and hosted exactly as-is.
