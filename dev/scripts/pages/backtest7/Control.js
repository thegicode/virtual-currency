export default class Control extends HTMLElement {
    constructor() {
        super();
        this.app = document.querySelector("app-backtest7");
        this.formElement = this.querySelector("form");
        this.marketsInput = this.querySelector('input[name="markets"]');
        this.countInput = this.querySelector("input[name=count]");
        this.investmentPriceElement = this.querySelector(".investmentPrice");
        this.onSubmit = this.onSubmit.bind(this);
    }
    connectedCallback() {
        this.formElement.addEventListener("submit", this.onSubmit);
    }
    disconnectedCallback() {
        this.formElement.removeEventListener("submit", this.onSubmit);
    }
    render() {
        if (!this.app)
            return;
        this.marketsInput.value = this.app.markets.join(", ");
        this.countInput.value = this.app.count.toString();
        this.investmentPriceElement.textContent =
            this.app.investmentAmount.toLocaleString();
    }
    initialize() { }
    onSubmit(event) {
        event === null || event === void 0 ? void 0 : event.preventDefault();
        if (!this.app)
            return;
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
//# sourceMappingURL=Control.js.map