import {
    cloneTemplate,
    roundToDecimalPlace,
    updateElementsTextWithData,
} from "@scripts/utils/helpers";
import OrderBid from "./OrderBid";
import OrderedItem from "./OrderedItem";

export default class AccountItem extends HTMLElement {
    private data: IProcessedAccountData;
    private template: HTMLTemplateElement;
    private orderedButton: HTMLButtonElement | null = null;
    private ordered: HTMLElement | null = null;
    private bidButton: HTMLButtonElement | null = null;
    private orderBid: OrderBid | null = null;

    constructor(data: IProcessedAccountData) {
        super();

        this.data = data;

        this.template = document.querySelector(
            "#tp-accountItem"
        ) as HTMLTemplateElement;

        this.orderedButton = null;
        this.ordered = null;
        this.bidButton = null;

        this.handleOrdereds = this.handleOrdereds.bind(this);
        this.handleOrderBid = this.handleOrderBid.bind(this);
    }

    get avgBuyPrice() {
        return this.data.avgBuyPrice;
    }

    connectedCallback() {
        this.render();

        this.orderedButton = this.querySelector(
            ".orderedButton"
        ) as HTMLButtonElement;
        this.ordered = this.querySelector(".ordered") as HTMLElement;
        this.bidButton = this.querySelector(".bidButton") as HTMLButtonElement;

        this.renderOrdereds();

        this.orderedButton?.addEventListener("click", this.handleOrdereds);
        this.bidButton?.addEventListener("click", this.handleOrderBid);
    }

    disconnectedCallback() {
        this.orderedButton?.removeEventListener("click", this.handleOrdereds);
        this.bidButton?.removeEventListener("click", this.handleOrderBid);
    }

    private render() {
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

    // Ordereds
    private renderOrdereds() {
        if (this.ordered && this.data.orderedData.length === 0) {
            this.ordered.hidden = true;
            return;
        }
        this.data.orderedData.map((data: IOrdered) => {
            const orderedItem = new OrderedItem(data);
            this.ordered?.appendChild(orderedItem);
        });
    }
    private handleOrdereds() {
        if (!this.ordered) return;
        this.ordered.hidden = !this.ordered.hidden;
    }

    // OrderBid
    private handleOrderBid() {
        if (this.orderBid) {
            this.orderBid.show();
            return;
        }

        this.orderBid = new OrderBid(this);
        this.querySelector("#orderBid")?.replaceWith(this.orderBid);
    }
    public showOrderBid() {
        if (!this.bidButton) return;
        this.bidButton.disabled = true;
    }
    public hideOrderBid() {
        if (!this.bidButton) return;
        this.bidButton.disabled = false;
    }
}
