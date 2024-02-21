import { cloneTemplate } from "@app/scripts/utils/helpers";
import AccountItem from "./AccountItem";

export default class OrderBid extends HTMLElement {
    private template: HTMLTemplateElement;
    private callButton: HTMLButtonElement;
    private hideButton: HTMLButtonElement | null = null;

    constructor(button: HTMLButtonElement) {
        super();

        this.callButton = button as HTMLButtonElement;

        this.template = document.querySelector(
            "#tp-orderBid"
        ) as HTMLTemplateElement;

        this.hideButton = null;

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }

    connectedCallback() {
        this.render();

        this.hideButton = this.querySelector(
            ".hideButton"
        ) as HTMLButtonElement;

        this.hideButton.addEventListener("click", this.hide);
    }

    public show() {
        this.hidden = false;
    }

    private hide() {
        this.hidden = true;
        if (this.callButton) this.callButton.disabled = false;
    }

    private render() {
        const cloned = cloneTemplate(this.template);
        this.appendChild(cloned);
    }
}
