const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    // progress: true,
    liveReload: false,hot:false,
    host: '0.0.0.0',  // Allow access from any IP
    static: {
      directory: path.join(__dirname),
    },
  },
});
