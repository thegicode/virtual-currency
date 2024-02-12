const accounts = require("./accounts");
const ticker = require("./ticker");

const setupApiEndpoints = (app) => {
    app.get("/accounts", accounts);
    app.get("/ticker", ticker);
};

module.exports = setupApiEndpoints;
