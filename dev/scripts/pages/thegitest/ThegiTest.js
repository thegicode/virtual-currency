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
import { getDaliyVolatility, getVolatility, } from "@app/scripts/components/backtest/volatility";
import { cloneTemplate, updateElementsTextWithData, } from "@app/scripts/utils/helpers";
export default class AppBacktest2 extends HTMLElement {
    constructor() {
        super();
        this.data = [];
        this.market = "KRW-BTC";
        this.count = 200;
        this.marketSize = 5;
        this.totalInvestmentPrice = 1000000;
        this.investmentPrice = this.totalInvestmentPrice / this.marketSize;
        this.summaryAllPrice = 0;
        this.allSumSize = 0;
        this.countElement = this.querySelector("input[name=count]");
        this.selectElement = this.querySelector("select");
        this.formElement = this.querySelector("form");
        this.onChangeMarket = this.onChangeMarket.bind(this);
        this.onOptionSubmit = this.onOptionSubmit.bind(this);
    }
    connectedCallback() {
        this.initialize();
        this.loadAndRender();
        this.selectElement.addEventListener("change", this.onChangeMarket);
        this.formElement.addEventListener("submit", this.onOptionSubmit);
    }
    disconnectedCallback() {
        this.selectElement.removeEventListener("change", this.onChangeMarket);
        this.formElement.removeEventListener("submit", this.onOptionSubmit);
    }
    initialize() {
        this.countElement.value = this.count.toString();
        this.querySelector(".investmentPrice").textContent =
            this.investmentPrice.toLocaleString();
    }
    loadAndRender() {
        return __awaiter(this, void 0, void 0, function* () {
            const originData = yield this.getCandles();
            this.movingAverages(originData);
            this.checkCondition();
            this.setTradingAction();
            this.setVolatility();
            this.order();
            this.setProfit();
            this.render();
            this.renderSummary();
        });
    }
    getCandles() {
        return __awaiter(this, void 0, void 0, function* () {
            const searchParams = new URLSearchParams({
                market: this.market,
                count: this.count.toString(),
            });
            const response = yield fetch(`/fetchCandles?${searchParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return yield response.json();
        });
    }
    movingAverages(originData) {
        let data = setMovingAverage(originData, 3);
        data = setMovingAverage(originData, 5);
        data = setMovingAverage(originData, 10);
        data = setMovingAverage(originData, 20);
        this.data = data;
    }
    checkCondition() {
        this.data = this.data.map((aData, index) => {
            if (aData.trade_price > aData.moving_average_3 &&
                aData.trade_price > aData.moving_average_5 &&
                aData.trade_price > aData.moving_average_10 &&
                aData.trade_price > aData.moving_average_20)
                aData.condition = true;
            else
                aData.condition = false;
            return Object.assign({}, aData);
        });
    }
    setTradingAction() {
        this.data = this.data.map((aData, index) => {
            let tradingAction = "";
            if (index === 0) {
                tradingAction = aData.condition ? "Buy" : "Reserve";
            }
            else {
                const prevCondition = this.data[index - 1].condition;
                if (prevCondition !== aData.condition) {
                    tradingAction = aData.condition ? "Buy" : "Sell";
                }
                else {
                    tradingAction = aData.condition ? "Hold" : "Reserve";
                }
            }
            return Object.assign(Object.assign({}, aData), { tradingAction });
        });
    }
    setVolatility() {
        this.data = this.data.map((aData) => {
            return Object.assign(Object.assign({}, aData), { daily_volatility: getDaliyVolatility(aData) });
        });
        this.data = this.data.map((aData, index) => {
            const volatility = getVolatility(this.data, aData, index);
            return Object.assign(Object.assign({}, aData), { volatility });
        });
    }
    order() {
        const target = 2;
        this.data = this.data.map((aData) => {
            if (!aData.volatility)
                return aData;
            if (aData.tradingAction === "Buy") {
                const percent = (target / aData.volatility) * 100;
                const unitPercent = percent / this.marketSize;
                const result = (this.totalInvestmentPrice * unitPercent) / 100;
                return Object.assign(Object.assign({}, aData), { order_price: Math.round(result) });
            }
            else
                return aData;
        });
    }
    setProfit() {
        let buyTradePrice = 0;
        let orderPrice = 0;
        let profit = 0;
        let rate = 0;
        let unrealize_rate = 0;
        let unrealize_gain = 0;
        let unrealize_profit = 0;
        let sumProfit = 0;
        let sumPrice = this.investmentPrice;
        const getRate = (aData) => (aData.trade_price - buyTradePrice) / buyTradePrice;
        const getProfit = (aData) => orderPrice * getRate(aData);
        const getSumPrice = () => this.investmentPrice + sumProfit;
        this.data = this.data.map((aData) => {
            switch (aData.tradingAction) {
                case "Buy":
                    buyTradePrice = aData.trade_price;
                    if (aData.order_price)
                        orderPrice = aData.order_price;
                    profit = 0;
                    rate = 0;
                    sumPrice = getSumPrice();
                    unrealize_rate = 0;
                    unrealize_profit = 0;
                    unrealize_gain = sumPrice;
                    break;
                case "Sell":
                    rate = getRate(aData);
                    profit = getProfit(aData);
                    sumProfit += profit;
                    sumPrice = getSumPrice();
                    unrealize_rate = rate;
                    unrealize_profit = profit;
                    unrealize_gain = sumPrice;
                    break;
                case "Hold":
                    unrealize_rate = getRate(aData);
                    unrealize_profit = getProfit(aData);
                    unrealize_gain = sumPrice + getProfit(aData);
                    break;
                case "Reserve":
                    profit = 0;
                    rate = 0;
                    sumPrice = getSumPrice();
                    unrealize_rate = 0;
                    unrealize_profit = 0;
                    unrealize_gain = sumPrice;
                    break;
            }
            return Object.assign(Object.assign({}, aData), { profit, rate: rate * 100, unrealize_rate: Number((unrealize_rate * 100).toFixed(2)), unrealize_profit: Math.round(unrealize_profit) || 0, unrealize_gain: Math.round(unrealize_gain), sumProfit: Number(sumProfit.toFixed(2)), sumPrice: Number(sumPrice.toFixed(2)) });
        });
    }
    render() {
        const tableElement = this.querySelector("tbody");
        tableElement.innerHTML = "";
        const fragment = new DocumentFragment();
        this.data
            .map((aData, index) => this.createItem(aData, index))
            .forEach((cloned) => fragment.appendChild(cloned));
        tableElement === null || tableElement === void 0 ? void 0 : tableElement.appendChild(fragment);
    }
    createItem(aData, index) {
        var _a, _b;
        const tpElement = document.querySelector("#tp-item");
        tpElement;
        const cloned = cloneTemplate(tpElement);
        const parseData = {
            index,
            candle_date_time_kst: aData.candle_date_time_kst.replace("T", " "),
            opening_price: aData.opening_price.toLocaleString(),
            trade_price: aData.trade_price.toLocaleString(),
            condition: aData.condition,
            tradingAction: aData.tradingAction,
            daily_volatility: aData.daily_volatility && aData.daily_volatility,
            volatility: (aData.volatility && aData.volatility) || "",
            order_price: (aData.order_price && aData.order_price.toLocaleString()) || "",
            unrealize_rate: aData.unrealize_rate,
            unrealize_profit: (_a = aData.unrealize_profit) === null || _a === void 0 ? void 0 : _a.toLocaleString(),
            unrealize_gain: (_b = aData.unrealize_gain) === null || _b === void 0 ? void 0 : _b.toLocaleString(),
            profit: aData.profit && Math.round(aData.profit).toLocaleString(),
            rate: aData.rate && aData.rate.toFixed(2),
            sumProfit: aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
            sumPrice: aData.sumPrice && Math.round(aData.sumPrice).toLocaleString(),
        };
        updateElementsTextWithData(parseData, cloned);
        cloned.dataset.action = aData.tradingAction;
        return cloned;
    }
    renderSummary() {
        if (this.data.length === 0)
            return;
        const tpElement = document.querySelector("#tp-summary");
        const summaryListElement = this.querySelector(".summary-list");
        const cloned = cloneTemplate(tpElement);
        const deleteButton = cloned.querySelector(".deleteButton");
        const lastProfit = this.data[this.data.length - 1].sumProfit;
        if (lastProfit === undefined)
            return;
        const totalRate = (lastProfit / this.investmentPrice) * 100;
        const summaryData = {
            market: this.market,
            period: this.count,
            totalRate: `${totalRate.toFixed(2)} %`,
            lastProfit: ` ${Math.round(lastProfit).toLocaleString()} 원`,
        };
        updateElementsTextWithData(summaryData, cloned);
        summaryListElement.appendChild(cloned);
        this.summaryAllPrice += lastProfit;
        this.allSumSize++;
        this.renderAllSum();
        deleteButton.addEventListener("click", () => {
            cloned.remove();
            this.summaryAllPrice -= lastProfit;
            this.allSumSize--;
            this.renderAllSum();
        });
    }
    renderAllSum() {
        const summaryAllElement = this.querySelector(".summary-all");
        const summaryAllRate = (this.summaryAllPrice / (this.allSumSize * this.investmentPrice)) *
            100 || 0;
        const allSumData = {
            summaryAllPrice: Math.round(this.summaryAllPrice).toLocaleString(),
            summaryAllRate: summaryAllRate.toFixed(2).toLocaleString(),
        };
        updateElementsTextWithData(allSumData, summaryAllElement);
    }
    onChangeMarket(event) {
        const target = event.target;
        this.market = target.value;
        this.loadAndRender();
    }
    onOptionSubmit(event) {
        event === null || event === void 0 ? void 0 : event.preventDefault();
        const maxSize = Number(this.countElement.getAttribute("max"));
        this.count =
            Number(this.countElement.value) > maxSize
                ? maxSize
                : Number(this.countElement.value);
        this.countElement.value = this.count.toString();
        this.loadAndRender();
    }
}
//# sourceMappingURL=ThegiTest.js.map