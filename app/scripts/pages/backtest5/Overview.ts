import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";
import AppBacktest4 from "./AppBacktest4";

export default class Overview extends HTMLElement {
    private app: AppBacktest4;

    private totalProfit: number;
    private totalSumPrice: number;
    private size: number;

    private sumElement: HTMLElement;
    private listElement: HTMLElement;
    private itemTemplate: HTMLTemplateElement;

    constructor() {
        super();

        this.app = document.querySelector("app-backtest4") as AppBacktest4;

        this.totalProfit = 0;
        this.totalSumPrice = 0;
        this.size = 0;

        this.sumElement = this.querySelector(".overview-sum") as HTMLElement;
        this.listElement = this.querySelector(".overview-list") as HTMLElement;
        this.itemTemplate = document.querySelector(
            "#tp-overviewItem"
        ) as HTMLTemplateElement;
    }

    connectedCallback() {}

    public redner() {
        this.renderList();
        this.renderSum(true);
    }

    private renderList() {
        if (!this.app) return;

        const totalProfit =
            this.app.tradeData[this.app.tradeData.length - 1].unrealize_sum;
        const totalRate = (totalProfit / this.app.investmentPrice) * 100;
        const renderData = {
            market: this.app.market,
            period: this.app.count,
            totalRate: `${totalRate.toFixed(2)}%`,
            totalProfit: ` ${Math.round(totalProfit).toLocaleString()} 원`,
        };

        const cloned = cloneTemplate<HTMLElement>(this.itemTemplate);
        cloned.dataset.value = totalProfit;

        updateElementsTextWithData(renderData, cloned);

        this.listElement.appendChild(cloned);

        this.addEvent(cloned);

        this.totalProfit = totalProfit;
    }

    addEvent(cloned: HTMLElement) {
        const deleteButton = cloned.querySelector(
            ".deleteButton"
        ) as HTMLButtonElement;

        deleteButton.addEventListener("click", () => {
            const profit = Number(cloned.dataset.value);
            cloned.remove();
            this.renderSum(false, profit);
        });
    }

    private renderSum(isAdd: boolean, profit?: number) {
        if (!this.app) return;

        if (isAdd) {
            this.totalSumPrice += this.totalProfit;
            this.size++;
        } else {
            if (!profit) return;
            this.totalSumPrice -= profit;
            this.size--;
        }

        const totalSumRate =
            this.totalSumPrice === 0
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
