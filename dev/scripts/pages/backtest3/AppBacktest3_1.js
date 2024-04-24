var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { setMovingAverage } from "@app/scripts/components/backtest/movingAverage";
export default class AppBacktest3 extends HTMLElement {
    constructor() {
        super();
        this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
        this.data = [];
        this.investmentPrice = 200000;
    }
    connectedCallback() {
        return __awaiter(this, void 0, void 0, function* () {
            this.data = yield this.loadData();
            this.runProgram();
        });
    }
    disconnectedCallback() { }
    loadData() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = this.markets.map((market) => __awaiter(this, void 0, void 0, function* () {
                const candles = yield this.getCandles(market);
                return {
                    market,
                    candles,
                };
            }));
            return yield Promise.all(promises);
        });
    }
    getCandles(market) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchParams = new URLSearchParams({
                market: market,
                count: "30",
            });
            const response = yield fetch(`/fetchCandles?${searchParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return yield response.json();
        });
    }
    runProgram() {
        this.data = this.data.map((marketData) => {
            let newMarkets = this.movingAverages(marketData);
            newMarkets = this.checkCondition(newMarkets);
            newMarkets = this.setTradingAction(newMarkets);
            newMarkets = this.setProfit(newMarkets);
            return Object.assign({}, newMarkets);
        });
        console.log(this.data);
    }
    movingAverages(marketData) {
        const newCandles = setMovingAverage(marketData.candles, 5);
        return Object.assign(Object.assign({}, marketData), { candles: newCandles });
    }
    checkCondition(marketData) {
        const newCandles = marketData.candles.map((aData) => {
            if (!aData.moving_average_5)
                return aData;
            return Object.assign(Object.assign({}, aData), { condition: aData.trade_price > aData.moving_average_5 });
        });
        return Object.assign(Object.assign({}, marketData), { candles: newCandles });
    }
    setTradingAction(marketData) {
        const newCandles = marketData.candles.map((aData, index) => {
            let tradingAction = "";
            if (index === 0) {
                tradingAction = aData.condition ? "Buy" : "Reserve";
            }
            else {
                const prevCondition = marketData.candles[index - 1].condition;
                if (prevCondition !== aData.condition) {
                    tradingAction = aData.condition ? "Buy" : "Sell";
                }
                else {
                    tradingAction = aData.condition ? "Hold" : "Reserve";
                }
            }
            return Object.assign(Object.assign({}, aData), { tradingAction });
        });
        return Object.assign(Object.assign({}, marketData), { candles: newCandles });
    }
    setProfit(marketData) {
        let buyTradePrice = 0;
        let profit = 0;
        let rate = 0;
        let sumProfit = 0;
        let sumPrice = 0;
        const getRate = (aData) => (aData.trade_price - buyTradePrice) / buyTradePrice;
        const getProfit = (aData) => getRate(aData) * getSumPrice();
        const getSumPrice = () => sumPrice || this.investmentPrice;
        const newCandles = marketData.candles.map((aData) => {
            switch (aData.tradingAction) {
                case "Buy":
                    buyTradePrice = aData.trade_price;
                    profit = 0;
                    rate = 0;
                    sumPrice = getSumPrice();
                    break;
                case "Sell":
                    rate = getRate(aData);
                    profit = getProfit(aData);
                    sumProfit += profit;
                    sumPrice = this.investmentPrice + sumProfit;
                    break;
                case "Hold":
                    break;
                case "Reserve":
                    profit = 0;
                    rate = 0;
                    sumPrice = getSumPrice();
                    break;
            }
            return Object.assign(Object.assign({}, aData), { rate: rate * 100, profit, sumProfit: Number(sumProfit.toFixed(2)), sumPrice: Number(sumPrice.toFixed(2)) });
        });
        return Object.assign(Object.assign({}, marketData), { candles: newCandles });
    }
}
//# sourceMappingURL=AppBacktest3_1.js.map