import { cloneTemplate, roundToDecimalPlace, updateElementsTextWithData, } from "@scripts/utils/helpers";
import OrderBid from "./OrderBid";
import OrderedItem from "./OrderedItem";
export default class AccountItem extends HTMLElement {
    constructor(data) {
        super();
        this.orderedButton = null;
        this.ordered = null;
        this.bidButton = null;
        this.orderBid = null;
        this.data = data;
        this.template = document.querySelector("#tp-accountItem");
        this.orderedButton = null;
        this.ordered = null;
        this.bidButton = null;
        this.handleOrdered = this.handleOrdered.bind(this);
        this.handleOrderBid = this.handleOrderBid.bind(this);
    }
    connectedCallback() {
        var _a, _b;
        this.createElement();
        this.orderedButton = this.querySelector(".orderedButton");
        this.ordered = this.querySelector(".ordered");
        this.bidButton = this.querySelector(".bidButton");
        this.displayOrdered();
        (_a = this.orderedButton) === null || _a === void 0 ? void 0 : _a.addEventListener("click", this.handleOrdered);
        (_b = this.bidButton) === null || _b === void 0 ? void 0 : _b.addEventListener("click", this.handleOrderBid);
    }
    disconnectedCallback() {
        var _a, _b;
        (_a = this.orderedButton) === null || _a === void 0 ? void 0 : _a.removeEventListener("click", this.handleOrdered);
        (_b = this.bidButton) === null || _b === void 0 ? void 0 : _b.removeEventListener("click", this.handleOrderBid);
    }
    handleOrdered() {
        if (!this.ordered)
            return;
        this.ordered.hidden = !this.ordered.hidden;
    }
    handleOrderBid() {
        var _a;
        if (!this.bidButton)
            return;
        if (this.orderBid) {
            this.orderBid.show();
            return;
        }
        this.orderBid = new OrderBid(this.bidButton);
        (_a = this.querySelector("#orderBid")) === null || _a === void 0 ? void 0 : _a.replaceWith(this.orderBid);
        this.bidButton.disabled = true;
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