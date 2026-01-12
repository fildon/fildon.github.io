const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
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
};
