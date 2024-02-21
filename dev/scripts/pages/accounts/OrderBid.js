import { cloneTemplate } from "@app/scripts/utils/helpers";
export default class OrderBid extends HTMLElement {
    constructor(button) {
        super();
        this.hideButton = null;
        this.callButton = button;
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
    show() {
        this.hidden = false;
    }
    hide() {
        this.hidden = true;
        if (this.callButton)
            this.callButton.disabled = false;
    }
    render() {
        const cloned = cloneTemplate(this.template);
        this.appendChild(cloned);
    }
}
//# sourceMappingURL=OrderBid.js.map