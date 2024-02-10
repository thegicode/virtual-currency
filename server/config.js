const path = require("path");

const isProduction = (process.env.NODE_ENV || "development") === "production";
const environmentFolder = isProduction ? "static" : "dev";
const port = isProduction ? 1234 : 1111;

const rootPath = path.join(__dirname, "..");
const staticPath = path.join(rootPath, environmentFolder);

module.exports = { isProduction, staticPath, port };
