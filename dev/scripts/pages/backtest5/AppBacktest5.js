var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class AppBacktest5 extends HTMLElement {
    constructor() {
        super();
        this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
        this.count = 10;
        this.totalInvestmentAmount = 1000000;
        this.investmentAmount =
            this.totalInvestmentAmount / this.markets.length;
        this.k = 0.5;
        this.overviewCustomElement = this.querySelector("backtest-overview");
        this.controlCustomElement = this.querySelector("backtest-control");
        this.tableCustomElement = this.querySelector("backtest-table");
    }
    connectedCallback() {
        this.runBackTest();
    }
    runBackTest() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const market of this.markets) {
                console.log(market);
                try {
                    const data = yield this.fetchData(market, (this.count + 1).toString());
                    const realprices = yield this.getRealPrices(data);
                    const result = this.backtest(data, realprices);
                    this.render(result);
                }
                catch (error) {
                    console.error("Error in runBackTest:", error);
                }
            }
            this.tableCustomElement.initialSet();
        });
    }
    backtest(fetchedData, orginRealPrices) {
        const realPrices = orginRealPrices.slice(1);
        const strategedData = this.strategy(fetchedData, realPrices);
        const calculatedData = this.calculateProfits(strategedData);
        return calculatedData;
    }
    strategy(fetchedData, realPrices) {
        const result = fetchedData
            .slice(1)
            .map((aData, index) => {
            const prevData = fetchedData[index];
            const range = prevData.high_price - prevData.low_price;
            const realPrice = realPrices[index].price;
            const standardPrice = aData.opening_price + range * this.k;
            const buyCondition = realPrice > standardPrice;
            return {
                market: aData.market,
                date: aData.candle_date_time_kst,
                range,
                standardPrice,
                buyCondition,
                action: buyCondition ? "Trade" : "Reserve",
                buyPrice: realPrice,
                sellPrice: aData.trade_price,
            };
        });
        return result;
    }
    calculateProfits(data) {
        let sumProfit = 0;
        const result = data.map((aData) => {
            switch (aData.action) {
                case "Trade":
                    const rate = aData.sellPrice && aData.buyPrice
                        ? (aData.sellPrice - aData.buyPrice) /
                            aData.buyPrice
                        : 0;
                    const profit = rate * this.investmentAmount;
                    sumProfit += profit;
                    return Object.assign(Object.assign({}, aData), { rate,
                        profit,
                        sumProfit });
                default:
                    return Object.assign(Object.assign({}, aData), { buyPrice: null, sellPrice: null, sumProfit });
            }
        });
        return result;
    }
    getRealPrices(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const realprices = [];
            for (const aData of data) {
                const date = aData.candle_date_time_kst;
                const toDate = date.replace("T09:00:00", "T13:00:00+09:00");
                const response = yield this.fetchMinutes(aData.market, "60", "1", toDate);
                const price = response[0].opening_price;
                realprices.push({
                    date,
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
    render(data) {
        this.controlCustomElement.render();
        this.tableCustomElement.render(data);
        this.overviewCustomElement.redner(data);
    }
    initialize() {
        this.controlCustomElement.initialize();
        this.overviewCustomElement.initialize();
        this.tableCustomElement.initialize();
    }
}
//# sourceMappingURL=AppBacktest5.js.map