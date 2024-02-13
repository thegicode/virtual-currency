import {
    cloneTemplate,
    roundToDecimalPlace,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";

export default class AccountItem extends HTMLElement {
    private data: IProcessedAccountData;
    private template: HTMLTemplateElement;

    constructor(data: IProcessedAccountData) {
        super();

        this.data = data;

        this.template = document.querySelector(
            "#accountItem"
        ) as HTMLTemplateElement;
    }

    connectedCallback() {
        this.create();
    }

    public create() {
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
}
