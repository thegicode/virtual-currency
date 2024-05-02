import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";
import AppBacktest5 from "./AppBacktest5";

export default class BacktestTable extends HTMLElement {
    private app: AppBacktest5;

    private tableElement: HTMLElement;
    private template: HTMLTemplateElement;

    constructor() {
        super();

        this.app = document.querySelector("app-backtest5") as AppBacktest5;

        this.tableElement = this.querySelector("tbody") as HTMLElement;
        this.template = document.querySelector(
            "#tp-item"
        ) as HTMLTemplateElement;
    }

    connectedCallback() {}

    public render(data: IBacktest5[]) {
        if (!this.app) return;

        this.tableElement.innerHTML = "";
        const fragment = new DocumentFragment();

        data.map((aData: IBacktest5, index) =>
            this.createItem(aData, index)
        ).forEach((cloned: HTMLElement) => fragment.appendChild(cloned));

        this.tableElement.appendChild(fragment);
    }

    private createItem(aData: IBacktest5, index: number) {
        const cloned = cloneTemplate<HTMLElement>(this.template);

        const parseData = {
            index,
            date: aData.date,
            range: aData.range.toLocaleString(),
            condition: aData.buyCondition.toString(),
            action: aData.action.toString(),
            standardPrice: aData.standardPrice.toLocaleString(),
            buyPrice: Math.round(aData.buyPrice).toLocaleString(),
            sellPrice: Math.round(aData.sellPrice).toLocaleString(),
            rate: (aData.rate && aData.rate * 100)?.toFixed(2),
            profit: Math.round(aData.profit).toLocaleString(),
            sumProfit:
                aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
        };

        updateElementsTextWithData(parseData, cloned);

        cloned.dataset.action = aData.buyCondition.toString();

        return cloned;
    }
}
