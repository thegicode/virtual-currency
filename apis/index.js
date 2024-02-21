const fetchAccounts = require("./accounts");
const cancelOrder = require("./cancelOrder");
const fetchOrdereds = require("./ordereds");
const fetchTickers = require("./tickers");

const setupApiEndpoints = (app) => {
    app.get("/fetchAccounts", fetchAccounts);
    app.get("/cancelOrder", cancelOrder);
    app.get("/fetchOrdered", fetchOrdereds);
    app.get("/fetchTickers", fetchTickers);
};

module.exports = setupApiEndpoints;
