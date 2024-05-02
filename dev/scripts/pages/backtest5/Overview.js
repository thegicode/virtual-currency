import { cloneTemplate, updateElementsTextWithData, } from "@app/scripts/utils/helpers";
export default class Overview extends HTMLElement {
    constructor() {
        super();
        this.app = document.querySelector("app-backtest4");
        this.totalProfit = 0;
        this.totalSumPrice = 0;
        this.size = 0;
        this.sumElement = this.querySelector(".overview-sum");
        this.listElement = this.querySelector(".overview-list");
        this.itemTemplate = document.querySelector("#tp-overviewItem");
    }
    connectedCallback() { }
    redner() {
        this.renderList();
        this.renderSum(true);
    }
    renderList() {
        if (!this.app)
            return;
        const totalProfit = this.app.tradeData[this.app.tradeData.length - 1].unrealize_sum;
        const totalRate = (totalProfit / this.app.investmentPrice) * 100;
        const renderData = {
            market: this.app.market,
            period: this.app.count,
            totalRate: `${totalRate.toFixed(2)}%`,
            totalProfit: ` ${Math.round(totalProfit).toLocaleString()} 원`,
        };
        const cloned = cloneTemplate(this.itemTemplate);
        cloned.dataset.value = totalProfit;
        updateElementsTextWithData(renderData, cloned);
        this.listElement.appendChild(cloned);
        this.addEvent(cloned);
        this.totalProfit = totalProfit;
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
            this.totalSumPrice += this.totalProfit;
            this.size++;
        }
        else {
            if (!profit)
                return;
            this.totalSumPrice -= profit;
            this.size--;
        }
        const totalSumRate = this.totalSumPrice === 0
            ? 0
            : (this.totalSumPrice /
                (this.app.investmentPrice * this.size)) *
                100;
        const renderData = {
            totalSumPrice: Math.round(this.totalSumPrice).toLocaleString(),
            totalSumRate: totalSumRate.toFixed(2).toLocaleString(),
        };
        updateElementsTextWithData(renderData, this.sumElement);
    }
}
//# sourceMappingURL=Overview.js.map