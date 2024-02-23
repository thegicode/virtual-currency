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

        const orderChanceData = await this.getOrderChance();
        const isBidPossible = this.checkOrder(orderChanceData, volume);

        if (isBidPossible) await this.fetchData(searchParams);
    }

    private checkOrder(chanceData: any, volume: number) {
        const totalPrice = this.orderPrice * volume;
        if (
            chanceData.market.state === "active" &&
            chanceData.market.bid.min_total < totalPrice &&
            chanceData.market.max_total > totalPrice &&
            Number(chanceData.bid_account.balance) > volume
        ) {
            return true;
        }

        return false;

        // 매수 수수료 비율 : bid_fee
        // 매수 주문 지원 방식 : market.bid_types
        // 화폐를 의미하는 영문 대문자 코드 : marekt.bid.currency
        // 최소 매도/매수 금액 : market.bid.min_total
        // 최대 매도/매수 금액 : market.max_total
        // 마켓 운영 상태 : market.state
        // 화폐를 의미하는 영문 대문자 코드 : bid_account.currency
        // 주문가능 금액/수량 : bid_account.balance
        // 주문 중 묶여있는 금액/수량 : bid_account.locked
        // 매수평균가: bid_account.avg_buy_price
        // 매수평균가 수정 여부 : bid_account.avg_buy_price_modified
        // 평단가 기준 화폐 : bid_account.unit_currency
    }

    private onReset() {
        this.orderAmountPrice = 0;
        this.orderPrice = 0;
        console.log(this.orderAmountPrice, this.orderPrice);
    }

    private onInputAmount(event: Event) {
        const target = event.target as HTMLInputElement;
        const validateValue = this.validateInputNumber(target.value);
        this.orderAmountPrice = parseInt(validateValue);
        target.value = this.orderAmountPrice.toLocaleString();
    }
}
