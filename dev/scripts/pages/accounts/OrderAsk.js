import OrderBase from "./OrderBase";
export default class OrderAsk extends OrderBase {
    constructor(parent) {
        super(parent);
        this.volumeRadios = null;
        this.volumeManual = null;
        this.volumeInput = null;
        this.orderVolume = 0;
        this.template = document.querySelector("#tp-orderAsk");
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onReset = this.onReset.bind(this);
        this.onChangeVolumeRadios = this.onChangeVolumeRadios.bind(this);
        this.onInputVolumeManual = this.onInputVolumeManual.bind(this);
    }
    connectedCallback() {
        var _a, _b;
        super.connectedCallback();
        this.show();
        this.volumeInput = this.querySelector("input[name=volume]");
        this.volumeRadios = this.querySelectorAll("input[name=volume-option]");
        this.volumeManual = this.querySelector("input[name=volume-option-manual]");
        (_a = this.formElement) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", this.onSubmit);
        (_b = this.formElement) === null || _b === void 0 ? void 0 : _b.addEventListener("reset", this.onReset);
        this.volumeRadios.forEach((radio) => {
            radio.addEventListener("change", this.onChangeVolumeRadios);
        });
        this.volumeManual.addEventListener("input", this.onInputVolumeManual);
    }
    show() {
        this.hidden = false;
        this.accountItem.showOrderAsk();
    }
    hide() {
        this.hidden = true;
        this.accountItem.hideOrderAsk();
    }
    onSubmit(event) {
        var _a;
        event.preventDefault();
        const searchParams = new URLSearchParams({
            market: this.accountItem.market,
            side: "ask",
            volume: this.orderVolume.toString(),
            price: (_a = this.orderPrice.toString()) !== null && _a !== void 0 ? _a : "",
            ord_type: "limit",
        });
        this.fetchData(searchParams);
    }
    onReset() {
        this.orderVolume = 0;
        this.orderPrice = 0;
        console.log(this.orderVolume, this.orderPrice);
    }
    onChangeVolumeRadios(event) {
        const target = event.target;
        if (target.value === "manual")
            return;
        this.calculateVolume(parseInt(target.value));
    }
    onInputVolumeManual(event) {
        const target = event.target;
        this.calculateVolume(parseInt(target.value));
    }
    calculateVolume(aPercent) {
        if (!this.volumeInput)
            return;
        this.orderVolume = (this.accountItem.volume * aPercent) / 100;
        this.volumeInput.value = this.orderVolume.toString();
    }
}
//# sourceMappingURL=OrderAsk.js.map