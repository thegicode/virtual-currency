const {
    fetchAccounts,
    fetchCancel,
    ordereds,
    fetchTickers,
    fetchOrders,
} = require("./index");

const setupApiEndpoints = (app) => {
    app.get("/fetchAccounts", fetchAccounts);
    app.get("/fetchCancel", fetchCancel);
    app.get("/fetchOrdereds", ordereds);
    app.get("/fetchTickers", fetchTickers);
    app.get("/fetchOrders", fetchOrders);
    // app.get("/fetchChance", fetchChance);
};

module.exports = setupApiEndpoints;
