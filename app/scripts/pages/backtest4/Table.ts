import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";
import AppBacktest4 from "./AppBacktest4";

export default class BacktestTable extends HTMLElement {
    private app: AppBacktest4;

    private tableElement: HTMLElement;
    private template: HTMLTemplateElement;

    constructor() {
        super();

        this.app = document.querySelector("app-backtest4") as AppBacktest4;

        this.tableElement = this.querySelector("tbody") as HTMLElement;
        this.template = document.querySelector(
            "#tp-item"
        ) as HTMLTemplateElement;
    }

    connectedCallback() {}

    public render() {
        if (!this.app) return;

        this.tableElement.innerHTML = "";
        const fragment = new DocumentFragment();

        this.app.tradeData
            .map((aData: ITradeData4, index) => this.createItem(aData, index))
            .forEach((cloned: HTMLElement) => fragment.appendChild(cloned));

        this.tableElement.appendChild(fragment);
    }

    private createItem(aData: ITradeData4, index: number) {
        const cloned = cloneTemplate<HTMLElement>(this.template);

        const parseData = {
            index,
            date: aData.date,
            trade_price: aData.trade_price.toLocaleString(),
            condition: aData.condition.toString(),
            action: aData.action,
            volatility: aData.volatility?.toFixed(2),
            rate: (aData.rate && aData.rate * 100)?.toFixed(2) || "",
            profit:
                (aData.profit && Math.round(aData.profit).toLocaleString()) ||
                "",
            sumProfit:
                aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
            unrealize_rate:
                (aData.unrealize_rate &&
                    (aData.unrealize_rate * 100).toFixed(2)) ||
                "",
            unrealize_profit:
                (aData.unrealize_profit &&
                    Math.round(aData.unrealize_profit).toLocaleString()) ||
                "",
            unrealize_sum:
                aData.unrealize_sum &&
                Math.round(aData.unrealize_sum).toLocaleString(),
        };

        updateElementsTextWithData(parseData, cloned);

        cloned.dataset.action = aData.action;

        return cloned;
    }
}
