const common = require("./webpack.common.js");
const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = merge(common, {
  entry: {
    anichart: "./src/index.ts",
    test: "./test/index.ts",
  },
  devtool: "source-map",
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
  output: {
    filename: "[name].js",
    chunkFilename: "[name].bundle.js",
  },
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./test",
    index: "index.html",
  },
  module: {
    rules: [
      {
        test: /\.csv/,
        loader: "file-loader",
        options: {
          outputPath: "data",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Test",
      meta: {
        referrer: "never",
      },
    }),
  ],
});
