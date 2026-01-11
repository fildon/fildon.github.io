const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPassthroughCopy("static");
	eleventyConfig.addPassthroughCopy("src/blog/**/*.{gif,png,jpg,jpeg,svg}");
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
};
