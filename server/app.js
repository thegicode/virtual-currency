const express = require("express");
const app = express();

const { isProduction, staticPath, port } = require("./config");
const setupApiEndpoints = require("../apis/setupApiEndpoints");
const setupStaticHtmlRoutes = require("./setupStaticHtmlRoutes");

console.log("isProduction: ", isProduction);
console.log("port: ", port);
console.log("staticPath: ", staticPath);

app.use(express.static(staticPath));

setupApiEndpoints(app);
setupStaticHtmlRoutes(app, staticPath);

app.listen(port, () => {
    console.log(`Start: http://localhost:${port}`);
});
