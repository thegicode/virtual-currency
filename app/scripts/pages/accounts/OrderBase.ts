import { cloneTemplate } from "@app/scripts/utils/helpers";
import AccountItem from "./AccountItem";
import OrderedItem from "./OrderedItem";

export default class OrderBase extends HTMLElement {
    protected accountItem: AccountItem;
    protected market: string;
    protected formElement: HTMLFormElement | null = null;
    protected template: HTMLTemplateElement | null = null;

    protected priceRadios: NodeListOf<HTMLInputElement> | null = null;
    protected priceManual: HTMLInputElement | null = null;
    protected priceInput: HTMLInputElement | null = null;
    protected memoElement: HTMLElement | null = null;

    protected orderPrice: number = 0;

    constructor(accountItem: AccountItem) {
        super();

        this.accountItem = accountItem;
        this.market = accountItem.market;

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
        this.memoElement = this.querySelector(".memo") as HTMLElement;

        this.priceRadios.forEach((radio: HTMLInputElement) => {
            radio.addEventListener("change", this.onChangepriceRadios);
        });
        this.priceManual?.addEventListener("input", this.onInputPriceManual);
        this.priceInput?.addEventListener("input", this.onInputPrice);
    }

    private render() {
        if (!this.template) return;
        const cloned = cloneTemplate(this.template);
        this.appendChild(cloned);
    }

    protected async fetchData(searchParams: URLSearchParams) {
        const response = await fetch(`/fetchOrders?${searchParams}`);
        if (!response.ok) {
            if (this.memoElement)
                this.memoElement.textContent = `Fail Order: status ${response.status}`;
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.error) {
            if (this.memoElement)
                this.memoElement.textContent = data.error.message;
            console.log(data.error);
            return;
        }

        this.renderOrderItem(data);
        return data;
    }

    private renderOrderItem(data: IOrdered) {
        const orderItem = new OrderedItem(data);
        if (!this.accountItem.orderedElement) return;

        const firstChild =
            this.accountItem.orderedElement.querySelector("ordered-item");

        if (firstChild) {
            this.accountItem.orderedElement.insertBefore(orderItem, firstChild);
        } else {
            this.accountItem.orderedElement.appendChild(orderItem);
            this.accountItem.orderedElement.hidden = false;
        }
    }

    // chance
    // private async getOrderChance() {
    //     const response = await fetch(`/fetchChance?market=${this.market}`);
    //     return await response.json();
    // }

    // price
    private onChangepriceRadios(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.value === "manual") return;
        this.calculatePrice(parseInt(target.value));
    }

    private onInputPriceManual(event: Event) {
        const target = event.target as HTMLInputElement;
        this.calculatePrice(-parseInt(target.value));
    }

    private calculatePrice(aPercent: number) {
        const value = this.accountItem.avgBuyPrice * aPercent * 0.01;
        this.setPrice(this.accountItem.avgBuyPrice + value);
    }

    private onInputPrice(event: Event) {
        const target = event.target as HTMLInputElement;
        const validateValue = this.validateInputNumber(target.value);

        this.setPrice(parseInt(validateValue));
    }

    private setPrice(price: number) {
        if (!this.priceInput) return;

        this.orderPrice = this.transformPrice(price);

        this.priceInput.value = this.orderPrice.toLocaleString();
    }

    protected validateInputNumber(value: string) {
        return value.replace(/[^0-9.-]+/g, "");
    }

    private transformPrice(price: number) {
        const roundUnits: { [key: string]: number } = {
            "KRW-BTC": 1000,
            "KRW-ETH": 1000,
            "KRW-BCH": 50,
        };

        const decimalCount = this.accountItem.decimalCount || 0;
        const roundUnit = roundUnits[this.market as string] || 1;

        if (decimalCount > 0) {
            const roundedPrice = price / roundUnit;
            return parseFloat(roundedPrice.toFixed(decimalCount));
        } else {
            return Math.round(price / roundUnit) * roundUnit;
        }
    }
}
