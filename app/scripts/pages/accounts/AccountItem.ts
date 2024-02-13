import {
    cloneTemplate,
    roundToDecimalPlace,
    updateElementsTextWithData,
} from "@scripts/utils/helpers";
import OrderedItem from "./OrderedItem";

export default class AccountItem extends HTMLElement {
    private data: IProcessedAccountData;
    private template: HTMLTemplateElement;
    private ordered: HTMLElement | null = null;

    constructor(data: IProcessedAccountData) {
        super();

        this.data = data;

        this.template = document.querySelector(
            "#accountItem"
        ) as HTMLTemplateElement;

        this.ordered = null;
    }

    connectedCallback() {
        this.createElement();

        this.ordered = this.querySelector(".ordered") as HTMLElement;

        this.displayOrdered();
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
        this.data.orderedData.map((data: IOrdered) => {
            const orderedItem = new OrderedItem(data);
            this.ordered?.appendChild(orderedItem);
        });
    }
}
