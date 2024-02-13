import { cloneTemplate, roundToDecimalPlace, updateElementsTextWithData, } from "@scripts/utils/helpers";
import OrderedItem from "./OrderedItem";
export default class AccountItem extends HTMLElement {
    constructor(data) {
        super();
        this.data = data;
        this.template = document.querySelector("#accountItem");
    }
    connectedCallback() {
        this.createElement();
        this.displayOrdered();
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
        this.data.orderedData.map((data) => {
            const orderedItem = new OrderedItem(data);
            this.appendChild(orderedItem);
        });
    }
}
//# sourceMappingURL=AccountItem.js.map