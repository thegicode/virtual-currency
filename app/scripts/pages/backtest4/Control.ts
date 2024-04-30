import AppBacktest4 from "./AppBacktest4";

export default class Control extends HTMLElement {
    private app: AppBacktest4;

    private formElement: HTMLFormElement;
    private selectElement: HTMLSelectElement;
    private countElement: HTMLInputElement;
    private investmentPriceElement: HTMLElement;

    constructor() {
        super();

        this.app = document.querySelector("app-backtest4") as AppBacktest4;

        this.formElement = this.querySelector("form") as HTMLFormElement;
        this.selectElement = this.querySelector("select") as HTMLSelectElement;
        this.countElement = this.querySelector(
            "input[name=count]"
        ) as HTMLInputElement;
        this.investmentPriceElement = this.querySelector(
            ".investmentPrice"
        ) as HTMLElement;

        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    connectedCallback() {
        this.formElement.addEventListener("submit", this.onSubmit);
        this.selectElement.addEventListener("change", this.onChange);
    }

    disconnectedCallback() {
        this.formElement.removeEventListener("submit", this.onSubmit);
        this.selectElement.removeEventListener("change", this.onChange);
    }

    public initialize() {
        if (!this.app) return;

        this.countElement.value = this.app.count.toString();
        this.investmentPriceElement.textContent =
            this.app.investmentPrice.toLocaleString();
    }

    private onChange(event: Event) {
        if (!this.app) return;

        const target = event.target as HTMLInputElement;
        this.app.market = target.value;
        this.app.runBackTest();
    }

    private onSubmit(event: Event) {
        event?.preventDefault();

        if (!this.app) return;

        const maxSize = Number(this.countElement.getAttribute("max"));
        this.app.count =
            Number(this.countElement.value) > maxSize
                ? maxSize
                : Number(this.countElement.value);
        this.countElement.value = this.app.count.toString();
        this.app.runBackTest();
    }
}
