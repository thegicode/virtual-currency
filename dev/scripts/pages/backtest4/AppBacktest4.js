var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getDaliyVolatility } from "@app/scripts/components/backtest/volatility";
export default class AppBacktest4 extends HTMLElement {
    constructor() {
        super();
        this.tradeData = [];
        this.market = "KRW-ONG";
        this.count = 30;
        this.marketSize = 5;
        this.totalInvestmentPrice = 1000000;
        this.investmentPrice = this.totalInvestmentPrice / this.marketSize;
        this.target = 2;
        this.overviewCustomElement = this.querySelector("backtest-overview");
        this.controlCustomElement = this.querySelector("backtest-control");
        this.tableCustomElement = this.querySelector("backtest-table");
    }
    connectedCallback() {
        this.initialize();
        this.runBackTest();
    }
    initialize() {
        this.controlCustomElement.initialize();
    }
    runBackTest() {
        return __awaiter(this, void 0, void 0, function* () {
            this.reset();
            for (let index = 0; index < this.count; index++) {
                console.log(index);
                try {
                    const tradeData = yield this.getTradeData(index);
                    this.tradeData.push(tradeData);
                    yield this.delay(90);
                }
                catch (error) {
                    console.error(`Failed to process index ${index}:`, error.message);
                }
            }
            this.render();
        });
    }
    getTradeData(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const toDate = `${this.getToDate(index)}+09:00`;
            const fetchedData = yield this.fetchData("60", "37", toDate);
            const makedData = this.makeTradeData(fetchedData);
            const actionedData = this.setTradingAction(makedData, index);
            const volatedData = this.setVolatility(actionedData);
            const orderedData = this.order(volatedData);
            const profitedData = this.setProfit(orderedData, index);
            return profitedData;
        });
    }
    reset() {
        this.dataset.loading = "true";
        this.tradeData = [];
    }
    delay(duration) {
        return new Promise((resolve) => setTimeout(resolve, duration));
    }
    fetchData(unit, fetchCount, to) {
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
    getToDate(index) {
        const now = new Date();
        now.setMonth(now.getMonth());
        now.setDate(now.getDate() - this.count + index);
        now.setHours(22, 0, 0, 0);
        return now.toISOString().slice(0, 19);
    }
    makeTradeData(data) {
        const lastData = data[24];
        const date = lastData.candle_date_time_kst.slice(0, 10);
        const prevDayData = {
            morning: [data[0], data[12]],
            afternoon: [data[12], lastData],
        };
        const startPrice = prevDayData.afternoon[0].trade_price;
        const afternoonRate = (prevDayData.afternoon[1].trade_price - startPrice) / startPrice;
        const moringVolume = prevDayData.morning[1].candle_acc_trade_volume -
            prevDayData.morning[0].candle_acc_trade_volume;
        const afterVolume = prevDayData.afternoon[1].candle_acc_trade_volume -
            prevDayData.afternoon[0].candle_acc_trade_volume;
        const condition = afternoonRate > 0 && afterVolume > moringVolume;
        const afternoonData = this.getAfternoonData(data.slice(12));
        return {
            date,
            condition,
            afternoonData,
            trade_price: lastData.trade_price,
            trade_sell_date: data[data.length - 1],
        };
    }
    getAfternoonData(data) {
        const highPrices = data.map((d) => d.high_price);
        const lowPrices = data.map((d) => d.low_price);
        return {
            high_price: Math.max(...highPrices),
            low_price: Math.min(...lowPrices),
            opening_price: data[0].opening_price,
        };
    }
    setTradingAction(aData, index) {
        let action = "";
        if (index === 0) {
            action = aData.condition ? "Buy" : "Reserve";
        }
        else {
            if (this.tradeData[index - 1].condition === aData.condition) {
                action = aData.condition ? "Hold" : "Reserve";
            }
            else {
                action = aData.condition ? "Buy" : "Sell";
            }
        }
        return Object.assign(Object.assign({}, JSON.parse(JSON.stringify(aData))), { action });
    }
    setVolatility(data) {
        return Object.assign(Object.assign({}, JSON.parse(JSON.stringify(data))), { volatility: getDaliyVolatility(data.afternoonData) });
    }
    order(data) {
        const parseData = JSON.parse(JSON.stringify(data));
        if (!data.volatility)
            return parseData;
        if (data.action === "Buy") {
            const percent = (this.target / data.volatility) * 100;
            const unitPercent = percent / this.marketSize;
            const orderAmount = (this.totalInvestmentPrice * unitPercent) / 100;
            return Object.assign(Object.assign({}, parseData), { order_amount: Math.round(orderAmount) });
        }
        return parseData;
    }
    setProfit(data, index) {
        const aData = JSON.parse(JSON.stringify(data));
        const prevTradeData = index > 0 && this.tradeData[index - 1];
        const buyData = index > 0 && this.tradeData[prevTradeData.buy_index];
        switch (aData.action) {
            case "Buy":
                return Object.assign(Object.assign({}, aData), { buy_index: index, sumProfit: prevTradeData.sumProfit || 0, unrealize_sum: prevTradeData.unrealize_sum || 0 });
            case "Hold":
                const unrealize_rate = (aData.trade_price - buyData.trade_price) /
                    buyData.trade_price;
                const unrealize_profit = unrealize_rate * buyData.order_amount;
                return Object.assign(Object.assign({}, aData), { buy_index: prevTradeData.buy_index, sumProfit: prevTradeData.sumProfit || 0, unrealize_rate,
                    unrealize_profit, unrealize_sum: prevTradeData.unrealize_sum + unrealize_profit });
            case "Sell":
                const rate = (aData.trade_sell_date.trade_price - buyData.trade_price) /
                    buyData.trade_price;
                const profit = rate * buyData.order_amount;
                const sumProfit = prevTradeData.sumProfit + profit;
                return Object.assign(Object.assign({}, aData), { rate,
                    profit, sumProfit: sumProfit, unrealize_sum: sumProfit });
            case "Reserve": {
                return Object.assign(Object.assign({}, aData), { sumProfit: prevTradeData.sumProfit || 0, unrealize_sum: prevTradeData.unrealize_sum || 0 });
            }
        }
    }
    render() {
        this.tableCustomElement.render();
        this.overviewCustomElement.redner();
        this.dataset.loading = "false";
    }
}
//# sourceMappingURL=AppBacktest4.js.map