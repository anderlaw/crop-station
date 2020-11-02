const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
  mode: "development",
  entry: "./src/index.js",
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({
      title: "Development",
    }),
  ],
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "main.bundle.js",
  },
  devServer: {
    contentBase: "./dist",
    compress: true,
    port: 1000,
  },
};
