import { cloneTemplate } from "@app/scripts/utils/helpers";
export default class OrderBid extends HTMLElement {
    constructor(parent) {
        super();
        this.form = null;
        this.amountInput = null;
        this.priceInput = null;
        this.priceSelect = null;
        this.priceManual = null;
        this.hideButton = null;
        this.formData = {
            amount: null,
            price: null,
        };
        this.parent = parent;
        this.template = document.querySelector("#tp-orderBid");
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.onChangePriceSelect = this.onChangePriceSelect.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onReset = this.onReset.bind(this);
        this.onInputAmount = this.onInputAmount.bind(this);
        this.onInputPriceManual = this.onInputPriceManual.bind(this);
    }
    connectedCallback() {
        this.render();
        this.form = this.querySelector("form");
        this.amountInput = this.querySelector("input[name=amount]");
        this.priceInput = this.querySelector("input[name=price]");
        this.priceSelect = this.querySelector("select[name=price-option]");
        this.priceManual = this.querySelector("input[name=price-manual]");
        this.hideButton = this.querySelector(".hideButton");
        this.form.addEventListener("submit", this.onSubmit);
        this.form.addEventListener("reset", this.onReset);
        this.amountInput.addEventListener("input", this.onInputAmount);
        this.priceSelect.addEventListener("change", this.onChangePriceSelect);
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
        event.preventDefault();
        console.log(this.formData);
    }
    onReset() {
        this.formData.amount = null;
        this.formData.price = null;
        console.log(this.formData);
    }
    onInputAmount(event) {
        const target = event.target;
        const validateValue = target.value.replace(/[^0-9.-]+/g, "");
        this.formData.amount = Number(validateValue);
        target.value = this.formData.amount.toLocaleString();
    }
    onChangePriceSelect(event) {
        if (!this.priceInput)
            return;
        const target = event.target;
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
        this.formData.price = this.parent.avgBuyPrice + value;
        this.priceInput.value = this.formData.price.toLocaleString();
    }
}
//# sourceMappingURL=OrderBid.js.map