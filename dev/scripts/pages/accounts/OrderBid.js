var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            if (!this.orderAmountPrice || !this.orderPrice)
                return;
            const volume = this.orderAmountPrice / this.orderPrice;
            const searchParams = new URLSearchParams({
                market: this.accountItem.market,
                side: "bid",
                volume: volume.toString(),
                price: (_a = this.orderPrice.toString()) !== null && _a !== void 0 ? _a : "",
                ord_type: "limit",
            });
            this.fetchData(searchParams);
            (_b = this.formElement) === null || _b === void 0 ? void 0 : _b.reset();
        });
    }
    onReset() {
        this.orderAmountPrice = 0;
        this.orderPrice = 0;
    }
    onInputAmount(event) {
        const target = event.target;
        const validateValue = this.validateInputNumber(target.value);
        this.orderAmountPrice = parseInt(validateValue);
        target.value = this.orderAmountPrice.toLocaleString();
    }
}
//# sourceMappingURL=OrderBid.js.map