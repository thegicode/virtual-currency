import AccountItem from "./AccountItem";
import OrderBase from "./OrderBase";

export default class OrderBid extends OrderBase {
    private amountInput: HTMLInputElement | null = null;
    private orderAmountPrice: number = 0;

    constructor(parent: AccountItem) {
        super(parent);

        this.template = document.querySelector(
            "#tp-orderBid"
        ) as HTMLTemplateElement;

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);

        this.onSubmit = this.onSubmit.bind(this);
        this.onReset = this.onReset.bind(this);

        this.onInputAmount = this.onInputAmount.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        this.show();

        this.amountInput = this.querySelector(
            "input[name=amount]"
        ) as HTMLInputElement;

        this.formElement?.addEventListener("submit", this.onSubmit);
        this.formElement?.addEventListener("reset", this.onReset);

        this.amountInput.addEventListener("input", this.onInputAmount);
    }

    public show() {
        this.hidden = false;
        this.accountItem.showOrderBid();
    }

    public hide() {
        this.hidden = true;
        this.accountItem.hideOrderBid();
    }

    private async onSubmit(event: Event) {
        event.preventDefault();
        if (!this.orderAmountPrice || !this.orderPrice) return;

        const volume = this.orderAmountPrice / this.orderPrice;

        const searchParams = new URLSearchParams({
            market: this.accountItem.market,
            side: "bid",
            volume: volume.toString(),
            price: this.orderPrice.toString() ?? "",
            ord_type: "limit",
        });

        this.fetchData(searchParams);

        this.formElement?.reset();
    }

    private onReset() {
        this.orderAmountPrice = 0;
        this.orderPrice = 0;
        // console.log(this.orderAmountPrice, this.orderPrice);
    }

    private onInputAmount(event: Event) {
        const target = event.target as HTMLInputElement;
        const validateValue = this.validateInputNumber(target.value);
        this.orderAmountPrice = parseInt(validateValue);
        target.value = this.orderAmountPrice.toLocaleString();
    }
}
