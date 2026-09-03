export default function (eleventyConfig) {
  // Static passthrough
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });
  eleventyConfig.addPassthroughCopy({ "images": "images" });

  eleventyConfig.addWatchTarget("src/assets/");

  // --- Filters ---
  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  eleventyConfig.addFilter("isoDate", (d) =>
    new Date(d).toISOString().slice(0, 10)
  );

  // Active-nav helper: is `href` the current section?
  eleventyConfig.addFilter("isCurrent", function (href, pageUrl) {
    if (href === "/") return pageUrl === "/";
    return pageUrl.startsWith(href);
  });

  // --- Collections ---
  eleventyConfig.addCollection("journal", (api) =>
    api.getFilteredByGlob("src/journal/*.md").reverse()
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html", "11ty.js"],
  };
}
