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
export default class AppBacktest extends HTMLElement {
    constructor() {
        super();
        this.data = [];
        this.market = "KRW-BTC";
        this.period = 100;
        this.investmentPrice = 500000;
        this.fee = 0.00139;
        this.allSumPrice = 0;
        this.allSumSize = 0;
        this.periodInput = this.querySelector("input[name=period]");
        this.onChangeMarket = this.onChangeMarket.bind(this);
        this.onOptionSubmit = this.onOptionSubmit.bind(this);
    }
    connectedCallback() {
        var _a, _b;
        this.initialize();
        this.loadAndRender();
        (_a = this.querySelector("select")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", this.onChangeMarket);
        (_b = this.querySelector("form")) === null || _b === void 0 ? void 0 : _b.addEventListener("submit", this.onOptionSubmit);
    }
    initialize() {
        this.periodInput.value = this.period.toString();
        this.querySelector(".investmentPrice").textContent =
            this.investmentPrice.toLocaleString();
    }
    loadAndRender() {
        return __awaiter(this, void 0, void 0, function* () {
            const originData = yield this.getCandles();
            this.calculateMovingAverage(originData);
            this.enrichingData();
            this.render();
            this.renderSummary();
        });
    }
    getCandles() {
        return __awaiter(this, void 0, void 0, function* () {
            const searchParams = new URLSearchParams({
                market: this.market,
                count: this.period.toString(),
            });
            const response = yield fetch(`/fetchCandles?${searchParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return yield response.json();
        });
    }
    calculateMovingAverage(originData, period = 5) {
        this.data = originData.slice(period - 1).map((aData, index) => {
            let sum = 0;
            for (let i = 0; i < period; i++) {
                sum += originData[index + i].trade_price;
            }
            return Object.assign(Object.assign({}, aData), { moving_average_5: sum / period });
        });
    }
    enrichingData() {
        this.data = this.data.map((aData) => {
            if (!aData.moving_average_5)
                return aData;
            return Object.assign(Object.assign({}, aData), { condition: aData.moving_average_5 > aData.trade_price });
        });
        this.data = this.data.map((aData, index) => {
            let action = "";
            if (index === 0) {
                if (aData.condition)
                    action = "Buy";
                else if (!aData.condition)
                    action = "";
            }
            else {
                const prevCondition = this.data[index - 1].condition;
                if (prevCondition && aData.condition) {
                    action = "Hold";
                }
                else if (prevCondition && !aData.condition) {
                    action = "Sell";
                }
                else if (!prevCondition && aData.condition) {
                    action = "Buy";
                }
                else if (!prevCondition && !aData.condition) {
                    action = "none";
                }
            }
            return Object.assign(Object.assign({}, aData), { action });
        });
        let orderPrice = 0;
        let profit = 0;
        let totalProfit = 0;
        let total = 0;
        this.data = this.data.map((aData) => {
            switch (aData.action) {
                case "Buy":
                    orderPrice = aData.trade_price;
                    profit = 0;
                    total = total || this.investmentPrice;
                    break;
                case "Sell":
                    const rate = (aData.trade_price - orderPrice) / orderPrice;
                    profit = rate * total || this.investmentPrice;
                    totalProfit += profit;
                    total = this.investmentPrice + totalProfit;
                    break;
                case "none":
                    profit = 0;
                    break;
            }
            return Object.assign(Object.assign({}, aData), { profit,
                totalProfit,
                total });
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
        const tpElement = document.querySelector("#tp-item");
        tpElement;
        const cloned = cloneTemplate(tpElement);
        if (!aData.moving_average_5)
            return cloned;
        const parseData = {
            index,
            candle_date_time_kst: aData.candle_date_time_kst.replace("T", " "),
            opening_price: aData.opening_price.toLocaleString(),
            trade_price: aData.trade_price.toLocaleString(),
            moving_average_5: aData.moving_average_5 &&
                aData.moving_average_5.toLocaleString(),
            condition: aData.condition,
            action: aData.action,
            profit: aData.profit && Math.round(aData.profit).toLocaleString(),
            totalProfit: aData.totalProfit &&
                Math.round(aData.totalProfit).toLocaleString(),
            total: aData.total && Math.round(aData.total).toLocaleString(),
        };
        updateElementsTextWithData(parseData, cloned);
        cloned.dataset.action = aData.action;
        return cloned;
    }
    renderSummary() {
        if (this.data.length === 0)
            return;
        const tpElement = document.querySelector("#tp-summary");
        const summaryListElement = this.querySelector(".summary-list");
        const cloned = cloneTemplate(tpElement);
        const deleteButton = cloned.querySelector(".deleteButton");
        const lastProfit = this.data[this.data.length - 1].totalProfit;
        if (!lastProfit)
            return;
        const totalRate = Math.round((lastProfit / this.investmentPrice) * 100);
        const summaryData = {
            market: this.market,
            period: this.period,
            totalRate: `${totalRate} %`,
            lastProfit: ` ${Math.round(lastProfit).toLocaleString()} 원`,
        };
        updateElementsTextWithData(summaryData, cloned);
        summaryListElement.appendChild(cloned);
        this.allSumPrice += lastProfit;
        this.allSumSize++;
        this.renderAllSum();
        deleteButton.addEventListener("click", () => {
            cloned.remove();
            this.allSumPrice -= lastProfit;
            this.allSumSize--;
            this.renderAllSum();
        });
    }
    renderAllSum() {
        const allSumRate = (this.allSumPrice / (this.allSumSize * this.investmentPrice)) * 100;
        const allSumData = {
            allSumPrice: Math.round(this.allSumPrice).toLocaleString(),
            allSumRate: allSumRate.toFixed(2).toLocaleString(),
        };
        const summaryAllElement = this.querySelector(".summary-all");
        updateElementsTextWithData(allSumData, summaryAllElement);
    }
    onChangeMarket(event) {
        const target = event.target;
        this.market = target.value;
        this.loadAndRender();
    }
    onOptionSubmit(event) {
        event === null || event === void 0 ? void 0 : event.preventDefault();
        const maxSize = Number(this.periodInput.getAttribute("max"));
        this.period =
            Number(this.periodInput.value) > maxSize
                ? maxSize
                : Number(this.periodInput.value);
        this.periodInput.value = this.period.toString();
        this.loadAndRender();
    }
    getMinutes() {
        return __awaiter(this, void 0, void 0, function* () {
            const searchParams = new URLSearchParams({
                market: "KRW-XRP",
                unit: "30",
                to: "2024-01-11T09:00:00",
                count: "10",
            });
            const response = yield fetch(`/fetchCandlesMinutes?${searchParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = yield response.json();
            console.log(data);
        });
    }
}
//# sourceMappingURL=AppBacktest.js.map