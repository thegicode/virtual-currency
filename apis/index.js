const accounts = require("./accounts");
const ordered = require("./ordered");
const cancel = require("./cancel");
const ticker = require("./ticker");

const setupApiEndpoints = (app) => {
    app.get("/accounts", accounts);
    app.get("/cancel", cancel);
    app.get("/ordered", ordered);
    app.get("/ticker", ticker);
};

module.exports = setupApiEndpoints;
