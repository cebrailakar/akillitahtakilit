const rules = require("./webpack.rules.js");

/** @type {import('webpack').Configuration} */
const mainConfig = {
  entry: "./src/index.ts",
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
};

module.exports = mainConfig;