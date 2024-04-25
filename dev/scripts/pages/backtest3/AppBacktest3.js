var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cloneTemplate, updateElementsTextWithData, } from "@app/scripts/utils/helpers";
export default class AppBacktest3 extends HTMLElement {
    constructor() {
        super();
        this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
        this.investmentPrice = 200000;
        this.profit = [];
        this.data = [];
        this.sum = 0;
        this.template = document.querySelector("#tp-item");
    }
    connectedCallback() {
        return __awaiter(this, void 0, void 0, function* () {
            const toDate = this.getToDate();
            this.data = yield this.loadData(toDate, "200");
            this.runBackTest();
        });
    }
    runBackTest() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let index = 0; index < 171; index++) {
                const testMonthData = this.getTestData(index);
                const marketWithRates = this.getMarketWithRates(testMonthData);
                const sortedMarkets = this.getSortedMarkets(marketWithRates);
                const tradeMarkets = this.getTradeMarkets(sortedMarkets);
                const tradeData = this.getTradeData(tradeMarkets, index);
                const { tradeProfits, sumProfits } = this.getTradeProfits(tradeData);
                this.profit.push(sumProfits);
                const tradeDate = testMonthData[0].candles[29].candle_date_time_kst;
                this.render(index, tradeDate, tradeProfits, sumProfits);
            }
            this.sum = this.profit.reduce((acc, value) => {
                return acc + value;
            }, 0);
            const sumElement = this.querySelector(".sum");
            sumElement.textContent = Math.round(this.sum).toLocaleString();
        });
    }
    getToDate() {
        const now = new Date();
        now.setMonth(now.getMonth());
        now.setDate(now.getDate());
        now.setHours(18, 0, 0, 0);
        return now.toISOString().slice(0, 19);
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
    getTestData(index) {
        const testData = this.data.map(({ market, candles }) => {
            const newCandles = candles.slice(index, 30 + index);
            return {
                market,
                candles: newCandles,
            };
        });
        return testData;
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
    getTradeMarkets(markets) {
        const newMarkets = markets
            .filter((aMarket) => {
            if (aMarket.rate > 0)
                return aMarket;
        })
            .map((aMarket) => aMarket.market);
        return newMarkets.length > 3 ? newMarkets.slice(0, 3) : newMarkets;
    }
    getTradeData(tradeMarkets, index) {
        const tradeIndex = 30 + index;
        const marketNames = this.data.map((aMarketData) => aMarketData.market);
        const tradeData = tradeMarkets.map((market) => {
            const index = marketNames.indexOf(market);
            const candles = this.data[index].candles;
            return {
                market,
                candles: [candles[tradeIndex - 1], candles[tradeIndex]],
            };
        });
        return tradeData;
    }
    getTradeProfits(tradeData) {
        const tradeProfits = tradeData.map(({ market, candles }) => {
            const distance = candles[1].trade_price - candles[0].trade_price;
            const rate = distance / candles[0].trade_price;
            const gain = this.investmentPrice * rate;
            return {
                market,
                rate,
                gain,
            };
        });
        const sumProfits = tradeProfits.reduce((acc, value) => {
            return acc + value.gain;
        }, 0);
        return {
            tradeProfits,
            sumProfits,
        };
    }
    render(index, tradeDate, tradeProfits, profit) {
        var _a;
        const ul = document.createElement("ul");
        const tradeTp = document.querySelector("#tp-trade");
        tradeProfits
            .map(({ market, rate, gain }) => {
            const tradeData = {
                market,
                rate: (rate * 100).toFixed(2),
                gain: Math.round(gain).toLocaleString(),
            };
            const clonedTrade = cloneTemplate(tradeTp);
            updateElementsTextWithData(tradeData, clonedTrade);
            return clonedTrade;
        })
            .forEach((cloned) => ul.appendChild(cloned));
        const cloned = cloneTemplate(this.template);
        const data = {
            index,
            date: tradeDate,
            profit: Math.round(profit).toLocaleString(),
        };
        updateElementsTextWithData(data, cloned);
        (_a = cloned.querySelector(".tradeMarkets")) === null || _a === void 0 ? void 0 : _a.appendChild(ul);
        const container = this.querySelector("tbody");
        container.appendChild(cloned);
    }
}
//# sourceMappingURL=AppBacktest3.js.map