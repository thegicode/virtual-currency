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

module.exports = async function tree() {
    const myMarkets = await loadMyMarkets();
    const orderedsData = await ordereds();

    const changedMarkets = Object.keys(orderedsData).filter(
        (market) => orderedsData[market].length !== 2
    );

    // 마켓별로 2개의 예약내역이 없으면 모두 취소하고 매수, 매도 주문
    for (const market of changedMarkets) {
        // 주문 취소
        await cancelMarketOrders(orderedsData[market]);

        // 계좌 정보 가져오기
        const accountsRes = await accounts();
        const account = accountsRes.accounts.find(
            (acc) => acc.market === market
        );

        if (account) {
            // 매수 주문
            buyOrder(account, market);
            // 매도 주문
            sellOrder(account, market);
        }
    }
};

async function buyOrder(account, market) {
    const bidRate = account.buy_price > 100000 ? 0.1 : 0.05;
    const bidOrderPrice = Math.round(account.avg_buy_price * (1 - bidRate));

    console.log("bidRate", bidRate);
    console.log("bidOrderPrice", bidOrderPrice);

    try {
        const bidOrdersRes = await orders({
            market,
            side: "bid",
            price: bidOrderPrice.toString(),
            volume: (account.buy_price / bidOrderPrice).toString(),
            ord_type: "limit",
        });
        console.log("매수 주문 완료:", bidOrdersRes);
    } catch (error) {
        console.error("Error buy order:", error);
    }
}

async function sellOrder(account, market) {
    const askOrderPrice = Math.round(account.avg_buy_price * 1.1);
    try {
        const askOrdersRes = await orders({
            market,
            side: "ask",
            price: askOrderPrice.toString(),
            volume: account.volume.toString(),
            ord_type: "limit",
        });
        console.log("매도 주문 완료:", askOrdersRes);
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

// { account
//     currency: 'SBD',
//     balance: 7.48648155,
//     locked: 0,
//     avg_buy_price: 5342.96380811,
//     avg_buy_price_modified: false,
//     unit_currency: 'KRW',
//     market: 'KRW-SBD',
//     volume: 7.48648155,
//     buy_price: 39999.999971733254
//   }
