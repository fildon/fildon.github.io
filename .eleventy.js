const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPassthroughCopy("static");
	eleventyConfig.addPassthroughCopy(
		"src/{blog,landingpage}/**/*.{gif,png,jpg,jpeg,svg}",
		{
			mode: "html-relative",
			failOnError: true,
		}
	);
	eleventyConfig.addPassthroughCopy({ "./CNAME": "./CNAME" });
	eleventyConfig.addPlugin(syntaxHighlight);
	eleventyConfig.addPlugin(eleventyNavigationPlugin);
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(sitemap, {
		sitemap: {
			hostname: "https://rupertmckay.com",
		},
	});

	let markdownLibrary = markdownIt({
		html: true,
		linkify: true,
	}).use(markdownItAnchor, {
		permalink: markdownItAnchor.permalink.ariaHidden({
			placement: "before",
			class: "direct-link",
			symbol: "#",
		}),
		level: [1, 2, 3, 4],
		slugify: eleventyConfig.getFilter("slugify"),
	});
	eleventyConfig.setLibrary("md", markdownLibrary);

	eleventyConfig.addFilter("readableDate", (dateObj) => {
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
			"dd LLL yyyy"
		);
	});
	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
	});

	/**
	 * This filter enables me to have directories sorted by date prefixes,
	 * but exclude those date prefixes from the final URLs.
	 */
	eleventyConfig.addFilter("stripDatePrefix", (path) => {
		// Extract directory name from path and remove date prefix (YYYY-MM-DD-)
		const parts = path.split("/");
		const dirName = parts[parts.length - 2] || parts[parts.length - 1];
		return dirName.replace(/^\d{4}-\d{2}-\d{2}-/, "");
	});

	// Transform relative image paths to root-absolute paths
	eleventyConfig.addTransform("absoluteImagePaths", function (content, outputPath) {
		if (outputPath && outputPath.endsWith(".html")) {
			// Get the directory of the output file relative to _site
			// e.g., "_site/blog/my-post/index.html" -> "blog/my-post"
			// or "/full/path/_site/blog/my-post/index.html" -> "blog/my-post"
			let outputDir = outputPath;
			
			// Handle both absolute and relative paths
			const siteIndex = outputDir.indexOf("_site/");
			if (siteIndex !== -1) {
				outputDir = outputDir.substring(siteIndex + 6); // Remove everything up to and including "_site/"
			}
			
			// Remove the filename (e.g., "index.html")
			// If there's a slash, extract directory path. If no slash (root level), use empty string
			if (outputDir.includes("/")) {
				outputDir = outputDir.replace(/\/[^\/]*$/, "");
			} else {
				outputDir = ""; // Root level file
			}
			
			// Replace relative image paths with absolute paths
			// Match src="./filename.ext"
			content = content.replace(/(<img[^>]+src=["'])\.\/([^"']+)(["'])/g, (match, prefix, path, suffix) => {
				// Convert ./file.png to /blog/my-post/file.png or /file.png (for root)
				const absolutePath = outputDir ? `/${outputDir}/${path}` : `/${path}`;
				return `${prefix}${absolutePath}${suffix}`;
			});
			
			// Also handle relative paths in link hrefs for images
			content = content.replace(/(<a[^>]+href=["'])\.\/([^"']+\.(gif|png|jpg|jpeg|svg))(["'])/gi, (match, prefix, path, ext, suffix) => {
				const absolutePath = outputDir ? `/${outputDir}/${path}` : `/${path}`;
				return `${prefix}${absolutePath}${suffix}`;
			});
		}
		return content;
	});

	// Watch for changes in CSS files for hot reload during development
	eleventyConfig.addWatchTarget("./static/**/*.css");

	// Set browser sync options for better dev experience
	eleventyConfig.setBrowserSyncConfig({
		files: ["_site/**/*"],
		open: false, // Don't automatically open browser
		notify: false, // Disable browser sync notifications
	});

	// Return explicit configuration
	return {
		dir: {
			input: "src",
			output: "_site",
			includes: "_includes",
			data: "_data",
		},
		// Use Liquid for HTML and Markdown, Nunjucks for .njk files
		markdownTemplateEngine: "liquid",
		htmlTemplateEngine: "njk",
		templateFormats: ["html", "njk", "md", "liquid"],
	};
};
