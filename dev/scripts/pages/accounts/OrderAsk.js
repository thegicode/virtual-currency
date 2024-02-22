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
export default class OrderAsk extends HTMLElement {
    constructor(parent) {
        super();
        this.form = null;
        this.amountInput = null;
        this.priceInput = null;
        this.amountRadios = null;
        this.priceRadios = null;
        this.amountManual = null;
        this.priceManual = null;
        this.orderData = {
            volume: 0,
            price: 0,
        };
        this.parent = parent;
        this.template = document.querySelector("#tp-orderAsk");
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onReset = this.onReset.bind(this);
        this.onChangeAmountRadios = this.onChangeAmountRadios.bind(this);
        this.onChangePriceRadios = this.onChangePriceRadios.bind(this);
        this.onInputAmountManual = this.onInputAmountManual.bind(this);
        this.onInputPriceManual = this.onInputPriceManual.bind(this);
        this.onPriceInput = this.onPriceInput.bind(this);
    }
    connectedCallback() {
        this.render();
        this.form = this.querySelector("form");
        this.amountInput = this.querySelector("input[name=amount]");
        this.priceInput = this.querySelector("input[name=price]");
        this.amountRadios = this.querySelectorAll("input[name=amount-option]");
        this.priceRadios = this.querySelectorAll("input[name=price-option]");
        this.amountManual = this.querySelector("input[name=amount-option-manual]");
        this.priceManual = this.querySelector("input[name=price-option-manual]");
        this.form.addEventListener("submit", this.onSubmit);
        this.form.addEventListener("reset", this.onReset);
        this.amountRadios.forEach((radio) => {
            radio.addEventListener("change", this.onChangeAmountRadios);
        });
        this.amountManual.addEventListener("input", this.onInputAmountManual);
        this.priceRadios.forEach((radio) => {
            radio.addEventListener("change", this.onChangePriceRadios);
        });
        this.priceManual.addEventListener("input", this.onInputPriceManual);
        this.priceInput.addEventListener("input", this.onPriceInput);
    }
    render() {
        const cloned = cloneTemplate(this.template);
        this.appendChild(cloned);
        this.show();
    }
    show() {
        this.hidden = false;
        this.parent.showOrderAsk();
    }
    hide() {
        this.hidden = true;
        this.parent.hideOrderAsk();
    }
    onSubmit(event) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const searchParams = new URLSearchParams({
                market: this.parent.market,
                side: "ask",
                volume: this.orderData.volume.toString(),
                price: (_a = this.orderData.price.toString()) !== null && _a !== void 0 ? _a : "",
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
        this.orderData.volume = 0;
        this.orderData.price = 0;
        console.log(this.orderData);
    }
    onChangeAmountRadios(event) {
        const target = event.target;
        if (target.value === "manual")
            return;
        this.calculateVolume(parseInt(target.value));
    }
    onInputAmountManual(event) {
        const target = event.target;
        this.calculateVolume(parseInt(target.value));
    }
    calculateVolume(aPercent) {
        if (!this.amountInput)
            return;
        this.orderData.volume = (this.parent.volume * aPercent) / 100;
        this.amountInput.value = this.orderData.volume.toString();
    }
    onChangePriceRadios(event) {
        const target = event.target;
        if (target.value === "manual")
            return;
        this.calculatePrice(parseInt(target.value));
    }
    onInputPriceManual(event) {
        const target = event.target;
        this.calculatePrice(parseInt(target.value));
    }
    calculatePrice(aPercent) {
        const value = this.parent.avgBuyPrice * aPercent * 0.01;
        this.setPrice(this.parent.avgBuyPrice + value);
    }
    onPriceInput(event) {
        const target = event.target;
        this.setPrice(parseInt(target.value));
    }
    setPrice(price) {
        if (!this.priceInput)
            return;
        this.orderData.price = Math.round(price);
        this.priceInput.value = this.orderData.price.toLocaleString();
    }
}
//# sourceMappingURL=OrderAsk.js.map