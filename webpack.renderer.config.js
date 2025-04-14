const rules = require("./webpack.rules.js");

// Add CSS rule
rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

/** @type {import('webpack').Configuration} */
const rendererConfig = {
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    fallback: {
      "fs": false,
      "path": require.resolve("path-browserify"),
      "crypto": false,
      "os": false,
      "net": false,
      "tls": false,
      "child_process": false
    }
  }
};

module.exports = rendererConfig;
