const {
    fetchAccounts,
    fetchCancel,
    fetchCandles,
    fetchCandlesMinutes,
    ordereds,
    fetchTickers,
    fetchOrders,
    fetchMarketAll,
} = require("./index");

const {
    handleDailyMABacktest,
} = require("../backend/dist/controllers/dailyMovingAverageBacktestController");

const setupApiEndpoints = (app) => {
    app.get("/fetchAccounts", fetchAccounts);
    app.get("/fetchCancel", fetchCancel);
    app.get("/fetchCandles", fetchCandles);
    app.get("/fetchCandlesMinutes", fetchCandlesMinutes);
    app.get("/fetchOrdereds", ordereds);
    app.get("/fetchTickers", fetchTickers);
    app.get("/fetchOrders", fetchOrders);
    app.get("/fetchMarketAll", fetchMarketAll);
    // app.get("/fetchChance", fetchChance);
    app.get("/fetchDailyMABacktest", handleDailyMABacktest);
};

module.exports = setupApiEndpoints;
