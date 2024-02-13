import { cloneTemplate, updateElementsTextWithData, } from "@scripts/utils/helpers";
export default class OrderedItem extends HTMLElement {
    constructor(data) {
        super();
        this.cancelButton = null;
        this.data = data;
        this.template = document.querySelector("#orderedItem");
        this.cancelButton = null;
        this.onCancel = this.onCancel.bind(this);
    }
    connectedCallback() {
        var _a;
        const cloned = this.createElement();
        this.innerHTML = cloned.innerHTML;
        this.dataset.side = this.data.side;
        this.cancelButton = this.querySelector(".cancelButton");
        (_a = this.cancelButton) === null || _a === void 0 ? void 0 : _a.addEventListener("click", this.onCancel);
    }
    disconnectedCallback() {
        var _a;
        (_a = this.cancelButton) === null || _a === void 0 ? void 0 : _a.removeEventListener("click", this.onCancel);
    }
    createElement() {
        const cloned = cloneTemplate(this.template);
        const contentData = {
            created_at: this.formatDateTime(this.data.created_at),
            price: this.data.price,
            side: this.data.side === "bid" ? "매수" : "매도",
            volume: this.data.volume,
        };
        updateElementsTextWithData(contentData, cloned);
        return cloned;
    }
    onCancel() {
        if (!this.cancelButton)
            return;
        console.log("cancel");
        this.cancelButton.disabled = true;
    }
    formatDateTime(dateTime) {
        const date = new Date(dateTime);
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        return `${month}.${day} ${hours}:${minutes}:${seconds}`;
    }
}
//# sourceMappingURL=OrderedItem.js.map