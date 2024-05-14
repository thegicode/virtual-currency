var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { applyStandardMovingAverages } from "@app/scripts/components/backtest/movingAverage";
import { volatilityBreakout } from "@app/scripts/components/backtest/volatility";
export default class AppBacktest8 extends HTMLElement {
    constructor() {
        super();
        this.markets = [
            "KRW-BTC",
            "KRW-ETH",
            "KRW-DOGE",
            "KRW-XRP",
            "KRW-NEAR",
        ];
        this.count = 30;
        this.totalInvestmentAmount = 1000000;
        this.investmentAmount =
            this.totalInvestmentAmount / this.markets.length;
        this.targetRate = 2;
        this.tradeCount = 0;
        this.controlIndex = 19;
        this.k = 0.1;
        this.overviewCustomElement = this.querySelector("backtest-overview");
        this.controlCustomElement = this.querySelector("backtest-control");
        this.tableCustomElement = this.querySelector("backtest-table");
    }
    connectedCallback() {
        return __awaiter(this, void 0, void 0, function* () {
            this.runBackTest();
        });
    }
    runBackTest() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const market of this.markets) {
                console.log(market);
                try {
                    const data = yield this.fetchData(market, (this.count + this.controlIndex).toString());
                    const realprices = yield this.getRealPrices(data);
                    const result = this.backtest(data, realprices);
                    this.render(result, this.markets.indexOf(market));
                }
                catch (error) {
                    console.error("Error in runBackTest:", error);
                }
            }
        });
    }
    backtest(fetchedData, orginRealPrices) {
        const movingAverageData = applyStandardMovingAverages(fetchedData);
        const strategedData = this.processTradingDecisions(movingAverageData, orginRealPrices);
        const calculatedData = this.calculateProfits(strategedData);
        return calculatedData;
    }
    processTradingDecisions(fetchedData, realPrices) {
        const relevantData = fetchedData.slice(this.controlIndex);
        const result = relevantData.map((candleData, index) => {
            const isOverMovingAverage = this.checkOverMovingAverage(candleData);
            const { previousCandle, nextCandle, currentRealPrice } = this.getProcessData(fetchedData, realPrices, index);
            this.verifyDataConsistency(candleData, realPrices, index);
            const { range, standardPrice, isBreakout, prevVolatilityRate } = volatilityBreakout(previousCandle, currentRealPrice, candleData.opening_price, this.k);
            const tradeCondition = Boolean(isOverMovingAverage && isBreakout);
            const investmentAmount = this.calculateInvestmentAmount(tradeCondition, prevVolatilityRate);
            const nextDayOpningPrice = this.getNextDayOpeningPrice(realPrices, index);
            return {
                market: candleData.market,
                date: candleData.candle_date_time_kst,
                openingPrice: candleData.opening_price,
                range,
                standardPrice,
                buyCondition: tradeCondition,
                action: tradeCondition ? "Trade" : "Reserve",
                volatilityRate: prevVolatilityRate,
                buyPrice: currentRealPrice,
                sellPrice: nextCandle ? nextCandle.opening_price : null,
                investmentAmount,
            };
        });
        return result;
    }
    checkOverMovingAverage(candleData) {
        if (!candleData.moving_average_3 ||
            !candleData.moving_average_5 ||
            !candleData.moving_average_10 ||
            !candleData.moving_average_20)
            return null;
        const result = candleData.trade_price > candleData.moving_average_3 &&
            candleData.trade_price > candleData.moving_average_5 &&
            candleData.trade_price > candleData.moving_average_10 &&
            candleData.trade_price > candleData.moving_average_20
            ? true
            : false;
        return result;
    }
    getProcessData(fetchedData, realPrices, index) {
        const previousCandle = fetchedData[index + this.controlIndex - 1];
        const nextCandle = fetchedData[index + this.controlIndex + 1];
        const currentRealPrice = realPrices[index + this.controlIndex].price;
        return {
            previousCandle,
            nextCandle,
            currentRealPrice,
        };
    }
    verifyDataConsistency(candleData, realPrices, index) {
        if (candleData.candle_date_time_kst.slice(0, 10) !==
            realPrices[index + this.controlIndex].date.slice(0, 10)) {
            throw new Error("Data date and real price date mismatch.");
        }
    }
    calculateInvestmentAmount(tradeCondition, prevVolatilityRate) {
        if (!tradeCondition)
            return 0;
        const investmentRatio = this.targetRate / prevVolatilityRate / this.markets.length;
        return investmentRatio * this.totalInvestmentAmount;
    }
    getNextDayOpeningPrice(realPrices, index) {
        if (!realPrices[index + this.controlIndex + 1])
            return null;
        return realPrices[index + this.controlIndex + 1].price;
    }
    calculateProfits(data) {
        let sumProfit = 0;
        let tradeCount = 0;
        const result = data.map((aData) => {
            switch (aData.action) {
                case "Trade":
                    const rate = aData.sellPrice && aData.buyPrice
                        ? (aData.sellPrice - aData.buyPrice) /
                            aData.buyPrice
                        : 0;
                    const profit = aData.investmentAmount
                        ? rate * aData.investmentAmount
                        : 0;
                    sumProfit += profit;
                    tradeCount++;
                    return Object.assign(Object.assign({}, aData), { rate,
                        profit,
                        sumProfit });
                default:
                    return Object.assign(Object.assign({}, aData), { buyPrice: null, sellPrice: null, sumProfit });
            }
        });
        this.tradeCount = tradeCount;
        return result;
    }
    getRealPrices(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const realprices = [];
            for (const aData of data) {
                const date = aData.candle_date_time_kst;
                const toDate = date.replace("T09:00:00", "T11:00:00+09:00");
                const response = yield this.fetchMinutes(aData.market, "60", "1", toDate);
                const price = response[0].opening_price;
                realprices.push({
                    date: response[0].candle_date_time_kst,
                    price,
                });
                yield this.delay(100);
            }
            return realprices;
        });
    }
    fetchData(market, count) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchParams = new URLSearchParams({
                market: market,
                count,
            });
            const response = yield fetch(`/fetchCandles?${searchParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return yield response.json();
        });
    }
    fetchMinutes(market, unit, fetchCount, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchParams = new URLSearchParams({
                market: market,
                count: fetchCount,
                unit,
                to,
            });
            const response = yield fetch(`/fetchCandlesMinutes?${searchParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return yield response.json();
        });
    }
    delay(duration) {
        return new Promise((resolve) => setTimeout(resolve, duration));
    }
    render(data, index) {
        this.controlCustomElement.render();
        this.overviewCustomElement.redner(data);
        this.tableCustomElement.render(data, index);
    }
    initialize() {
        this.controlCustomElement.initialize();
        this.overviewCustomElement.initialize();
        this.tableCustomElement.initialize();
    }
}
//# sourceMappingURL=AppBacktest8.js.map