const loadMyMarkets = require("../helpers/loadMyMarkets");
const ordereds = require("../ordereds");
const { accounts } = require("../accounts");
const { cancel } = require("../cancel");
const { orders } = require("../orders");

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

async function buyOrder(account, market) {
    const bidRate = Math.min(0.1, Math.ceil(account.buy_price / 10000) * 0.01); // 최대 10%
    const bidOrderPrice = Math.round(account.avg_buy_price * (1 - bidRate)); // 매수할 가격

    const buyPrice = Math.round(account.buy_price / 10000) * 10000; // 10000원 단위로 끝나지 않는 가격인 경우
    const filledBuyPrice = Math.round(
        buyPrice + (buyPrice - account.buy_price)
    ); // 샀던 금액 만큼 구매, 비워진 금액 채워서

    const params = {
        market,
        side: "bid",
        price: transformPrice(market, bidOrderPrice).toString(),
        volume: (filledBuyPrice / bidOrderPrice).toFixed(8),
        ord_type: "limit",
    };

    try {
        const bidOrdersRes = await orders(params);
        console.log("매수 주문 :", market, bidOrdersRes);
    } catch (error) {
        console.error("Error buy order:", error);
    }
}

async function sellOrder(account, market) {
    // const askRate = account.buy_price > 50000 ? 0.1 : 0.05;
    const askRate = 0.1; // 10%
    let askOrderPrice = Math.round(account.avg_buy_price * (1 + askRate));

    const params = {
        market,
        side: "ask",
        price: transformPrice(market, askOrderPrice).toString(),
        volume: account.volume.toString(),
        ord_type: "limit",
    };
    try {
        const askOrdersRes = await orders(params);
        console.log("매도 주문 :", market, askOrdersRes);
    } catch (error) {
        console.error("Error sell order:", error);
    }
}

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

function transformPrice(market, price) {
    const roundUnits = {
        "KRW-BTC": 1000,
        "KRW-BCH": 50,
    };

    const roundUnit = roundUnits[market] || 1;
    return Math.round(price / roundUnit) * roundUnit;
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
        const orderedMarket = orderedsData[marketName];
        if (orderedMarket === undefined || orderedMarket.length === 1) {
            // 주문 취소
            if (orderedMarket) {
                console.log("Cancel orders for", marketName);
                await cancelMarketOrders(orderedMarket);
            }

            // 계좌 정보 가져오기
            const account = accountsRes.accounts.find(
                (acc) => acc.market === marketName
            );

            if (account) {
                await buyOrder(account, marketName); // 매수 주문
                await sellOrder(account, marketName); // 매도 주문
            } else {
                await buyOrderFirst(marketName); // 첫 매수 주문
            }
        }
    }
};
