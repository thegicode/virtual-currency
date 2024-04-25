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
        this.data = {};
    }
    connectedCallback() {
        this.story();
    }
    story() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("1일");
            const toDate = this.getTestDate(0);
            const oneMonthData = yield this.loadData(toDate, "3");
            this.data = this.setData(oneMonthData);
            const marketWithRates = this.getMarketWithRates(oneMonthData);
            const sortedMarkets = this.getSortedMarkets(marketWithRates);
            const tradeMarkets = this.getTradeMarkets(sortedMarkets);
            const marketsData = yield this.loadTradeData(tradeMarkets, toDate);
            const profit = yield this.calculateProfit(marketsData);
            this.profit.push(profit);
            console.log("profit", this.profit, this.data);
            {
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    console.log("");
                    console.log("2일");
                    const toDate = this.getTestDate(1);
                    const oneDayData = yield this.loadData(toDate, "1");
                    console.log(oneDayData);
                    const oneDayDataMarkets = oneDayData.map((aData) => aData.market);
                    for (const market in this.data) {
                        const index = oneDayDataMarkets.indexOf(market);
                        this.data[market].push(oneDayData[index].candles[0]);
                        this.data[market].shift();
                    }
                    console.log(this.data);
                }), 1000);
            }
        });
    }
    setData(marketsArray) {
        const result = marketsArray.reduce((obj, item) => {
            obj[item.market] = item.candles;
            return obj;
        }, {});
        return result;
    }
    loadData(toDate, count) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = this.markets.map((market) => __awaiter(this, void 0, void 0, function* () {
                const candles = yield this.getCandles(market, count, toDate);
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
    calculateProfit(marketsData) {
        return __awaiter(this, void 0, void 0, function* () {
            return marketsData
                .map((aMarket, index) => {
                const distance = aMarket[1].trade_price - aMarket[0].trade_price;
                const rate = distance / aMarket[0].trade_price;
                return this.investmentPrice * rate;
            })
                .reduce((acc, value) => {
                return acc + value;
            }, 0);
        });
    }
    loadTradeData(markets, toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const newToDate = this.getTradeDate(toDate);
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
//# sourceMappingURL=AppBacktest3_2.js.map