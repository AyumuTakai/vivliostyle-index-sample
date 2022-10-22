const scripts = require("./scripts.js");

module.exports = {
  author: "Sample <sample@example.com>",
  language: "ja",
  size: "A4",
  theme: "./index.css",
  workspaceDir: ".vivliostyle",
  vfm: {
    replace: scripts.replaces(),
  },
  title: "索引作成サンプル",
  entry: ["manuscript01.md", "manuscript02.md", "manuscript03.md", "index.md"],
  entryContext: "./manuscripts",
  toc: "toc.html", // デフォルト値がindex.htmlで索引とまぎらわしいのでtoc.htmlを指定
  tocTitle: "目次",
};
