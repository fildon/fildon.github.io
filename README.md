# fildon.github.io

A simple directory page for my other projects.

Hosted at [rupertmckay.com](https://rupertmckay.com/)

## Build process

I use [11ty](https://www.11ty.dev/). This allows the use of markdown files which get converted to HTML.

By default everything in `./src` will get compiled by `11ty`. For any files which must be deployed but not built, they can be added to `./static`. Everything in `./static` will be copied as-is to the build output directory `./_site`. See `./.eleventy.js` for configuration.

## Development

Available npm scripts:

- `npm run build` - Build the site to `_site` directory
- `npm run serve` - Start development server with live reload
- `npm run clean` - Remove the `_site` directory
- `npm run debug` - Build with debug output for troubleshooting

The development server includes:

- **Live reload**: Changes to CSS files trigger automatic browser refresh
- **Hot reload**: Changes to content trigger automatic rebuild
- **BrowserSync disabled notifications**: Cleaner development experience

## Deployment

Having produced a build in `_site`, the entire directory is pushed up on a `gh-pages` branch to GitHub, and hosted exactly as-is.

## Quality Assurance

### Link Checking

The repository includes automated link checking via GitHub Actions:

- **Scheduled checks**: Runs monthly to catch link rot
- **PR checks**: Validates links in pull requests
- **Manual trigger**: Can be run on-demand from the Actions tab

Configuration is in `lychee.toml`. If broken links are found, an issue will be automatically created with the `broken-links` label.

## Publishing a new blog post

A new blog post should be authored within the `/src/blog` directory. It should have its own subdirectory. The name of the subdirectory will become the URL route, e.g. `/src/blog/42-foo/index.md` will become `rupertmckay.com/blog/42-foo`. I maintain a convention of prefixing the directories with a number in order to keep the directories chronologically ordered in the source code. The markdown file must be named `index.md` or else its name will be appended to the route URL, e.g. `/src/blog/42-foo/foo.md` will become `rupertmckay.com/blog/42-foo/foo`, which we don't want.

If the post requires any other files, such as images, these can be colocated and referenced plainly using relative URLs.

### Front matter for blog posts

Each blog post should include the following front matter:

```yaml
---
title: Your Post Title
description: A brief description for SEO and social sharing
date: 2024-01-01
layout: layouts/post.njk
socialImage: https://example.com/custom-image.png # Optional: custom social media image
---
```

The `socialImage` field is optional. If not provided, a default image will be used for social media sharing (Open Graph and Twitter cards).

### Computed Data

Blog posts automatically have access to computed data:

- `absoluteUrl` - The full URL of the post (e.g., `https://rupertmckay.com/blog/my-post/`)
- `socialImage` - Defaults to a standard image if not specified in front matter

These values are automatically computed and don't need to be manually added to each post.

## SEO Features

The site includes comprehensive SEO optimizations:

- **Canonical URLs**: Each page has a canonical URL to prevent duplicate content issues
- **Open Graph tags**: Proper OG tags for social media sharing (Facebook, LinkedIn, etc.)
- **Twitter Cards**: Large image cards for Twitter sharing
- **Structured Data**: JSON-LD schema.org markup for articles and website
- **RSS/Atom Feed**: Available at `/feed.xml` with the 10 most recent posts
- **Sitemap**: Auto-generated at `/sitemap.xml` with all blog posts
- **robots.txt**: Search engine crawler instructions at `/static/robots.txt`
