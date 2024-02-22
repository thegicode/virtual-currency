import AccountItem from "./AccountItem";
import OrderBase from "./OrderBase";

export default class OrderAsk extends OrderBase {
    private volumeRadios: NodeListOf<HTMLInputElement> | null = null;
    private volumeManual: HTMLInputElement | null = null;
    private volumeInput: HTMLInputElement | null = null;
    private orderVolume: number = 0;

    constructor(parent: AccountItem) {
        super(parent);

        this.template = document.querySelector(
            "#tp-orderAsk"
        ) as HTMLTemplateElement;

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);

        this.onSubmit = this.onSubmit.bind(this);
        this.onReset = this.onReset.bind(this);

        this.onChangeVolumeRadios = this.onChangeVolumeRadios.bind(this);
        this.onInputVolumeManual = this.onInputVolumeManual.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        this.show();

        this.volumeInput = this.querySelector(
            "input[name=volume]"
        ) as HTMLInputElement;
        this.volumeRadios = this.querySelectorAll<HTMLInputElement>(
            "input[name=volume-option]"
        );
        this.volumeManual = this.querySelector(
            "input[name=volume-option-manual]"
        ) as HTMLInputElement;

        this.formElement?.addEventListener("submit", this.onSubmit);
        this.formElement?.addEventListener("reset", this.onReset);

        this.volumeRadios.forEach((radio: HTMLInputElement) => {
            radio.addEventListener("change", this.onChangeVolumeRadios);
        });
        this.volumeManual.addEventListener("input", this.onInputVolumeManual);
    }

    public show() {
        this.hidden = false;
        this.accountItem.showOrderAsk();
    }

    public hide() {
        this.hidden = true;
        this.accountItem.hideOrderAsk();
    }

    private onSubmit(event: Event) {
        event.preventDefault();

        const searchParams = new URLSearchParams({
            market: this.accountItem.market,
            side: "ask",
            volume: this.orderVolume.toString(),
            price: this.orderPrice.toString() ?? "",
            ord_type: "limit",
        });

        this.fetchData(searchParams);
    }

    private onReset() {
        this.orderVolume = 0;
        this.orderPrice = 0;
        console.log(this.orderVolume, this.orderPrice);
    }

    // volume
    private onChangeVolumeRadios(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.value === "manual") return;
        this.calculateVolume(parseInt(target.value));
    }
    private onInputVolumeManual(event: Event) {
        const target = event.target as HTMLInputElement;
        this.calculateVolume(parseInt(target.value));
    }
    private calculateVolume(aPercent: number) {
        if (!this.volumeInput) return;
        this.orderVolume = (this.accountItem.volume * aPercent) / 100;
        this.volumeInput.value = this.orderVolume.toString();
    }
}
