const { fetchAccounts, accounts } = require("./accounts");
const { fetchCancel, cancel } = require("./cancel");
const { fetchChance, chance } = require("./chance");
const { orders, fetchOrders } = require("./orders");
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
    chance,
    ordereds,
    orders,
    fetchOrders,
    ordersChance,
    fetchTickers,
    loadMyMarkets,
};
