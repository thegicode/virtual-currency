import { cloneTemplate } from "@app/scripts/utils/helpers";
export default class OrderBid extends HTMLElement {
    constructor(parent) {
        super();
        this.hideButton = null;
        this.parent = parent;
        this.template = document.querySelector("#tp-orderBid");
        this.hideButton = null;
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }
    connectedCallback() {
        this.render();
        this.hideButton = this.querySelector(".hideButton");
        this.hideButton.addEventListener("click", this.hide);
    }
    render() {
        const cloned = cloneTemplate(this.template);
        this.appendChild(cloned);
        this.show();
    }
    show() {
        this.hidden = false;
        this.parent.showOrderBid();
    }
    hide() {
        this.hidden = true;
        this.parent.hideOrderBid();
    }
}
//# sourceMappingURL=OrderBid.js.map