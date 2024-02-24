const fetchAccounts = require("./accounts");
const { fetchCancel } = require("./cancel");
const fetchOrdereds = require("./ordereds");
const fetchTickers = require("./tickers");
const fetchOrders = require("./orders");
const fetchChance = require("./chance");

const setupApiEndpoints = (app) => {
    app.get("/fetchAccounts", fetchAccounts);
    app.get("/fetchCancel", fetchCancel);
    app.get("/fetchOrdereds", fetchOrdereds);
    app.get("/fetchTickers", fetchTickers);
    app.get("/fetchOrders", fetchOrders);
    app.get("/fetchChance", fetchChance);
};

module.exports = setupApiEndpoints;
