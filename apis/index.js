const accounts = require("./accounts");
const ordersChance = require("./ordersChance");
const ticker = require("./ticker");

const setupApiEndpoints = (app) => {
    app.get("/accounts", accounts);
    app.get("/orders-chance", ordersChance);
    app.get("/ticker", ticker);
};

module.exports = setupApiEndpoints;
