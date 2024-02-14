import { cloneTemplate, roundToDecimalPlace, updateElementsTextWithData, } from "@scripts/utils/helpers";
import OrderedItem from "./OrderedItem";
export default class AccountItem extends HTMLElement {
    constructor(data) {
        super();
        this.orderedButton = null;
        this.ordered = null;
        this.data = data;
        this.template = document.querySelector("#accountItem");
        this.orderedButton = null;
        this.ordered = null;
        this.handleOrdered = this.handleOrdered.bind(this);
    }
    connectedCallback() {
        var _a;
        this.createElement();
        this.orderedButton = this.querySelector(".orderedButton");
        this.ordered = this.querySelector(".ordered");
        this.displayOrdered();
        (_a = this.orderedButton) === null || _a === void 0 ? void 0 : _a.addEventListener("click", this.handleOrdered);
    }
    disconnectedCallback() {
        var _a;
        (_a = this.orderedButton) === null || _a === void 0 ? void 0 : _a.removeEventListener("click", this.handleOrdered);
    }
    handleOrdered() {
        if (!this.ordered)
            return;
        this.ordered.hidden = !this.ordered.hidden;
    }
    createElement() {
        const cloned = cloneTemplate(this.template);
        const contentData = {
            currency: this.data.currency,
            unitCurrency: this.data.unitCurrency,
            volume: this.data.volume,
            buyPrice: roundToDecimalPlace(this.data.buyPrice, 0).toLocaleString(),
            avgBuyPrice: roundToDecimalPlace(this.data.avgBuyPrice, 1).toLocaleString(),
            profit: Math.round(this.data.profit).toLocaleString(),
            profitRate: roundToDecimalPlace(this.data.profitRate, 2) + "%",
        };
        updateElementsTextWithData(contentData, cloned);
        this.innerHTML = cloned.innerHTML;
        const isIncrement = this.data.profit > 0 ? true : false;
        this.dataset.increase = isIncrement.toString();
    }
    displayOrdered() {
        if (this.ordered && this.data.orderedData.length === 0) {
            this.ordered.hidden = true;
            return;
        }
        this.data.orderedData.map((data) => {
            var _a;
            const orderedItem = new OrderedItem(data);
            (_a = this.ordered) === null || _a === void 0 ? void 0 : _a.appendChild(orderedItem);
        });
    }
}
//# sourceMappingURL=AccountItem.js.map