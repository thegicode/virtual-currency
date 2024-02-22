import { cloneTemplate } from "@app/scripts/utils/helpers";
import AccountItem from "./AccountItem";
import OrderedItem from "./OrderedItem";

export default class OrderBid extends HTMLElement {
    private parent: AccountItem;
    private template: HTMLTemplateElement;
    private form: HTMLFormElement | null = null;
    private amountInput: HTMLInputElement | null = null;
    private priceInput: HTMLInputElement | null = null;
    private priceRadios: any | null = null;
    private priceManual: HTMLInputElement | null = null;
    private orderData: {
        amountPrice: number;
        price: number;
    } = {
        amountPrice: 0,
        price: 0,
    };

    constructor(parent: AccountItem) {
        super();

        this.parent = parent as AccountItem;

        this.template = document.querySelector(
            "#tp-orderBid"
        ) as HTMLTemplateElement;

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onReset = this.onReset.bind(this);
        this.onInputAmount = this.onInputAmount.bind(this);
        this.onChangepriceRadios = this.onChangepriceRadios.bind(this);
        this.onInputPriceManual = this.onInputPriceManual.bind(this);
        this.onInputPrice = this.onInputPrice.bind(this);
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
        this.priceRadios = this.querySelectorAll<HTMLInputElement>(
            "input[name=price-option]"
        );
        this.priceManual = this.querySelector(
            "input[name=price-option-manual]"
        ) as HTMLInputElement;

        this.form.addEventListener("submit", this.onSubmit);
        this.form.addEventListener("reset", this.onReset);
        this.amountInput.addEventListener("input", this.onInputAmount);
        this.priceRadios.forEach((radio: HTMLInputElement) => {
            radio.addEventListener("change", this.onChangepriceRadios);
        });
        this.priceManual.addEventListener("input", this.onInputPriceManual);
        this.priceInput.addEventListener("input", this.onInputPrice);
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

    public hide() {
        this.hidden = true;
        this.parent.hideOrderBid();
    }

    private async onSubmit(event: Event) {
        event.preventDefault();

        const volume =
            this.orderData.amountPrice && this.orderData.price
                ? (this.orderData.amountPrice / this.orderData.price).toString()
                : "0";

        const searchParams = new URLSearchParams({
            market: this.parent.market,
            side: "bid",
            volume,
            price: this.orderData.price.toString() ?? "",
            ord_type: "limit",
        });

        const response = await fetch(`/fetchOrders?${searchParams}`);
        const data = await response.json();

        this.renderOrderItem(data);
    }

    private renderOrderItem(data: IOrdered) {
        const orderItem = new OrderedItem(data);
        if (this.parent.orderedElement) {
            const firstChild =
                this.parent.orderedElement.querySelector("ordered-item");
            this.parent.orderedElement.insertBefore(orderItem, firstChild);
        }
    }

    private onReset() {
        this.orderData.amountPrice = 0;
        this.orderData.price = 0;
        console.log(this.orderData);
    }

    private onInputAmount(event: Event) {
        const target = event.target as HTMLInputElement;
        const validateValue = target.value.replace(/[^0-9.-]+/g, "");
        this.orderData.amountPrice = Number(validateValue);
        target.value = this.orderData.amountPrice.toLocaleString();
    }

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
        const value = this.parent.avgBuyPrice * aPercent * 0.01;
        this.setPrice(this.parent.avgBuyPrice + value);
    }

    private onInputPrice(event: Event) {
        const target = event.target as HTMLInputElement;
        const validateValue = target.value.replace(/[^0-9.-]+/g, "");

        this.setPrice(parseInt(validateValue));
    }

    private setPrice(price: number) {
        if (!this.priceInput) return;
        this.orderData.price = Math.round(price);
        this.priceInput.value = this.orderData.price.toLocaleString();
    }
}
