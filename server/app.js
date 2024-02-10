const { isProduction, staticPath, port } = require("./config.js");
const staicRoutes = require("./staticRoutes.js");
const express = require("express");
const app = express();

console.log(isProduction, port);

app.use(express.static(staticPath));

staicRoutes(app, staticPath);

app.listen(port, () => {
    console.log(`Start: http://localhost:${port}`);
});
