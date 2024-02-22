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
export default class OrderBid extends HTMLElement {
    constructor(parent) {
        super();
        this.form = null;
        this.amountInput = null;
        this.priceInput = null;
        this.priceRadios = null;
        this.priceManual = null;
        this.hideButton = null;
        this.orderData = {
            amountPrice: 0,
            price: 0,
        };
        this.parent = parent;
        this.template = document.querySelector("#tp-orderBid");
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onReset = this.onReset.bind(this);
        this.onInputAmount = this.onInputAmount.bind(this);
        this.onChangepriceRadios = this.onChangepriceRadios.bind(this);
        this.onInputPriceManual = this.onInputPriceManual.bind(this);
    }
    connectedCallback() {
        this.render();
        this.form = this.querySelector("form");
        this.amountInput = this.querySelector("input[name=amount]");
        this.priceInput = this.querySelector("input[name=price]");
        this.priceRadios = this.querySelectorAll("input[name=price-option]");
        this.priceManual = this.querySelector("input[name=price-option-manual]");
        this.hideButton = this.querySelector(".hideButton");
        this.form.addEventListener("submit", this.onSubmit);
        this.form.addEventListener("reset", this.onReset);
        this.amountInput.addEventListener("input", this.onInputAmount);
        this.priceRadios.forEach((radio) => {
            radio.addEventListener("change", this.onChangepriceRadios);
        });
        this.priceManual.addEventListener("input", this.onInputPriceManual);
        this.hideButton.addEventListener("click", this.hide);
    }
    render() {
        const cloned = cloneTemplate(this.template);
        this.appendChild(cloned);
        this.show();
    }
    show() {
        this.hidden = false;
        this.parent.showOrderBid();
    }
    hide() {
        this.hidden = true;
        this.parent.hideOrderBid();
    }
    onSubmit(event) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const price = Math.round(this.orderData.price || 0);
            const volume = this.orderData.amountPrice && this.orderData.price
                ? (this.orderData.amountPrice / price).toString()
                : "0";
            const searchParams = new URLSearchParams({
                market: this.parent.market,
                side: "bid",
                volume,
                price: (_a = price.toString()) !== null && _a !== void 0 ? _a : "",
                ord_type: "limit",
            });
            const response = yield fetch(`/fetchOrders?${searchParams}`);
            const data = yield response.json();
            this.renderOrderItem(data);
        });
    }
    renderOrderItem(data) {
        const orderItem = new OrderedItem(data);
        if (this.parent.orderedElement) {
            const firstChild = this.parent.orderedElement.querySelector("ordered-item");
            this.parent.orderedElement.insertBefore(orderItem, firstChild);
        }
    }
    onReset() {
        this.orderData.amountPrice = 0;
        this.orderData.price = 0;
        console.log(this.orderData);
    }
    onInputAmount(event) {
        const target = event.target;
        const validateValue = target.value.replace(/[^0-9.-]+/g, "");
        this.orderData.amountPrice = Number(validateValue);
        target.value = this.orderData.amountPrice.toLocaleString();
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
        if (!this.priceInput)
            return;
        const value = this.parent.avgBuyPrice * aPercent * 0.01;
        this.orderData.price = this.parent.avgBuyPrice + value;
        this.priceInput.value = this.orderData.price.toLocaleString();
    }
}
//# sourceMappingURL=OrderBid.js.map