import { cloneTemplate, updateElementsTextWithData, } from "@app/scripts/utils/helpers";
export default class BacktestTable extends HTMLElement {
    constructor() {
        super();
        this.app = document.querySelector("app-backtest4");
        this.tableElement = this.querySelector("tbody");
        this.template = document.querySelector("#tp-item");
    }
    connectedCallback() { }
    render() {
        if (!this.app)
            return;
        this.tableElement.innerHTML = "";
        const fragment = new DocumentFragment();
        this.app.tradeData
            .map((aData, index) => this.createItem(aData, index))
            .forEach((cloned) => fragment.appendChild(cloned));
        this.tableElement.appendChild(fragment);
    }
    createItem(aData, index) {
        var _a, _b;
        const cloned = cloneTemplate(this.template);
        const parseData = {
            index,
            date: aData.date,
            trade_price: aData.trade_price.toLocaleString(),
            condition: aData.condition.toString(),
            action: aData.action,
            volatility: (_a = aData.volatility) === null || _a === void 0 ? void 0 : _a.toFixed(2),
            rate: ((_b = (aData.rate && aData.rate * 100)) === null || _b === void 0 ? void 0 : _b.toFixed(2)) || "",
            profit: (aData.profit && Math.round(aData.profit).toLocaleString()) ||
                "",
            sumProfit: aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
            unrealize_rate: (aData.unrealize_rate &&
                (aData.unrealize_rate * 100).toFixed(2)) ||
                "",
            unrealize_profit: (aData.unrealize_profit &&
                Math.round(aData.unrealize_profit).toLocaleString()) ||
                "",
            unrealize_sum: aData.unrealize_sum &&
                Math.round(aData.unrealize_sum).toLocaleString(),
        };
        updateElementsTextWithData(parseData, cloned);
        cloned.dataset.action = aData.action;
        return cloned;
    }
}
//# sourceMappingURL=Table.js.map