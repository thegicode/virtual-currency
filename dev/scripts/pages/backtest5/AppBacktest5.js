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
        this.tradeData = [];
        this.markets = ["KRW-NEAR"];
        this.market = this.markets[0];
        this.count = 60;
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
        });
    }
    backtest(fetchedData, orginRealPrices) {
        const data = fetchedData.slice(1);
        const realPrices = orginRealPrices.slice(1);
        let sumProfit = 0;
        let action = "";
        const result = data.map((aData, index) => {
            const prevData = fetchedData[index];
            const range = prevData.high_price - prevData.low_price;
            const realPrice = realPrices[index].price;
            const standardPrice = aData.opening_price + range * this.k;
            const buyCondition = realPrice > standardPrice;
            if (index === 0) {
                action = buyCondition ? "Buy" : "Reserve";
            }
            else {
            }
            debugger;
            const buyPrice = realPrice;
            const sellPrice = aData.trade_price;
            const rate = !buyCondition ? (sellPrice - buyPrice) / buyPrice : 0;
            const profit = !buyCondition ? rate * this.investmentAmount : 0;
            sumProfit += profit;
            return {
                market: aData.market,
                date: aData.candle_date_time_kst,
                range,
                buyCondition,
                action,
                standardPrice,
                buyPrice: buyCondition ? buyPrice : 0,
                sellPrice: !buyCondition ? sellPrice : 0,
                rate,
                profit,
                sumProfit,
            };
        });
        return result;
    }
    getRealPrices(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const realprices = [];
            for (const aData of data) {
                const date = aData.candle_date_time_kst;
                const toDate = date.replace("T09:00:00", "T13:00:00+09:00");
                const response = yield this.fetchMinutes("60", "1", toDate);
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
    fetchMinutes(unit, fetchCount, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchParams = new URLSearchParams({
                market: this.market,
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
        this.tableCustomElement.render(data);
    }
}
//# sourceMappingURL=AppBacktest5.js.map