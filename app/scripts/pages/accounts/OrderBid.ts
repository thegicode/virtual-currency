import { cloneTemplate } from "@app/scripts/utils/helpers";
import AccountItem from "./AccountItem";

export default class OrderBid extends HTMLElement {
    private parent: AccountItem;
    private template: HTMLTemplateElement;
    private form: HTMLFormElement | null = null;
    private amountInput: HTMLInputElement | null = null;
    private priceInput: HTMLInputElement | null = null;
    private priceSelect: HTMLSelectElement | null = null;
    private priceManual: HTMLInputElement | null = null;
    private hideButton: HTMLButtonElement | null = null;
    private formData: {
        amount: number | null;
        price: number | null;
    } = {
        amount: null,
        price: null,
    };

    constructor(parent: AccountItem) {
        super();

        this.parent = parent as AccountItem;

        this.template = document.querySelector(
            "#tp-orderBid"
        ) as HTMLTemplateElement;

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

        this.form = this.querySelector("form") as HTMLFormElement;

        this.amountInput = this.querySelector(
            "input[name=amount]"
        ) as HTMLInputElement;
        this.priceInput = this.querySelector(
            "input[name=price]"
        ) as HTMLInputElement;
        this.priceSelect = this.querySelector(
            "select[name=price-option]"
        ) as HTMLSelectElement;
        this.priceManual = this.querySelector(
            "input[name=price-manual]"
        ) as HTMLInputElement;

        this.hideButton = this.querySelector(
            ".hideButton"
        ) as HTMLButtonElement;

        this.form.addEventListener("submit", this.onSubmit);
        this.form.addEventListener("reset", this.onReset);
        this.amountInput.addEventListener("input", this.onInputAmount);
        this.priceSelect.addEventListener("change", this.onChangePriceSelect);
        this.priceManual.addEventListener("input", this.onInputPriceManual);
        this.hideButton.addEventListener("click", this.hide);
    }

    private render() {
        const cloned = cloneTemplate(this.template);
        this.appendChild(cloned);
        this.show();
    }

    public show() {
        this.hidden = false;
        this.parent.showOrderBid();
    }

    private hide() {
        this.hidden = true;
        this.parent.hideOrderBid();
    }

    private onSubmit(event: Event) {
        event.preventDefault();
        console.log(this.formData);
    }

    private onReset() {
        this.formData.amount = null;
        this.formData.price = null;
        console.log(this.formData);
    }

    private onInputAmount(event: Event) {
        const target = event.target as HTMLInputElement;
        const validateValue = target.value.replace(/[^0-9.-]+/g, "");
        this.formData.amount = Number(validateValue);
        target.value = this.formData.amount.toLocaleString();
    }

    private onChangePriceSelect(event: Event) {
        if (!this.priceInput) return;

        const target = event.target as HTMLSelectElement;
        this.calculatePrice(parseInt(target.value));
    }

    private onInputPriceManual(event: Event) {
        const target = event.target as HTMLInputElement;
        this.calculatePrice(-parseInt(target.value));
    }

    private calculatePrice(aPercent: number) {
        if (!this.priceInput) return;

        const value = this.parent.avgBuyPrice * aPercent * 0.01;
        this.formData.price = this.parent.avgBuyPrice + value;
        this.priceInput.value = this.formData.price.toLocaleString();
    }
}
