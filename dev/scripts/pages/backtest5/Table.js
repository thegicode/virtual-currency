import { cloneTemplate, updateElementsTextWithData, } from "@app/scripts/utils/helpers";
export default class BacktestTable extends HTMLElement {
    constructor() {
        super();
        this.app = document.querySelector("app-backtest5");
        this.tableElement = this.querySelector("tbody");
        this.template = document.querySelector("#tp-item");
    }
    connectedCallback() { }
    render(data) {
        if (!this.app)
            return;
        this.tableElement.innerHTML = "";
        const fragment = new DocumentFragment();
        data.map((aData, index) => this.createItem(aData, index)).forEach((cloned) => fragment.appendChild(cloned));
        this.tableElement.appendChild(fragment);
    }
    createItem(aData, index) {
        var _a;
        const cloned = cloneTemplate(this.template);
        const parseData = {
            index,
            date: aData.date,
            range: aData.range.toLocaleString(),
            condition: aData.buyCondition.toString(),
            action: aData.action.toString(),
            standardPrice: aData.standardPrice.toLocaleString(),
            buyPrice: Math.round(aData.buyPrice).toLocaleString(),
            sellPrice: Math.round(aData.sellPrice).toLocaleString(),
            rate: (_a = (aData.rate && aData.rate * 100)) === null || _a === void 0 ? void 0 : _a.toFixed(2),
            profit: Math.round(aData.profit).toLocaleString(),
            sumProfit: aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
        };
        updateElementsTextWithData(parseData, cloned);
        cloned.dataset.action = aData.buyCondition.toString();
        return cloned;
    }
}
//# sourceMappingURL=Table.js.map