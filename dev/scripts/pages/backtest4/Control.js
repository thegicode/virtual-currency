export default class Control extends HTMLElement {
    constructor() {
        super();
        this.app = document.querySelector("app-backtest4");
        this.formElement = this.querySelector("form");
        this.selectElement = this.querySelector("select");
        this.countElement = this.querySelector("input[name=count]");
        this.investmentPriceElement = this.querySelector(".investmentPrice");
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
    initialize() {
        if (!this.app)
            return;
        this.countElement.value = this.app.count.toString();
        this.investmentPriceElement.textContent =
            this.app.investmentPrice.toLocaleString();
    }
    onChange(event) {
        if (!this.app)
            return;
        const target = event.target;
        this.app.market = target.value;
        this.app.runBackTest();
    }
    onSubmit(event) {
        event === null || event === void 0 ? void 0 : event.preventDefault();
        if (!this.app)
            return;
        const maxSize = Number(this.countElement.getAttribute("max"));
        this.app.count =
            Number(this.countElement.value) > maxSize
                ? maxSize
                : Number(this.countElement.value);
        this.countElement.value = this.app.count.toString();
        this.app.runBackTest();
    }
}
//# sourceMappingURL=Control.js.map