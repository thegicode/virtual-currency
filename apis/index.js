const { fetchAccounts, accounts } = require("./accounts");
const { fetchCancel, cancel } = require("./cancel");
const { fetchCandles, candles } = require("./candles");
const { fetchCandlesMinutes, candlesMinutes } = require("./candlesMinutes");
const { fetchChance, chance } = require("./chance");
const { orders, fetchOrders } = require("./orders");
const { marketAll, fetchMarketAll } = require("./marketAll");
const ordereds = require("./ordereds");
const ordersChance = require("./ordersChance");
const fetchTickers = require("./tickers");
const loadMyMarkets = require("./loadMyMarkets");

module.exports = {
    fetchAccounts,
    accounts,
    fetchCancel,
    cancel,
    fetchChance,
    fetchCandles,
    candles,
    fetchCandlesMinutes,
    candlesMinutes,
    chance,
    marketAll,
    fetchMarketAll,
    ordereds,
    orders,
    fetchOrders,
    ordersChance,
    fetchTickers,
    loadMyMarkets,
};
