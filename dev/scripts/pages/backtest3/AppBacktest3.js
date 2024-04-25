var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class AppBacktest3 extends HTMLElement {
    constructor() {
        super();
        this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
        this.investmentPrice = 200000;
        this.profit = [];
    }
    connectedCallback() {
        this.story();
    }
    story() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const toDate = this.getTestDate(0);
                const oneMonthData = yield this.loadData(toDate);
                const marketWithRates = this.getMarketWithRates(oneMonthData);
                const sortedMarkets = this.getSortedMarkets(marketWithRates);
                const tradeMarkets = this.getTradeMarkets(sortedMarkets);
                console.log("tradeMarkets", tradeMarkets);
                const profit = yield this.trade(tradeMarkets, toDate);
                this.profit.push(profit);
            }
            catch (error) {
                console.error("An error occurred during the story execution:", error);
            }
        });
    }
    loadData(toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = this.markets.map((market) => __awaiter(this, void 0, void 0, function* () {
                const candles = yield this.getCandles(market, "30", toDate);
                return {
                    market,
                    candles,
                };
            }));
            return yield Promise.all(promises);
        });
    }
    getCandles(market, count, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchParams = new URLSearchParams({
                market: market,
                count,
                to,
            });
            const response = yield fetch(`/fetchCandles?${searchParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return yield response.json();
        });
    }
    getMarketWithRates(oneMonthData) {
        return oneMonthData.map(({ market, candles }) => {
            const startPrice = candles[0].trade_price;
            const lastPrice = candles[candles.length - 1].trade_price;
            const rate = (lastPrice - startPrice) / startPrice;
            return {
                market,
                rate: rate * 100,
            };
        });
    }
    getSortedMarkets(marketRates) {
        const sortedMarkets = [...marketRates].sort((a, b) => b.rate - a.rate);
        const newMarkets = sortedMarkets.filter((aMarket) => aMarket.rate > 0);
        return newMarkets;
    }
    renderSortedMarkets(markets) {
        const resultElement = this.querySelector(".list");
        let markupStrings = "";
        if (markets.length === 0) {
            markupStrings =
                "모든 가상화폐의 30일 수익률이 마이너스입니다. <br>모든 코인을 매도하세요.";
        }
        markets.forEach((aMarket) => {
            markupStrings += `<li><dl><dt>${aMarket.market}</dt><dd>${aMarket.rate.toFixed(2)}%</dd></dl></li>`;
        });
        resultElement.innerHTML = markupStrings;
    }
    getTradeMarkets(markets) {
        const newMarkets = markets
            .filter((aMarket) => {
            if (aMarket.rate > 0)
                return aMarket;
        })
            .map((aMarket) => aMarket.market);
        return newMarkets.length > 3 ? newMarkets.slice(0, 3) : newMarkets;
    }
    trade(markets, toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const marketsData = yield this.loadData2(markets, toDate);
            const result = marketsData
                .map((aMarket, index) => {
                const distance = aMarket[1].trade_price - aMarket[0].trade_price;
                const rate = distance / aMarket[0].trade_price;
                const gain = this.investmentPrice * rate;
                return gain;
            })
                .reduce((acc, value) => {
                return acc + value;
            }, 0);
            return result;
        });
    }
    loadData2(markets, toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const newToDate = this.getTradeDate(toDate);
            console.log("newToDate", newToDate);
            const promises = markets.map((market) => __awaiter(this, void 0, void 0, function* () {
                return yield this.getCandles(market, "2", newToDate);
            }));
            return yield Promise.all(promises);
        });
    }
    getTestDate(index) {
        const now = new Date();
        now.setMonth(now.getMonth() - 1);
        now.setDate(now.getDate() + index);
        now.setHours(18, 0, 0, 0);
        return now.toISOString().slice(0, 19);
    }
    getTradeDate(toDate) {
        const newDate = new Date(toDate);
        newDate.setDate(newDate.getDate() + 1);
        newDate.setHours(18, 0, 0, 0);
        return newDate.toISOString().slice(0, 19);
    }
}
//# sourceMappingURL=AppBacktest3.js.map