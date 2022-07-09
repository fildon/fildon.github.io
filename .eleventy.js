const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy({ "./CNAME": "./CNAME" });
  eleventyConfig.addPlugin(syntaxHighlight);
};
