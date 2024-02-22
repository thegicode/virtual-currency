import { cloneTemplate } from "@app/scripts/utils/helpers";
import AccountItem from "./AccountItem";
import OrderedItem from "./OrderedItem";

export default class OrderAsk extends HTMLElement {
    private parent: AccountItem;
    private template: HTMLTemplateElement;
    private form: HTMLFormElement | null = null;
    private volumeInput: HTMLInputElement | null = null;
    private priceInput: HTMLInputElement | null = null;
    private volumeRadios: any | null = null;
    private priceRadios: any | null = null;
    private volumeManual: HTMLInputElement | null = null;
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
        this.onChangeVolumeRadios = this.onChangeVolumeRadios.bind(this);
        this.onChangePriceRadios = this.onChangePriceRadios.bind(this);
        this.onInputVolumeManual = this.onInputVolumeManual.bind(this);
        this.onInputPriceManual = this.onInputPriceManual.bind(this);
        this.onInputPrice = this.onInputPrice.bind(this);
    }

    connectedCallback() {
        this.render();

        this.form = this.querySelector("form") as HTMLFormElement;

        this.volumeInput = this.querySelector(
            "input[name=volume]"
        ) as HTMLInputElement;
        this.priceInput = this.querySelector(
            "input[name=price]"
        ) as HTMLInputElement;

        this.volumeRadios = this.querySelectorAll<HTMLInputElement>(
            "input[name=volume-option]"
        );
        this.priceRadios = this.querySelectorAll<HTMLInputElement>(
            "input[name=price-option]"
        );

        this.volumeManual = this.querySelector(
            "input[name=volume-option-manual]"
        ) as HTMLInputElement;
        this.priceManual = this.querySelector(
            "input[name=price-option-manual]"
        ) as HTMLInputElement;

        this.form.addEventListener("submit", this.onSubmit);
        this.form.addEventListener("reset", this.onReset);

        this.volumeRadios.forEach((radio: HTMLInputElement) => {
            radio.addEventListener("change", this.onChangeVolumeRadios);
        });
        this.volumeManual.addEventListener("input", this.onInputVolumeManual);

        this.priceRadios.forEach((radio: HTMLInputElement) => {
            radio.addEventListener("change", this.onChangePriceRadios);
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
    private onChangeVolumeRadios(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.value === "manual") return;
        this.calculateVolume(parseInt(target.value));
    }
    private onInputVolumeManual(event: Event) {
        const target = event.target as HTMLInputElement;
        this.calculateVolume(parseInt(target.value));
    }
    private calculateVolume(aPercent: number) {
        if (!this.volumeInput) return;
        this.orderData.volume = (this.parent.volume * aPercent) / 100;
        this.volumeInput.value = this.orderData.volume.toString();
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
