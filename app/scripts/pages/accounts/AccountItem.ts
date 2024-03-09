import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@scripts/utils/helpers";
import OrderBid from "./OrderBid";
import OrderAsk from "./OrderAsk";
import OrderedItem from "./OrderedItem";

export default class AccountItem extends HTMLElement {
    private data: IProcessedAccountData;
    private template: HTMLTemplateElement;
    private orderedButton: HTMLButtonElement | null = null;
    private ordered: HTMLElement | null = null;
    private bidButton: HTMLButtonElement | null = null;
    private askButton: HTMLButtonElement | null = null;
    private orderBid: OrderBid | null = null;
    private orderAsk: OrderAsk | null = null;
    private _decimalCount: number | null = null;

    constructor(data: IProcessedAccountData) {
        super();

        this.data = data;

        this.template = document.querySelector(
            "#tp-accountItem"
        ) as HTMLTemplateElement;

        this.orderedButton = null;
        this.ordered = null;
        this.bidButton = null;
        this.askButton = null;

        this.handleOrdereds = this.handleOrdereds.bind(this);
        this.handleOrderBid = this.handleOrderBid.bind(this);
        this.handleOrderAsk = this.handleOrderAsk.bind(this);
    }

    get market() {
        return this.data.market;
    }

    get avgBuyPrice() {
        return this.data.avgBuyPrice;
    }

    get volume() {
        return this.data.volume;
    }

    get orderedElement() {
        return this.ordered;
    }

    get decimalCount() {
        return this._decimalCount;
    }

    connectedCallback() {
        this.render();

        this.orderedButton = this.querySelector(
            ".orderedButton"
        ) as HTMLButtonElement;
        this.ordered = this.querySelector(".ordered") as HTMLElement;
        this.bidButton = this.querySelector(".bidButton") as HTMLButtonElement;
        this.askButton = this.querySelector(".askButton") as HTMLButtonElement;

        this.renderOrdereds();

        this.orderedButton?.addEventListener("click", this.handleOrdereds);
        this.bidButton?.addEventListener("click", this.handleOrderBid);
        this.askButton?.addEventListener("click", this.handleOrderAsk);
    }

    disconnectedCallback() {
        this.orderedButton?.removeEventListener("click", this.handleOrdereds);
        this.bidButton?.removeEventListener("click", this.handleOrderBid);
        this.askButton?.removeEventListener("click", this.handleOrderAsk);
    }

    private render() {
        const cloned = cloneTemplate<HTMLElement>(this.template);

        this._decimalCount = this.countDecimalPlaces(this.data.tradePrice);

        const contentData = {
            currency: this.data.currency,
            unitCurrency: this.data.unitCurrency,
            volume: this.data.volume,
            buyPrice: Math.round(this.data.buyPrice).toLocaleString(),
            avgBuyPrice: this.tranformPrice(this.data.avgBuyPrice),
            profit: Math.round(this.data.profit).toLocaleString(),
            profitRate: this.data.profitRate.toFixed(2) + "%",
            tradePrice: this.tranformPrice(this.data.tradePrice),
        };

        updateElementsTextWithData(contentData, cloned);

        const upbitAnchor = cloned.querySelector(".upbit") as HTMLAnchorElement;
        upbitAnchor.href = `https://upbit.com/exchange?code=CRIX.UPBIT.${this.data.market}`;

        this.innerHTML = cloned.innerHTML;

        const isIncrement = this.data.profit > 0 ? true : false;
        this.dataset.increase = isIncrement.toString();

        // [TODO] orders-chance
        // this.ordersChance(anAccount.market);
    }

    // Ordereds
    private renderOrdereds() {
        if (this.ordered && !this.data.orderedData) {
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
            if (this.orderBid.hidden) this.orderBid.show();
            else this.orderBid.hide();
            return;
        }

        this.orderBid = new OrderBid(this);
        this.querySelector("#orderBid")?.replaceWith(this.orderBid);
    }
    public showOrderBid() {
        if (!this.bidButton) return;
        this.bidButton.textContent = "매수 가리기";
    }
    public hideOrderBid() {
        if (!this.bidButton) return;
        this.bidButton.textContent = "매수";
    }

    // OrderAsk
    private handleOrderAsk() {
        if (this.orderAsk) {
            if (this.orderAsk.hidden) this.orderAsk.show();
            else this.orderAsk.hide();
            return;
        }
        this.orderAsk = new OrderAsk(this);
        this.querySelector("#orderAsk")?.replaceWith(this.orderAsk);
    }
    public showOrderAsk() {
        if (!this.askButton) return;
        this.askButton.textContent = "매도 가리기";
    }
    public hideOrderAsk() {
        if (!this.askButton) return;
        this.askButton.textContent = "매도";
    }

    countDecimalPlaces(price: number) {
        if (!isNaN(price) && Math.floor(price) !== price) {
            return price.toString().split(".")[1].length;
        }
        return 0;
    }

    tranformPrice(price: number) {
        if (this._decimalCount === null || this._decimalCount < 0) return;
        const result = Number(price.toFixed(this._decimalCount));
        return result >= 1000 ? result.toLocaleString() : result;
    }
}
