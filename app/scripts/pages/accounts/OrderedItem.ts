import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@scripts/utils/helpers";

export default class OrderedItem extends HTMLElement {
    private data: IOrdered;
    private template: HTMLTemplateElement;
    private cancelButton: HTMLButtonElement | null = null;

    constructor(data: IOrdered) {
        super();

        this.data = data;
        this.template = document.querySelector(
            "#tp-orderedItem"
        ) as HTMLTemplateElement;
        this.cancelButton = null;

        this.onCancel = this.onCancel.bind(this);
    }

    connectedCallback() {
        const cloned = this.createElement();
        this.innerHTML = cloned.innerHTML;

        this.dataset.side = this.data.side;

        this.cancelButton = this.querySelector(
            ".cancelButton"
        ) as HTMLButtonElement;

        this.cancelButton?.addEventListener("click", this.onCancel);
    }

    disconnectedCallback() {
        this.cancelButton?.removeEventListener("click", this.onCancel);
    }

    private createElement() {
        const cloned = cloneTemplate<HTMLElement>(this.template);
        const contentData = {
            created_at: this.formatDateTime(this.data.created_at),
            // ord_type:
            //     this.data.ord_type === "limit" ? "지정가 주문" : "시장가 주문",
            price: this.data.price.toLocaleString(),
            side: this.data.side === "bid" ? "매수" : "매도",
            volume: this.data.volume,
        };

        updateElementsTextWithData(contentData, cloned);

        return cloned;
    }

    private async onCancel() {
        if (!this.cancelButton) return;
        this.cancelButton.disabled = true;

        try {
            const response = await fetch(`/fetchCancel?uuid=${this.data.uuid}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.uuid === this.data.uuid) {
                // this.dataset.cancel = "true";
                this.remove();
            }
        } catch (error) {
            console.error("Error", error);
        }
    }

    private formatDateTime(dateTime: string) {
        // Date 객체 생성
        const date = new Date(dateTime);

        // 월, 일, 시간, 분, 초를 각각 두 자리수로 포매팅
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");

        // 포맷된 문자열 반환
        return `${month}.${day} ${hours}:${minutes}:${seconds}`;
    }
}
