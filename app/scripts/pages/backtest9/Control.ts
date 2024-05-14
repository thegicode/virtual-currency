import AppBacktest9 from "./AppBacktest9";

export default class Control extends HTMLElement {
    private app: AppBacktest9;

    private formElement: HTMLFormElement;
    private marketsInput: HTMLInputElement;
    // private marketsButton: HTMLButtonElement;
    private countInput: HTMLInputElement;
    private investmentPriceElement: HTMLElement;

    constructor() {
        super();

        this.app = document.querySelector("app-backtest9") as AppBacktest9;

        this.formElement = this.querySelector("form") as HTMLFormElement;
        this.marketsInput = this.querySelector(
            'input[name="markets"]'
        ) as HTMLInputElement;
        // this.marketsButton = this.querySelector(
        //     ".marketsButton"
        // ) as HTMLButtonElement;
        this.countInput = this.querySelector(
            "input[name=count]"
        ) as HTMLInputElement;
        this.investmentPriceElement = this.querySelector(
            ".investmentPrice"
        ) as HTMLElement;

        this.onSubmit = this.onSubmit.bind(this);
        // this.onClickMarkets = this.onClickMarkets.bind(this);
    }

    connectedCallback() {
        this.formElement.addEventListener("submit", this.onSubmit);
        // this.marketsButton.addEventListener("click", this.onClickMarkets);
    }

    disconnectedCallback() {
        this.formElement.removeEventListener("submit", this.onSubmit);
        // this.marketsButton.removeEventListener("click", this.onClickMarkets);
    }

    public render() {
        if (!this.app) return;

        this.marketsInput.value = this.app.markets.join(", ");
        this.countInput.value = this.app.count.toString();
        this.investmentPriceElement.textContent =
            this.app.investmentAmount.toLocaleString();
    }

    public initialize() {}

    // private onClickMarkets() {
    //     this.app.markets = this.marketsInput.value.split(",");
    //     this.app.initialize();
    //     this.app.runBackTest();
    // }

    private onSubmit(event: Event) {
        event?.preventDefault();
        if (!this.app) return;

        this.app.markets = this.marketsInput.value.split(",");
        const maxSize = Number(this.countInput.getAttribute("max"));
        this.app.count =
            Number(this.countInput.value) > maxSize
                ? maxSize
                : Number(this.countInput.value);

        this.countInput.value = this.app.count.toString();
        this.app.initialize();
        this.app.runBackTest();
    }
}
