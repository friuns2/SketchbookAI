const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Calculate port based on directory path hash
function getPortFromPath(dirPath) {
  const hash = crypto.createHash('md5').update(dirPath).digest('hex');
  // Convert first 4 characters of hash to a number and map to port range 8000-9000
  const hashValue = parseInt(hash.substring(0, 4), 16);
  const port = 8000 + (hashValue % 1000);
  return port;
}

const projectPort = getPortFromPath(__dirname);
console.log(`Using port ${projectPort} based on directory path: ${__dirname}`);

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    // progress: true,
    liveReload: false,hot:false,
    host: '0.0.0.0',  // Allow access from any IP
    port: projectPort,
    static: {
      directory: path.join(__dirname),
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }

      middlewares.unshift({
        name: "examples-api",
        path: "/api/examples",
        middleware: (req, res) => {
          const examplesDir = path.join(__dirname, "examples");
          fs.readdir(examplesDir, (err, files) => {
            if (err) {
              res.status(500).send("Error reading examples directory");
              return;
            }
            res.json(files.filter(file => file.endsWith(".ts")));
          });
        },
      });

      return middlewares;
    },
  },
});
