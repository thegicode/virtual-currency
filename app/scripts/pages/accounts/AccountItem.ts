import {
    cloneTemplate,
    roundToDecimalPlace,
    updateElementsTextWithData,
} from "@scripts/utils/helpers";
import OrderedItem from "./OrderedItem";

export default class AccountItem extends HTMLElement {
    private data: IProcessedAccountData;
    private template: HTMLTemplateElement;
    private orderedButton: HTMLButtonElement | null = null;
    private ordered: HTMLElement | null = null;

    constructor(data: IProcessedAccountData) {
        super();

        this.data = data;

        this.template = document.querySelector(
            "#accountItem"
        ) as HTMLTemplateElement;

        this.orderedButton = null;
        this.ordered = null;

        this.handleOrdered = this.handleOrdered.bind(this);
    }

    connectedCallback() {
        this.createElement();

        this.orderedButton = this.querySelector(
            ".orderedButton"
        ) as HTMLButtonElement;

        this.ordered = this.querySelector(".ordered") as HTMLElement;

        this.displayOrdered();

        this.orderedButton?.addEventListener("click", this.handleOrdered);
    }

    disconnectedCallback() {
        this.orderedButton?.removeEventListener("click", this.handleOrdered);
    }

    private handleOrdered() {
        if (!this.ordered) return;
        this.ordered.hidden = !this.ordered.hidden;
    }

    private createElement() {
        const cloned = cloneTemplate<HTMLElement>(this.template);

        const contentData = {
            currency: this.data.currency,
            unitCurrency: this.data.unitCurrency,
            volume: this.data.volume,
            buyPrice: roundToDecimalPlace(
                this.data.buyPrice,
                0
            ).toLocaleString(),
            avgBuyPrice: roundToDecimalPlace(
                this.data.avgBuyPrice,
                1
            ).toLocaleString(),
            profit: Math.round(this.data.profit).toLocaleString(),
            profitRate: roundToDecimalPlace(this.data.profitRate, 2) + "%",
        };

        updateElementsTextWithData(contentData, cloned);

        this.innerHTML = cloned.innerHTML;

        const isIncrement = this.data.profit > 0 ? true : false;
        this.dataset.increase = isIncrement.toString();

        // [TODO] orders-chance
        // this.ordersChance(anAccount.market);
    }

    private displayOrdered() {
        if (this.ordered && this.data.orderedData.length === 0) {
            this.ordered.hidden = true;
            return;
        }

        this.data.orderedData.map((data: IOrdered) => {
            const orderedItem = new OrderedItem(data);
            this.ordered?.appendChild(orderedItem);
        });
    }
}
