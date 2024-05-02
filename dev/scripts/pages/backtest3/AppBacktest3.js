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
        this.data = [];
        this.qqqData = {};
        this.tradeData = [];
        this.count = 30;
        this.totalGain = 0;
        this.totalUnrealizeGain = 0;
        this.template = document.querySelector("#tp-item");
        this.countElement = this.querySelector("input[name=count]");
        this.formElement = this.querySelector("form");
        this.containerElement = this.querySelector("tbody");
        this.onOptionSubmit = this.onOptionSubmit.bind(this);
    }
    connectedCallback() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initialize();
            this.markets = yield this.setMarkets();
            this.runBackTest();
            this.formElement.addEventListener("submit", this.onOptionSubmit);
        });
    }
    disconnectedCallback() {
        this.formElement.removeEventListener("submit", this.onOptionSubmit);
    }
    initialize() {
        this.countElement.value = this.count.toString();
        this.querySelector(".investmentPrice").textContent =
            this.investmentPrice.toLocaleString();
    }
    setMarkets() {
        return __awaiter(this, void 0, void 0, function* () {
            const marketAll = yield this.getMarkets();
            const idx = 20;
            return marketAll.slice(idx, idx + 10).map((m) => m.market);
        });
    }
    getMarkets() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`/fetchMarketAll`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return yield response.json();
        });
    }
    runBackTest() {
        return __awaiter(this, void 0, void 0, function* () {
            const toDate = this.getToDate();
            this.data = yield this.loadData(toDate, (this.count + 30).toString());
            this.qqqData = this.transformData();
            this.tradeData = [];
            this.totalGain = 0;
            this.totalUnrealizeGain = 0;
            this.containerElement.innerHTML = "";
            for (let index = 0; index < this.count; index++) {
                const testMonthData = this.getTestData(index);
                const marketTestRates = this.getMarketTestRates(testMonthData);
                const tradeDate = testMonthData[0].tradeDate;
                console.log(index, tradeDate);
                const sortedMarkets = this.getSortedMarkets(marketTestRates);
                const tradeMarkets = this.getTradeMarkets(sortedMarkets);
                const tradeData = this.getTradeData(tradeMarkets, index);
                const formedTradeData = this.setTradeData(tradeData, index, tradeDate);
                this.tradeData.push(formedTradeData);
                const { tradeProfits, selledProfits, sumGain, SumUnrealizeGain } = this.getTradeProfits(tradeData, index, formedTradeData);
                this.render(index, tradeDate, tradeProfits, selledProfits, sumGain, SumUnrealizeGain);
            }
            this.renderSummary();
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
    transformData() {
        const data = [...this.data];
        let newData = {};
        data.forEach(({ market, candles }) => {
            newData[market] = candles;
        });
        return newData;
    }
    getTestData(index) {
        const testMonthData = this.data.map(({ market, candles }) => {
            const newCandles = candles.slice(index, 30 + index);
            const tradeDate = candles[index + 30].candle_date_time_kst;
            return {
                market,
                candles: newCandles,
                tradeDate,
            };
        });
        return testMonthData;
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
    getMarketTestRates(oneMonthData) {
        const marketTestRates = oneMonthData.map(({ market, candles }) => {
            const startPrice = candles[0].trade_price;
            const lastPrice = candles[candles.length - 1].trade_price;
            const rate = (lastPrice - startPrice) / startPrice;
            return {
                market,
                rate: rate * 100,
            };
        });
        return marketTestRates;
    }
    getSortedMarkets(marketRates) {
        const markets = [...marketRates].sort((a, b) => b.rate - a.rate);
        const sortedMarkets = markets.filter((aMarket) => aMarket.rate > 0);
        return sortedMarkets;
    }
    getTradeMarkets(markets) {
        const newMarkets = markets
            .filter((aMarket) => {
            if (aMarket.rate > 0)
                return aMarket;
        })
            .map((aMarket) => aMarket.market);
        const tradeMarkets = newMarkets.length > 3 ? newMarkets.slice(0, 3) : newMarkets;
        return tradeMarkets;
    }
    getTradeData(tradeMarkets, index) {
        const tradeIndex = 30 + index;
        const tradeData = {};
        tradeMarkets.forEach((market) => {
            tradeData[market] = [
                this.qqqData[market][tradeIndex - 1],
                this.qqqData[market][tradeIndex],
            ];
        });
        return tradeData;
    }
    setTradeData(tradeData, index, date) {
        const tradeIndex = 30 + index;
        const prevTrades = index > 0 && this.tradeData[index - 1].tradeMarkets;
        const prevMarkets = Object.keys(prevTrades);
        let tradeMarkets = {};
        for (const market in tradeData) {
            tradeMarkets[market] = {
                action: prevMarkets.includes(market) ? "Hold" : "Buy",
            };
        }
        const sellMarkets = prevMarkets.filter((prevMarket) => !Object.keys(tradeData).includes(prevMarket));
        return {
            date,
            tradeMarkets,
            sellMarkets,
        };
    }
    getTradeProfits(newTradeData, index, formedTradeData) {
        for (const market in formedTradeData.tradeMarkets) {
            let buyPrice = 0;
            const action = formedTradeData.tradeMarkets[market].action;
            const candles = newTradeData[market];
            switch (action) {
                case "Buy":
                    buyPrice = candles[1].trade_price;
                    break;
                case "Hold":
                    buyPrice =
                        this.tradeData[index - 1].tradeMarkets[market]
                            .buy_price;
                    break;
            }
            formedTradeData.tradeMarkets[market] = Object.assign(Object.assign({}, formedTradeData.tradeMarkets[market]), { buy_price: buyPrice });
        }
        const tradeProfits = Object.entries(newTradeData).map(([market, candles]) => {
            const marketTradeData = formedTradeData.tradeMarkets[market];
            switch (marketTradeData.action) {
                case "Hold":
                    const distance = candles[1].trade_price - marketTradeData.buy_price;
                    const rate = distance / marketTradeData.buy_price;
                    const gain = this.investmentPrice * rate;
                    return {
                        market,
                        rate: rate,
                        gain: gain,
                    };
                default:
                    return {
                        market,
                        rate: 0,
                        gain: 0,
                    };
            }
        });
        const selledProfits = formedTradeData.sellMarkets &&
            formedTradeData.sellMarkets.map((market) => {
                const tradeIndex = 30 + index;
                const buyPrice = this.tradeData[index - 1].tradeMarkets[market].buy_price;
                const aData = this.qqqData[market][30 + index];
                const rate = (aData.trade_price - buyPrice) / buyPrice;
                const gain = this.investmentPrice * rate;
                return {
                    market,
                    rate,
                    gain,
                };
            });
        const sumGain = selledProfits.reduce((acc, value) => {
            return acc + value.gain;
        }, 0);
        const SumUnrealizeGain = [...tradeProfits].reduce((acc, value) => {
            return acc + value.gain;
        }, 0);
        this.totalGain += sumGain;
        this.totalUnrealizeGain = this.totalGain + SumUnrealizeGain;
        return {
            tradeProfits,
            selledProfits,
            sumGain,
            SumUnrealizeGain,
        };
    }
    render(index, tradeDate, tradeProfits, selledProfits, sumGain, SumUnrealizeGain) {
        var _a, _b;
        const cloned = cloneTemplate(this.template);
        const buyContainer = this.renderBuySell(tradeProfits);
        const sellContainer = this.renderBuySell(selledProfits);
        (_a = cloned.querySelector(".tradeMarkets")) === null || _a === void 0 ? void 0 : _a.appendChild(buyContainer);
        (_b = cloned.querySelector(".sellMarkets")) === null || _b === void 0 ? void 0 : _b.appendChild(sellContainer);
        const data = {
            index,
            date: tradeDate,
            SumUnrealizeGain: Math.round(SumUnrealizeGain).toLocaleString(),
            sumGain: Math.round(sumGain).toLocaleString(),
            totalGain: Math.round(this.totalGain).toLocaleString(),
            totalUnrealizeGain: Math.round(this.totalUnrealizeGain).toLocaleString(),
        };
        updateElementsTextWithData(data, cloned);
        this.containerElement.appendChild(cloned);
    }
    renderBuySell(data) {
        const tradeTp = document.querySelector("#tp-trade");
        const container = document.createElement("ul");
        data.map(({ market, rate, gain }) => {
            const tradeData = {
                market,
                rate: (rate * 100).toFixed(2),
                gain: Math.round(gain).toLocaleString(),
            };
            const clonedTrade = cloneTemplate(tradeTp);
            updateElementsTextWithData(tradeData, clonedTrade);
            return clonedTrade;
        }).forEach((cloned) => container.appendChild(cloned));
        return container;
    }
    renderSummary() {
        const priceElement = this.querySelector(".summaryAllPrice");
        const rateElement = this.querySelector(".summaryAllRate");
        const marketsElement = this.querySelector(".markets");
        const countElement = this.querySelector(".count");
        const sumRate = this.totalUnrealizeGain / (this.investmentPrice * 3);
        priceElement.textContent = Math.round(this.totalUnrealizeGain).toLocaleString();
        rateElement.textContent = Math.round(sumRate * 100).toLocaleString();
        marketsElement.textContent = this.markets.join(" | ");
        countElement.textContent = this.count.toString();
    }
    onOptionSubmit(event) {
        event === null || event === void 0 ? void 0 : event.preventDefault();
        const maxSize = Number(this.countElement.getAttribute("max"));
        const value = Number(this.countElement.value);
        this.count = value > maxSize ? maxSize : value;
        this.runBackTest();
    }
}
//# sourceMappingURL=AppBacktest3.js.map