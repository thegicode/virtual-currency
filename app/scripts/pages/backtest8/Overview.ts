import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";
import AppBacktest8 from "./AppBacktest8";

export default class Overview extends HTMLElement {
    private app: AppBacktest8;

    private data: IBacktest5[];
    private profit: number;
    private totalSumPrice: number;
    private size: number;

    private sumElement: HTMLElement;
    private listElement: HTMLElement;

    private itemTemplate: HTMLTemplateElement;

    constructor() {
        super();

        this.app = document.querySelector("app-backtest8") as AppBacktest8;

        this.data = [];
        this.profit = 0;
        this.totalSumPrice = 0;
        this.size = 0;

        this.sumElement = this.querySelector(".overview-sum") as HTMLElement;
        this.listElement = this.querySelector(".overview-list") as HTMLElement;
        this.itemTemplate = document.querySelector(
            "#tp-overviewItem"
        ) as HTMLTemplateElement;
    }

    connectedCallback() {}

    public initialize() {
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

    public redner(data: IBacktest5[]) {
        this.data = data;
        this.renderList();
        this.renderSum(true);
    }

    private renderList() {
        const profit = this.data[this.data.length - 1].sumProfit || 0;
        const rate = (profit / this.app.investmentAmount) * 100;
        const market = this.data[0].market;

        const renderData = {
            market,
            period: this.app.count,
            tradeCount: this.app.tradeCount,
            totalRate: `${rate.toFixed(2)}%`,
            totalProfit: ` ${Math.round(profit).toLocaleString()} 원`,
        };

        const cloned = cloneTemplate<HTMLElement>(this.itemTemplate);
        cloned.dataset.value = profit.toString();
        cloned.dataset.market = market;
        updateElementsTextWithData(renderData, cloned);

        this.listElement.appendChild(cloned);

        this.addEvent(cloned);

        this.profit = profit;
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
            this.totalSumPrice += this.profit;
            this.size++;
        } else {
            if (profit === undefined) return;
            this.totalSumPrice -= profit;
            this.size--;
        }

        const totalSumRate =
            this.totalSumPrice === 0
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
