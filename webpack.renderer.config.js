const TerserPlugin = require("terser-webpack-plugin");
const rules = require("./webpack.rules.js");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

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
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 2020,
          compress: {
            passes: 2,
            drop_console: true,
          },
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
  },
};

module.exports = rendererConfig;
