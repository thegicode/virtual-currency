import { cloneTemplate, updateElementsTextWithData, } from "@app/scripts/utils/helpers";
export default class Overview extends HTMLElement {
    constructor() {
        super();
        this.app = document.querySelector("app-backtest7");
        this.data = [];
        this.profit = 0;
        this.totalSumPrice = 0;
        this.size = 0;
        this.sumElement = this.querySelector(".overview-sum");
        this.listElement = this.querySelector(".overview-list");
        this.itemTemplate = document.querySelector("#tp-overviewItem");
    }
    connectedCallback() { }
    initialize() {
        this.data = [];
        this.profit = 0;
        this.totalSumPrice = 0;
        this.size = 0;
        this.listElement.innerHTML = "";
        const renderData = {
            totalSumPrice: 0,
            totalSumRate: 0,
        };
        updateElementsTextWithData(renderData, this.sumElement);
    }
    redner(data) {
        this.data = data;
        this.renderList();
        this.renderSum(true);
    }
    renderList() {
        const profit = this.data[this.data.length - 1].sumProfit || 0;
        const rate = (profit / this.app.investmentAmount) * 100;
        const market = this.data[0].market;
        const renderData = {
            market,
            period: this.app.count,
            totalRate: `${rate.toFixed(2)}%`,
            totalProfit: ` ${Math.round(profit).toLocaleString()} 원`,
        };
        const cloned = cloneTemplate(this.itemTemplate);
        cloned.dataset.value = profit.toString();
        cloned.dataset.market = market;
        updateElementsTextWithData(renderData, cloned);
        this.listElement.appendChild(cloned);
        this.addEvent(cloned);
        this.profit = profit;
    }
    addEvent(cloned) {
        const deleteButton = cloned.querySelector(".deleteButton");
        deleteButton.addEventListener("click", () => {
            const profit = Number(cloned.dataset.value);
            cloned.remove();
            this.renderSum(false, profit);
        });
    }
    renderSum(isAdd, profit) {
        if (!this.app)
            return;
        if (isAdd) {
            this.totalSumPrice += this.profit;
            this.size++;
        }
        else {
            if (profit === undefined)
                return;
            this.totalSumPrice -= profit;
            this.size--;
        }
        const totalSumRate = this.totalSumPrice === 0
            ? 0
            : (this.totalSumPrice /
                (this.app.investmentAmount * this.size)) *
                100;
        const renderData = {
            totalSumPrice: Math.round(this.totalSumPrice).toLocaleString(),
            totalSumRate: totalSumRate.toFixed(2).toLocaleString(),
        };
        updateElementsTextWithData(renderData, this.sumElement);
    }
}
//# sourceMappingURL=Overview.js.map