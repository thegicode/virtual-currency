import { cloneTemplate, roundToDecimalPlace, updateElementsTextWithData, } from "@scripts/utils/helpers";
import OrderBid from "./OrderBid";
import OrderAsk from "./OrderAsk";
import OrderedItem from "./OrderedItem";
export default class AccountItem extends HTMLElement {
    constructor(data) {
        super();
        this.orderedButton = null;
        this.ordered = null;
        this.bidButton = null;
        this.askButton = null;
        this.orderBid = null;
        this.orderAsk = null;
        this.data = data;
        this.template = document.querySelector("#tp-accountItem");
        this.orderedButton = null;
        this.ordered = null;
        this.bidButton = null;
        this.askButton = null;
        this.handleOrdereds = this.handleOrdereds.bind(this);
        this.handleOrderBid = this.handleOrderBid.bind(this);
        this.handleOrderAsk = this.handleOrderAsk.bind(this);
    }
    get market() {
        return this.data.market;
    }
    get avgBuyPrice() {
        return this.data.avgBuyPrice;
    }
    get volume() {
        return this.data.volume;
    }
    get orderedElement() {
        return this.ordered;
    }
    connectedCallback() {
        var _a, _b, _c;
        this.render();
        this.orderedButton = this.querySelector(".orderedButton");
        this.ordered = this.querySelector(".ordered");
        this.bidButton = this.querySelector(".bidButton");
        this.askButton = this.querySelector(".askButton");
        this.renderOrdereds();
        (_a = this.orderedButton) === null || _a === void 0 ? void 0 : _a.addEventListener("click", this.handleOrdereds);
        (_b = this.bidButton) === null || _b === void 0 ? void 0 : _b.addEventListener("click", this.handleOrderBid);
        (_c = this.askButton) === null || _c === void 0 ? void 0 : _c.addEventListener("click", this.handleOrderAsk);
    }
    disconnectedCallback() {
        var _a, _b, _c;
        (_a = this.orderedButton) === null || _a === void 0 ? void 0 : _a.removeEventListener("click", this.handleOrdereds);
        (_b = this.bidButton) === null || _b === void 0 ? void 0 : _b.removeEventListener("click", this.handleOrderBid);
        (_c = this.askButton) === null || _c === void 0 ? void 0 : _c.removeEventListener("click", this.handleOrderAsk);
    }
    render() {
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
    renderOrdereds() {
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
    handleOrdereds() {
        if (!this.ordered)
            return;
        this.ordered.hidden = !this.ordered.hidden;
    }
    handleOrderBid() {
        var _a;
        if (this.orderBid) {
            if (this.orderBid.hidden)
                this.orderBid.show();
            else
                this.orderBid.hide();
            return;
        }
        this.orderBid = new OrderBid(this);
        (_a = this.querySelector("#orderBid")) === null || _a === void 0 ? void 0 : _a.replaceWith(this.orderBid);
    }
    showOrderBid() {
        if (!this.bidButton)
            return;
        this.bidButton.textContent = "매수 가리기";
    }
    hideOrderBid() {
        if (!this.bidButton)
            return;
        this.bidButton.textContent = "매수";
    }
    handleOrderAsk() {
        var _a;
        if (this.orderAsk) {
            if (this.orderAsk.hidden)
                this.orderAsk.show();
            else
                this.orderAsk.hide();
            return;
        }
        this.orderAsk = new OrderAsk(this);
        (_a = this.querySelector("#orderAsk")) === null || _a === void 0 ? void 0 : _a.replaceWith(this.orderAsk);
    }
    showOrderAsk() {
        if (!this.askButton)
            return;
        this.askButton.textContent = "매도 가리기";
    }
    hideOrderAsk() {
        if (!this.askButton)
            return;
        this.askButton.textContent = "매도";
    }
}
//# sourceMappingURL=AccountItem.js.map