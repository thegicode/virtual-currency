const token = require("./token");
const { isProduction, staticPath, port } = require("./config");

console.log("token : ", token);
console.log("isProduction : ", isProduction);
console.log("staticPath : ", staticPath);
console.log("port : ", port);
