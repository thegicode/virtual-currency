import { cloneTemplate } from "@app/scripts/utils/helpers";
import AccountItem from "./AccountItem";
import OrderedItem from "./OrderedItem";

export default class OrderAsk extends HTMLElement {
    private parent: AccountItem;
    private template: HTMLTemplateElement;
    private form: HTMLFormElement | null = null;
    private amountInput: HTMLInputElement | null = null;
    private priceInput: HTMLInputElement | null = null;
    private amountRadios: any | null = null;
    private priceRadios: any | null = null;
    private amountManual: HTMLInputElement | null = null;
    private priceManual: HTMLInputElement | null = null;
    private orderData: {
        volume: number;
        price: number;
    } = {
        volume: 0,
        price: 0,
    };

    constructor(parent: AccountItem) {
        super();

        this.parent = parent as AccountItem;

        this.template = document.querySelector(
            "#tp-orderAsk"
        ) as HTMLTemplateElement;

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

        this.form = this.querySelector("form") as HTMLFormElement;

        this.amountInput = this.querySelector(
            "input[name=amount]"
        ) as HTMLInputElement;
        this.priceInput = this.querySelector(
            "input[name=price]"
        ) as HTMLInputElement;

        this.amountRadios = this.querySelectorAll<HTMLInputElement>(
            "input[name=amount-option]"
        );
        this.priceRadios = this.querySelectorAll<HTMLInputElement>(
            "input[name=price-option]"
        );

        this.amountManual = this.querySelector(
            "input[name=amount-option-manual]"
        ) as HTMLInputElement;
        this.priceManual = this.querySelector(
            "input[name=price-option-manual]"
        ) as HTMLInputElement;

        this.form.addEventListener("submit", this.onSubmit);
        this.form.addEventListener("reset", this.onReset);

        this.amountRadios.forEach((radio: HTMLInputElement) => {
            radio.addEventListener("change", this.onChangeAmountRadios);
        });
        this.amountManual.addEventListener("input", this.onInputAmountManual);

        this.priceRadios.forEach((radio: HTMLInputElement) => {
            radio.addEventListener("change", this.onChangePriceRadios);
        });
        this.priceManual.addEventListener("input", this.onInputPriceManual);

        this.priceInput.addEventListener("input", this.onPriceInput);
    }

    private render() {
        const cloned = cloneTemplate(this.template);
        this.appendChild(cloned);
        this.show();
    }

    public show() {
        this.hidden = false;
        this.parent.showOrderAsk();
    }

    public hide() {
        this.hidden = true;
        this.parent.hideOrderAsk();
    }

    private async onSubmit(event: Event) {
        event.preventDefault();

        const searchParams = new URLSearchParams({
            market: this.parent.market,
            side: "ask",
            volume: this.orderData.volume.toString(),
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
        this.orderData.volume = 0;
        this.orderData.price = 0;
        console.log(this.orderData);
    }

    // volume
    private onChangeAmountRadios(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.value === "manual") return;
        this.calculateVolume(parseInt(target.value));
    }
    private onInputAmountManual(event: Event) {
        const target = event.target as HTMLInputElement;
        this.calculateVolume(parseInt(target.value));
    }
    private calculateVolume(aPercent: number) {
        if (!this.amountInput) return;
        this.orderData.volume = (this.parent.volume * aPercent) / 100;
        this.amountInput.value = this.orderData.volume.toString();
    }

    // price
    private onChangePriceRadios(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.value === "manual") return;
        this.calculatePrice(parseInt(target.value));
    }
    private onInputPriceManual(event: Event) {
        const target = event.target as HTMLInputElement;
        this.calculatePrice(parseInt(target.value));
    }
    private calculatePrice(aPercent: number) {
        const value = this.parent.avgBuyPrice * aPercent * 0.01;
        this.setPrice(this.parent.avgBuyPrice + value);
    }
    private onPriceInput(event: Event) {
        const target = event.target as HTMLInputElement;
        this.setPrice(parseInt(target.value));
    }
    private setPrice(price: number) {
        if (!this.priceInput) return;

        this.orderData.price = Math.round(price);
        this.priceInput.value = this.orderData.price.toLocaleString();
    }
}
