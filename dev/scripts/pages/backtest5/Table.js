import { cloneTemplate, updateElementsTextWithData, } from "@app/scripts/utils/helpers";
export default class BacktestTable extends HTMLElement {
    constructor() {
        super();
        this.tableElement = this.querySelector("tbody");
        this.template = document.querySelector("#tp-item");
    }
    connectedCallback() { }
    render(data) {
        this.tableElement.innerHTML = "";
        const fragment = new DocumentFragment();
        data.map((aData, index) => this.createItem(aData, index)).forEach((cloned) => fragment.appendChild(cloned));
        this.tableElement.appendChild(fragment);
    }
    createItem(aData, index) {
        var _a, _b, _c;
        const cloned = cloneTemplate(this.template);
        const parseData = {
            index,
            date: aData.date,
            range: aData.range.toLocaleString(),
            condition: aData.buyCondition.toString(),
            action: (_a = aData.action) === null || _a === void 0 ? void 0 : _a.toString(),
            standardPrice: aData.standardPrice.toLocaleString(),
            buyPrice: (aData.buyPrice &&
                Math.round(aData.buyPrice).toLocaleString()) ||
                "",
            sellPrice: (aData.sellPrice &&
                Math.round(aData.sellPrice).toLocaleString()) ||
                "",
            rate: ((_b = (aData.rate && aData.rate * 100)) === null || _b === void 0 ? void 0 : _b.toFixed(2)) || "",
            profit: (aData.profit && Math.round(aData.profit).toLocaleString()) ||
                "",
            sumProfit: aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
        };
        updateElementsTextWithData(parseData, cloned);
        cloned.dataset.action = (_c = aData.action) === null || _c === void 0 ? void 0 : _c.toString();
        return cloned;
    }
}
//# sourceMappingURL=Table.js.map