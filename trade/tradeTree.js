const { accounts, orders, ordereds, loadMyMarkets } = require("../apis");

const { buyOrder, sellOrder, cancelMarketOrders } = require("./orderUtils");

const ignoreMarkets = ["KRW-BTC"];

/*  market별 매수, 매도 발생 시(market의 매수, 매도가 없는 경우)
    1. 모든 주문 취소 
    2. 금액 비중에 따라 매수
    3. 매도 10%
 */

// 첫 거래
async function firstTransaction(marketName) {
    const firstOrdered = await buyOrderFirst(marketName);
    if (!firstOrdered) return;

    const bidPriceData = getBidPrice(firstOrdered);
    const askPrice = getAskPrice(account);

    await buyOrder(firstOrdered, bidPriceData);
    await sellOrder(firstOrdered, askPrice);
}

// 마켓 취소, 매수, 매도 거래
// 마켓별로 2개의 예약내역이 없으면 모두 취소하고 매수, 매도 주문
async function processMarketOrders(marketName, orderedsData, accountsRes) {
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

        if (account) {
            const bidPrice = getBidPrice(account);
            const askPrice = getAskPrice(account);
            await buyOrder(account, bidPrice); // 매수 주문
            await sellOrder(account, askPrice); // 매도 주문
        } else {
            await firstTransaction(marketName);
        }
    }
}

function getBidPrice(account) {
    // const bidRate = Math.min(0.2, Math.ceil(account.buy_price / 10000) * 0.01); // 최대 20%
    const bidRate = Math.round(account.buy_price / 10000) * 0.01; // 하락하는 금액만큼 하락률 증가
    const bidPrice = account.avg_buy_price * (1 - bidRate);

    const buyPrice = Math.round(account.buy_price / 10000) * 10000; // 10000원 단위로 끝나지 않는 가격인 경우
    const filledBuyPrice = Math.round(
        buyPrice + (buyPrice - account.buy_price)
    );

    return {
        bidPrice,
        buyPrice: filledBuyPrice,
    };
}

function getAskPrice(account) {
    const askRate = 0.1; // 10%
    // if (marketsPart2.includes(account.market)) {
    //     askRate = account.buy_price > 50000 ? 0.1 : 0.05;
    // }

    return account.avg_buy_price * (1 + askRate);
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

module.exports = async function tradeTree() {
    try {
        const myMarkets = await loadMyMarkets();
        const orderedsData = await ordereds();
        const accountsRes = await accounts();

        // 보유 마켓 중 미적용 마켓 pass
        const processableMarkets = myMarkets.filter(
            (market) => !ignoreMarkets.includes(market)
        );

        for (const marketName of processableMarkets) {
            await processMarketOrders(marketName, orderedsData, accountsRes);
        }
    } catch (error) {
        console.error("Error loading data:", error.name, error.message);
        return; // 데이터 로딩 실패 시 함수 종료
    }
};
