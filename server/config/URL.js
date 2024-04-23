const server = "https://api.upbit.com/";

module.exports = {
    accounts: `${server}/v1/accounts`,
    api_keys: `${server}/v1/api_keys`,
    candles_days: `${server}/v1/candles/days`,
    candles_minutes: `${server}/v1/candles/minutes`,
    market_all: `${server}/v1/market/all`,
    order: `${server}/v1/order`,
    orders: `${server}/v1/orders`,
    orders_chance: `${server}/v1/orders/chance`,
    ticker: `${server}/v1/ticker`,
};
