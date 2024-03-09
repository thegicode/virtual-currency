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

        this.orderPrice = this.setOrderPrice(price);

        this.priceInput.value = this.orderPrice.toLocaleString();
    }

    protected validateInputNumber(value: string) {
        return value.replace(/[^0-9.-]+/g, "");
    }

    private setOrderPrice(price: number) {
        const orderUnit = this.calculateOrderUnit(price);
        const decimalString = orderUnit.toString().split(".")[1];

        if (decimalString) {
            return parseFloat(price.toFixed(decimalString.length));
        } else {
            return Math.round(price / orderUnit) * orderUnit;
        }
    }

    // private transformPrice(price: number) {
    //     const roundUnits: { [key: string]: number } = {
    //         "KRW-BTC": 1000,
    //         "KRW-ETH": 1000,
    //         "KRW-BCH": 50,
    //     };

    //     const decimalCount = this.accountItem.decimalCount || 0;
    //     const roundUnit = roundUnits[this.market as string] || 1;

    //     if (decimalCount > 0) {
    //         const roundedPrice = price / roundUnit;
    //         return parseFloat(roundedPrice.toFixed(decimalCount));
    //     } else {
    //         return Math.round(price / roundUnit) * roundUnit;
    //     }
    // }

    private calculateOrderUnit(price: number) {
        const MAX_ORDER_UNIT = 1000;
        let orderUnit = 1;

        const count = price.toString().split(".")[0].length - 1;
        // const integerPartLength = Math.floor(Math.log10(price));

        for (let i = 0; i < count; i++) {
            orderUnit *= 10;
        }

        const result = orderUnit / 1000;

        return result >= MAX_ORDER_UNIT ? MAX_ORDER_UNIT : result;
    }

    /*  test() {
        const originPrice = [
            1, 12.3, 123, 1234.33, 12345.099, 123456.999, 1234567.77, 12345678,
            12345678.88888,
        ];

        const price = originPrice.map((p) => {
            let supply = 1;

            const count = Number(p.toString().split(".")[0].length) - 1;

            for (let i = 0; i < count; i++) {
                supply *= 10;
            }

            return supply;
        });

        // console.log(price);

        // const price = [
        //     1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000,
        // ];

        const result = price.map((p) => p / 1000);

        console.log(result);
        // [0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 1000]
    } */
}
