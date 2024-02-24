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
    protected memoElement: HTMLElement | null = null;

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
        this.memoElement = this.querySelector(".memo") as HTMLElement;

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
        if (!response.ok) {
            if (this.memoElement)
                this.memoElement.textContent = `Fail Order: status ${response.status}`;
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.renderOrderItem(data);
        return data;
    }

    protected renderOrderItem(data: IOrdered) {
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
    protected async getOrderChance() {
        const response = await fetch(
            `/fetchChance?market=${this.accountItem.market}`
        );
        return await response.json();
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

/* 
{
    "bid_fee": "0.0005",
    "ask_fee": "0.0005",
    "maker_bid_fee": "0.0005",
    "maker_ask_fee": "0.0005",
    "market": {
        "id": "KRW-SBD",
        "name": "SBD/KRW",
        "order_types": [
            "limit"
        ],
        "order_sides": [
            "ask",
            "bid"
        ],
        "bid_types": [
            "limit",
            "price"
        ],
        "ask_types": [
            "limit",
            "market"
        ],
        "bid": {
            "currency": "KRW",
            "min_total": "5000"
        },
        "ask": {
            "currency": "SBD",
            "min_total": "5000"
        },
        "max_total": "1000000000",
        "state": "active"
    },
    "bid_account": {
        "currency": "KRW",
        "balance": "1609989.37213439",
        "locked": "90045.71761545",
        "avg_buy_price": "0",
        "avg_buy_price_modified": true,
        "unit_currency": "KRW"
    },
    "ask_account": {
        "currency": "SBD",
        "balance": "0",
        "locked": "7.48648155",
        "avg_buy_price": "5342.96380811",
        "avg_buy_price_modified": false,
        "unit_currency": "KRW"
    }
} */
