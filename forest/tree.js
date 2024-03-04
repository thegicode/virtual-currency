const {
    accounts,
    cancel,
    orders,
    ordereds,
    loadMyMarkets,
} = require("../apis");

const ignoreMarkets = ["KRW-BTC", "KRW-ETH"];

/*  market별 매수, 매도 발생 시(market의 매수, 매도가 없는 경우)
    1. 모든 주문 취소 
    2. 10만원 이하 -5%, 10만원 이상 -10% 매수 예약
    3. 매도 10%
 */

async function cancelMarketOrders(orders) {
    for (const order of orders) {
        try {
            await cancel(order.uuid);
        } catch (error) {
            console.error("Error cancelling order:", error);
        }
    }
}

async function buyOrder(account) {
    // const bidRate = Math.min(0.2, Math.ceil(account.buy_price / 10000) * 0.01); // 최대 20%
    const bidRate = Math.round(account.buy_price / 10000) * 0.01; // 하락하는 금액만큼 하락률 증가
    const bidOrderPrice = account.avg_buy_price * (1 - bidRate);

    const buyPrice = Math.round(account.buy_price / 10000) * 10000; // 10000원 단위로 끝나지 않는 가격인 경우
    const filledBuyPrice = Math.round(
        buyPrice + (buyPrice - account.buy_price)
    ); // 샀던 금액 만큼 구매, 비워진 금액 채워서(예, 10123)

    const params = {
        market: account.market,
        side: "bid",
        price: transformPrice(account.market, bidOrderPrice).toString(),
        volume: (filledBuyPrice / bidOrderPrice).toFixed(8),
        ord_type: "limit",
    };

    try {
        const bidOrdersRes = await orders(params);
        console.log("매수 주문 :", account.market, bidOrdersRes);
    } catch (error) {
        console.error("Error buy order:", error);
    }
}

async function sellOrder(account) {
    const askRate = 0.1; // 10%
    // if (marketsPart2.includes(account.market)) {
    //     askRate = account.buy_price > 50000 ? 0.1 : 0.05;
    // }

    const askOrderPrice = account.avg_buy_price * (1 + askRate);

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

// 첫 매수 주문
async function buyOrderFirst(market) {
    const params = {
        market,
        side: "bid",
        price: 10000,
        ord_type: "price",
    };

    try {
        const bidOrdersRes = await orders(params);
        console.log("첫 매수 주문 :", market, bidOrdersRes);
    } catch (error) {
        console.error("Error buy order:", error);
    }
}

// 첫 거래
async function firstTransaction(marketName) {
    const response = await buyOrderFirst(marketName);
    if (!response) return;
    await buyOrder(response);
    await sellOrder(response);
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

module.exports = async function tree() {
    let myMarkets = [];
    let orderedsData = {};
    let accountsRes = {};
    try {
        myMarkets = await loadMyMarkets();
        orderedsData = await ordereds();
        accountsRes = await accounts();
    } catch (error) {
        console.error("Error loading data:", error.name, error.message);
        return; // 데이터 로딩 실패 시 함수 종료
    }

    // 마켓별로 2개의 예약내역이 없으면 모두 취소하고 매수, 매도 주문
    for (const marketName of myMarkets) {
        if (ignoreMarkets.includes(marketName)) continue;

        const orderedMarket = orderedsData[marketName];

        const isOnlyOrder = orderedMarket && orderedMarket.length === 1;

        if (isOnlyOrder) {
            console.log("Cancel orders for", marketName);
            await cancelMarketOrders(orderedMarket);
        }

        // 계좌 정보 가져오기
        if (orderedMarket === undefined || isOnlyOrder) {
            const account = accountsRes.accounts.find(
                (acc) => acc.market === marketName
            );

            // if (willDeleteMarkets.includes(account)) return;

            if (account) {
                await buyOrder(account); // 매수 주문
                await sellOrder(account); // 매도 주문
            } else {
                await firstTransaction(marketName);
            }
        }
    }
};
