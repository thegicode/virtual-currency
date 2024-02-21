import { cloneTemplate } from "@app/scripts/utils/helpers";
import AccountItem from "./AccountItem";

export default class OrderBid extends HTMLElement {
    private parent: AccountItem;
    private template: HTMLTemplateElement;
    private hideButton: HTMLButtonElement | null = null;

    constructor(parent: AccountItem) {
        super();

        this.parent = parent as AccountItem;

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

    private render() {
        const cloned = cloneTemplate(this.template);
        this.appendChild(cloned);
        this.show();
    }

    public show() {
        this.hidden = false;
        this.parent.showOrderBid();
    }

    private hide() {
        this.hidden = true;
        this.parent.hideOrderBid();
    }
}
