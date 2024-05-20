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
import { BuyStrategy, HoldStrategy, ReserveStrategy, SellStrategy, } from "./TradeStrategy";
export default class AppBacktest4 extends HTMLElement {
    constructor() {
        super();
        this.tradeData = [];
        this.market = "";
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
                try {
                    const tradeData = yield this.getTradeData(index);
                    this.tradeData.push(tradeData);
                    yield this.delay(100);
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
            const { makedData, afternoonData, sellPrice } = this.makeTradeData(fetchedData, toDate);
            const actionedData = this.setTradingAction(makedData, index);
            const volatedData = this.setVolatility(actionedData, afternoonData);
            const enrichedData = this.getStrategy(volatedData, index, sellPrice);
            return enrichedData;
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
        now.setDate(now.getDate() - this.count + index + 1);
        now.setHours(22, 0, 0, 0);
        return now.toISOString().slice(0, 19);
    }
    makeTradeData(data, date) {
        const dates = data.map((d) => d.candle_date_time_kst);
        const prevDate = new Date(date);
        prevDate.setUTCDate(prevDate.getUTCDate() - 1);
        const prevDateISOString = prevDate.toISOString().slice(0, 10);
        const prevFirstIndex = dates.indexOf(prevDateISOString + "T00:00:00");
        const prevMidIndex = dates.indexOf(prevDateISOString + "T12:00:00");
        const prevLastIndex = dates.indexOf(date.slice(0, 11) + "00:00:00");
        const prevDayData = {
            morning: [data[prevFirstIndex], data[prevMidIndex]],
            afternoon: [data[prevMidIndex], data[prevLastIndex]],
        };
        const startPrice = prevDayData.afternoon[0].trade_price;
        const afternoonRate = (prevDayData.afternoon[1].trade_price - startPrice) / startPrice;
        const moringVolume = prevDayData.morning[1].candle_acc_trade_volume -
            prevDayData.morning[0].candle_acc_trade_volume;
        const afterVolume = prevDayData.afternoon[1].candle_acc_trade_volume -
            prevDayData.afternoon[0].candle_acc_trade_volume;
        const condition = afternoonRate > 0 && afterVolume > moringVolume;
        const makedData = {
            date: date.slice(0, 10),
            condition,
            trade_price: data[prevLastIndex].trade_price,
        };
        return {
            makedData,
            afternoonData: this.getAfternoonData(data.slice(12)),
            sellPrice: data[data.length - 1].trade_price,
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
    setVolatility(data, afternoonData) {
        return Object.assign(Object.assign({}, JSON.parse(JSON.stringify(data))), { volatility: getDaliyVolatility(afternoonData) });
    }
    getStrategy(data, index, sellPrice) {
        const result = this.tradeStrategy(data, index, sellPrice);
        return Object.assign(Object.assign({}, data), { buy_index: result.buy_index, order_amount: (data.action === "Buy" && result.orderAmount) || "", rate: result.rate, profit: result.profit, sum_profit: result.sum_profit, unrealize_rate: result.unrealize_rate, unrealize_profit: result.unrealize_profit, unrealize_sum: result.unrealize_sum });
    }
    tradeStrategy(data, index, sellPrice) {
        switch (data.action) {
            case "Buy":
                return new BuyStrategy(this, data, index);
            case "Hold":
                return new HoldStrategy(this, data, index);
            case "Sell":
                return new SellStrategy(this, data, index, sellPrice);
            case "Reserve":
                return new ReserveStrategy(this, data, index);
            default:
                throw new Error(`알 수 없는 장르: ${data.action}`);
        }
    }
    render() {
        this.tableCustomElement.render();
        this.overviewCustomElement.redner();
        this.dataset.loading = "false";
    }
}
//# sourceMappingURL=AppBacktest4.js.map