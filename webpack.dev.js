const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./src/dev/index",
  cache: false,

  mode: "development",
  devtool: "source-map",

  output: {
    path: path.resolve(__dirname, "dist_dev"),
    clean: true,
  },

  optimization: {
    moduleIds: "deterministic",
  },

  performance: {
    maxEntrypointSize: 512000 * 1024,
    maxAssetSize: 512000 * 1024,
  },

  resolve: {
    extensions: [".jsx", ".js", ".json"],
  },

  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.jsx?$/,
        loader: require.resolve("babel-loader"),
        options: {
          presets: [require.resolve("@babel/preset-react")],
        },
      },
      {
        test: /\.css$/, // Add this rule to handle CSS files
        use: ["style-loader", "css-loader"], // Loaders to handle CSS
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      chunks: ["main"],
      hash: true,
    }),
  ],
};