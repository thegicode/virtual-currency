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
    // markets
    const myMarkets = await loadMyMarkets();
    // console.log("myMarkets", myMarkets);

    // ordereds
    const orderedsData = await ordereds();
    // console.log("getOrdereds", orderedsData);

    // get changed market
    const changedMarket = Object.keys(orderedsData).filter((market) => {
        if (orderedsData[market].length !== 2) {
            return market;
        }
    });
    // console.log("changedMarket", changedMarket);

    // remain order cancel
    // 마켓별로 2개의 예약내역이 없으면 모두 취소하고 매수, 매도 주문
    changedMarket.forEach(async (market) => {
        // 주문 취소
        const remainOrdereds = orderedsData[market];
        remainOrdereds.forEach(async (order) => {
            cancel(order.uuid);
        });

        // get Accounts
        const accountsRes = await accounts();
        const { accounts: accountsData } = accountsRes;

        const account = accountsData.filter(
            (account) => account.market === market
        )[0];

        // 매수 주문
        const bidRate = account.buy_price > 100000 ? 0.1 : 0.05;
        const bidOrderPrice = Math.round(
            account.avg_buy_price - account.avg_buy_price * bidRate
        );
        const bidParams = {
            market,
            side: "bid",
            price: bidOrderPrice.toString(),
            volume: (account.buy_price / bidOrderPrice).toString(),
            ord_type: "limit",
        };
        const bidOrdersRes = await orders(bidParams);
        console.log("매수 ", bidOrdersRes);

        // 매도 주문
        const askOrderPrice = Math.round(
            account.avg_buy_price + account.avg_buy_price * 0.1
        );
        const askParams = {
            market,
            side: "ask",
            price: askOrderPrice.toString(),
            volume: account.volume.toString(),
            ord_type: "limit",
        };
        const askOrdersRes = await orders(askParams);
        console.log("매도 ", askOrdersRes);
    });
};

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
