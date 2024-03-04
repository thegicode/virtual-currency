const { cancel, orders } = require("../apis");

async function buyOrder(account, { bidPrice, buyPrice }) {
    const params = {
        market: account.market,
        side: "bid",
        price: transformPrice(account.market, bidPrice).toString(),
        volume: (buyPrice / bidPrice).toFixed(8),
        ord_type: "limit",
    };

    try {
        const bidOrdersRes = await orders(params);
        console.log("매수 주문 :", account.market, bidOrdersRes);
    } catch (error) {
        console.error("Error buy order:", error);
    }
}

async function sellOrder(account, askOrderPrice) {
    const params = {
        market: account.market,
        side: "ask",
        price: transformPrice(account.market, askOrderPrice).toString(),
        volume: account.volume.toString(),
        ord_type: "limit",
    };

    try {
        const askOrdersRes = await orders(params);
        console.log("매도 주문 :", account.market, askOrdersRes);
    } catch (error) {
        console.error("Error sell order:", error);
    }
}

async function cancelMarketOrders(orders) {
    for (const order of orders) {
        try {
            await cancel(order.uuid);
        } catch (error) {
            console.error("Error cancelling order:", error);
        }
    }
}

function transformPrice(market, price) {
    const roundUnits = {
        "KRW-BTC": 1000,
        "KRW-ETH": 1000,
        "KRW-BCH": 50,
    };

    const roundUnit = roundUnits[market] || 1;

    const result =
        price > 1000
            ? Math.round(price / roundUnit) * roundUnit
            : price.toFixed(1);

    return result;
}

function formatTime(date) {
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Seoul",
    };
    return new Intl.DateTimeFormat("ko-KR", options).format(date);
}

module.exports = {
    buyOrder,
    sellOrder,
    cancelMarketOrders,
    // transformPrice,
    formatTime,
};
