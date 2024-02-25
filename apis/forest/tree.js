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
    const accountsRes = await accounts();

    // 마켓별로 2개의 예약내역이 없으면 모두 취소하고 매수, 매도 주문
    for (const marketName of myMarkets) {
        const orderedMarket = orderedsData[marketName];
        if (orderedMarket === undefined || orderedMarket.length === 1) {
            // console.log(marketName);

            // 주문 취소
            if (orderedMarket !== undefined) {
                console.log("cancel", marketName);
                await cancelMarketOrders(orderedsData[marketName]);
            }

            // 계좌 정보 가져오기
            const account = accountsRes.accounts.find(
                (acc) => acc.market === marketName
            );

            if (account) {
                // 매수 주문
                buyOrder(account, marketName);

                // 매도 주문
                sellOrder(account, marketName);
            }
        }
    }
};

async function buyOrder(account, market) {
    const bidRate = Math.min(0.1, Math.ceil(account.buy_price / 10000) * 0.01);
    const bidOrderPrice = Math.round(account.avg_buy_price * (1 - bidRate));

    const params = {
        market,
        side: "bid",
        price: transformPrice(market, bidOrderPrice).toString(),
        volume: (account.buy_price / bidOrderPrice).toFixed(8),
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
    let askOrderPrice = Math.round(account.avg_buy_price * 1.1);

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
        "KRW-BCH": 50,
    };

    const roundUnit = roundUnits[market] || 1;
    return Math.round(price / roundUnit) * roundUnit;
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
