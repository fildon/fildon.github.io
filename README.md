# fildon.github.io

A simple directory page for my other projects.

Hosted at [rupertmckay.com](https://rupertmckay.com/)

## Build process

I use [11ty](https://www.11ty.dev/). This allows the use of markdown files which get converted to HTML.

By default everything in `./src` will get compiled by `11ty`. For any files which must be deployed but not built, they can be added to `./static`. Everything in `./static` will be copied as-is to the build output directory `./_site`. See `./.eleventy.js` for configuration.

## Deployment

Having produced a build in `_site`, the entire directory is pushed up on a `gh-pages` branch to GitHub, and hosted exactly as-is.

## Publishing a new blog post

A new blog post should be authored within the `/src/blog` directory. It should have its own subdirectory. The name of the subdirectory will become the URL route, e.g. `/src/blog/42-foo/index.md` will become `rupertmckay.com/blog/42-foo`. I maintain a convention of prefixing the directories with a number in order to keep the directories chronologically ordered in the source code. The markdown file must be named `index.md` or else its name will be appended to the route URL, e.g. `/src/blog/42-foo/foo.md` will become `rupertmckay.com/blog/42-foo/foo`, which we don't want.

If the post requires any other files, such as images, these can be colocated and referenced plainly using relative URLs.
