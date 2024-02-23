const fetchAccounts = require("./accounts");
const cancelOrder = require("./cancelOrder");
const fetchOrdereds = require("./ordereds");
const fetchTickers = require("./tickers");
const fetchOrders = require("./orders");
const fetchChance = require("./chance");

const setupApiEndpoints = (app) => {
    app.get("/fetchAccounts", fetchAccounts);
    app.get("/cancelOrder", cancelOrder);
    app.get("/fetchOrdered", fetchOrdereds);
    app.get("/fetchTickers", fetchTickers);
    app.get("/fetchOrders", fetchOrders);
    app.get("/fetchChance", fetchChance);
};

module.exports = setupApiEndpoints;
