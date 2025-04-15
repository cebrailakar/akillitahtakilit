const TerserPlugin = require("terser-webpack-plugin");
const rules = require("./webpack.rules.js");

/** @type {import('webpack').Configuration} */
const mainConfig = {
  entry: "./src/index.ts",
  devtool: false,
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 2020,
          compress: {
            passes: 2,
            drop_console: true, // Konsol loglarını kaldırır
          },
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
};

module.exports = mainConfig;
