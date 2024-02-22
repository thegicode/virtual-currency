import { cloneTemplate } from "@app/scripts/utils/helpers";
import AccountItem from "./AccountItem";
import OrderedItem from "./OrderedItem";

export default class OrderBase extends HTMLElement {
    protected accountItem: AccountItem;
    protected formElement: HTMLFormElement | null = null;
    protected template: HTMLTemplateElement | null = null;

    protected priceRadios: NodeListOf<HTMLInputElement> | null = null;
    protected priceManual: HTMLInputElement | null = null;
    protected priceInput: HTMLInputElement | null = null;

    protected orderPrice: number = 0;

    constructor(accountItem: AccountItem) {
        super();

        this.accountItem = accountItem;

        this.onChangepriceRadios = this.onChangepriceRadios.bind(this);
        this.onInputPriceManual = this.onInputPriceManual.bind(this);
        this.onInputPrice = this.onInputPrice.bind(this);
    }

    connectedCallback() {
        this.render();

        this.formElement = this.querySelector("form");

        this.priceRadios = this.querySelectorAll<HTMLInputElement>(
            "input[name=price-option]"
        );
        this.priceManual = this.querySelector(
            "input[name=price-option-manual]"
        );
        this.priceInput = this.querySelector("input[name=price]");

        this.priceRadios.forEach((radio: HTMLInputElement) => {
            radio.addEventListener("change", this.onChangepriceRadios);
        });
        this.priceManual?.addEventListener("input", this.onInputPriceManual);
        this.priceInput?.addEventListener("input", this.onInputPrice);
    }

    protected render() {
        if (!this.template) return;
        const cloned = cloneTemplate(this.template);
        this.appendChild(cloned);
    }

    protected async fetchData(searchParams: URLSearchParams) {
        const response = await fetch(`/fetchOrders?${searchParams}`);
        const data = await response.json();

        this.renderOrderItem(data);
    }

    protected renderOrderItem(data: IOrdered) {
        const orderItem = new OrderedItem(data);
        if (this.accountItem.orderedElement) {
            const firstChild =
                this.accountItem.orderedElement.querySelector("ordered-item");
            this.accountItem.orderedElement.insertBefore(orderItem, firstChild);
        }
    }

    // price
    protected onChangepriceRadios(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.value === "manual") return;
        this.calculatePrice(parseInt(target.value));
    }

    protected onInputPriceManual(event: Event) {
        const target = event.target as HTMLInputElement;
        this.calculatePrice(-parseInt(target.value));
    }

    protected calculatePrice(aPercent: number) {
        const value = this.accountItem.avgBuyPrice * aPercent * 0.01;
        this.setPrice(this.accountItem.avgBuyPrice + value);
    }

    protected onInputPrice(event: Event) {
        const target = event.target as HTMLInputElement;
        const validateValue = this.validateInputNumber(target.value);

        this.setPrice(parseInt(validateValue));
    }

    protected setPrice(price: number) {
        if (!this.priceInput) return;
        this.orderPrice = Math.round(price);
        this.priceInput.value = this.orderPrice.toLocaleString();
    }

    protected validateInputNumber(value: string) {
        return value.replace(/[^0-9.-]+/g, "");
    }
}
