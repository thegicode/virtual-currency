var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            price: this.data.price.toLocaleString(),
            side: this.data.side === "bid" ? "매수" : "매도",
            volume: this.data.volume,
        };
        updateElementsTextWithData(contentData, cloned);
        return cloned;
    }
    onCancel() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cancelButton)
                return;
            this.cancelButton.disabled = true;
            try {
                const response = yield fetch(`/cancel?uuid=${this.data.uuid}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = yield response.json();
                if (data.uuid === this.data.uuid) {
                    this.remove();
                }
            }
            catch (error) {
                console.error("Error", error);
            }
        });
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