import OrderBase from "./OrderBase";
export default class OrderBid extends OrderBase {
    constructor(parent) {
        super(parent);
        this.amountInput = null;
        this.orderAmountPrice = 0;
        this.template = document.querySelector("#tp-orderBid");
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onReset = this.onReset.bind(this);
        this.onInputAmount = this.onInputAmount.bind(this);
    }
    connectedCallback() {
        var _a, _b;
        super.connectedCallback();
        this.show();
        this.amountInput = this.querySelector("input[name=amount]");
        (_a = this.formElement) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", this.onSubmit);
        (_b = this.formElement) === null || _b === void 0 ? void 0 : _b.addEventListener("reset", this.onReset);
        this.amountInput.addEventListener("input", this.onInputAmount);
    }
    show() {
        this.hidden = false;
        this.accountItem.showOrderBid();
    }
    hide() {
        this.hidden = true;
        this.accountItem.hideOrderBid();
    }
    onSubmit(event) {
        var _a;
        event.preventDefault();
        const volume = this.orderAmountPrice && this.orderPrice
            ? (this.orderAmountPrice / this.orderPrice).toString()
            : "0";
        const searchParams = new URLSearchParams({
            market: this.accountItem.market,
            side: "bid",
            volume,
            price: (_a = this.orderPrice.toString()) !== null && _a !== void 0 ? _a : "",
            ord_type: "limit",
        });
        this.fetchData(searchParams);
    }
    onReset() {
        this.orderAmountPrice = 0;
        this.orderPrice = 0;
        console.log(this.orderAmountPrice, this.orderPrice);
    }
    onInputAmount(event) {
        const target = event.target;
        const validateValue = this.validateInputNumber(target.value);
        this.orderAmountPrice = parseInt(validateValue);
        target.value = this.orderAmountPrice.toLocaleString();
    }
}
//# sourceMappingURL=OrderBid.js.map