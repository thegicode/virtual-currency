var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cloneTemplate } from "@app/scripts/utils/helpers";
import OrderedItem from "./OrderedItem";
export default class OrderBase extends HTMLElement {
    constructor(accountItem) {
        super();
        this.formElement = null;
        this.template = null;
        this.priceRadios = null;
        this.priceManual = null;
        this.priceInput = null;
        this.memoElement = null;
        this.orderPrice = 0;
        this.accountItem = accountItem;
        this.onChangepriceRadios = this.onChangepriceRadios.bind(this);
        this.onInputPriceManual = this.onInputPriceManual.bind(this);
        this.onInputPrice = this.onInputPrice.bind(this);
    }
    connectedCallback() {
        var _a, _b;
        this.render();
        this.formElement = this.querySelector("form");
        this.priceRadios = this.querySelectorAll("input[name=price-option]");
        this.priceManual = this.querySelector("input[name=price-option-manual]");
        this.priceInput = this.querySelector("input[name=price]");
        this.memoElement = this.querySelector(".memo");
        this.priceRadios.forEach((radio) => {
            radio.addEventListener("change", this.onChangepriceRadios);
        });
        (_a = this.priceManual) === null || _a === void 0 ? void 0 : _a.addEventListener("input", this.onInputPriceManual);
        (_b = this.priceInput) === null || _b === void 0 ? void 0 : _b.addEventListener("input", this.onInputPrice);
    }
    render() {
        if (!this.template)
            return;
        const cloned = cloneTemplate(this.template);
        this.appendChild(cloned);
    }
    fetchData(searchParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`/fetchOrders?${searchParams}`);
            const data = yield response.json();
            this.renderOrderItem(data);
        });
    }
    renderOrderItem(data) {
        const orderItem = new OrderedItem(data);
        if (this.accountItem.orderedElement) {
            const firstChild = this.accountItem.orderedElement.querySelector("ordered-item");
            this.accountItem.orderedElement.insertBefore(orderItem, firstChild);
        }
    }
    getOrderChance() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`/fetchChance?market=${this.accountItem.market}`);
            return yield response.json();
        });
    }
    onChangepriceRadios(event) {
        const target = event.target;
        if (target.value === "manual")
            return;
        this.calculatePrice(parseInt(target.value));
    }
    onInputPriceManual(event) {
        const target = event.target;
        this.calculatePrice(-parseInt(target.value));
    }
    calculatePrice(aPercent) {
        const value = this.accountItem.avgBuyPrice * aPercent * 0.01;
        this.setPrice(this.accountItem.avgBuyPrice + value);
    }
    onInputPrice(event) {
        const target = event.target;
        const validateValue = this.validateInputNumber(target.value);
        this.setPrice(parseInt(validateValue));
    }
    setPrice(price) {
        if (!this.priceInput)
            return;
        this.orderPrice = Math.round(price);
        this.priceInput.value = this.orderPrice.toLocaleString();
    }
    validateInputNumber(value) {
        return value.replace(/[^0-9.-]+/g, "");
    }
}
//# sourceMappingURL=OrderBase.js.map