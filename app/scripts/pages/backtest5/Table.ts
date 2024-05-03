import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";

export default class BacktestTable extends HTMLElement {
    private data: IBacktest5[];
    private market: string;

    private navElement: HTMLElement;
    private dataElement: HTMLElement;

    private tableTemplate: HTMLTemplateElement;
    private itemTemplate: HTMLTemplateElement;

    private activedTable: HTMLElement | null;
    private activedTab: HTMLElement | null;

    constructor() {
        super();

        this.data = [];
        this.market = "";

        this.activedTable = null;
        this.activedTab = null;

        this.navElement = this.querySelector("nav") as HTMLElement;
        this.dataElement = this.querySelector(".dataTable") as HTMLElement;

        this.tableTemplate = document.querySelector(
            "#tp-table"
        ) as HTMLTemplateElement;
        this.itemTemplate = document.querySelector(
            "#tp-item"
        ) as HTMLTemplateElement;

        this.addNavEvent = this.addNavEvent.bind(this);
    }

    connectedCallback() {}

    public initialize() {
        this.data = [];
        this.market = "";

        this.activedTable = null;
        this.activedTab = null;

        this.navElement.innerHTML = "";
        this.dataElement.innerHTML = "";
    }

    public render(data: IBacktest5[]) {
        this.data = data;
        this.market = this.data[0].market;

        this.renderNav();
        this.renderTable();
    }

    public initialSet() {
        const firstNav = this.navElement.querySelector(
            "a"
        ) as HTMLAnchorElement;
        const firstTable = this.dataElement.querySelector(
            "table"
        ) as HTMLTableElement;

        this.hideDataTables();

        this.activateNav(firstNav);
        this.activateTalble(firstTable);
    }

    private renderNav() {
        const tabElement = document.createElement("a") as HTMLAnchorElement;
        tabElement.textContent = this.market;
        tabElement.href = `#${this.market}`;

        this.navElement.appendChild(tabElement);
        tabElement.addEventListener("click", this.addNavEvent);
    }

    private addNavEvent(event: Event) {
        event.preventDefault();
        const target = event.target as HTMLAnchorElement;

        const targetTable = document.querySelector(target.hash) as HTMLElement;
        this.activateTalble(targetTable);
        this.activateNav(target);
    }

    private renderTable() {
        const cloned = this.crateTable();
        this.dataElement.appendChild(cloned);
    }

    private crateTable() {
        const cloned = cloneTemplate<HTMLElement>(this.tableTemplate);

        const fragment = new DocumentFragment();
        this.data
            .map((aData: IBacktest5, index) => this.createItem(aData, index))
            .forEach((cloned: HTMLElement) => fragment.appendChild(cloned));
        cloned.id = this.market;
        cloned.dataset.market = this.market;
        cloned.appendChild(fragment);

        return cloned;
    }

    private createItem(aData: IBacktest5, index: number) {
        const cloned = cloneTemplate<HTMLElement>(this.itemTemplate);

        const parseData = {
            index,
            date: aData.date.slice(0, 10),
            range: aData.range.toLocaleString(),
            condition: aData.buyCondition.toString(),
            action: aData.action?.toString(),
            standardPrice: aData.standardPrice.toLocaleString(),
            buyPrice:
                (aData.buyPrice &&
                    Math.round(aData.buyPrice).toLocaleString()) ||
                "",
            sellPrice:
                (aData.sellPrice &&
                    Math.round(aData.sellPrice).toLocaleString()) ||
                "",
            rate: (aData.rate && aData.rate * 100)?.toFixed(2) || "",
            profit:
                (aData.profit && Math.round(aData.profit).toLocaleString()) ||
                "",
            sumProfit:
                aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
        };

        updateElementsTextWithData(parseData, cloned);

        cloned.dataset.action = aData.action?.toString();

        return cloned;
    }

    private hideDataTables() {
        const tables = this.dataElement.querySelectorAll("table");
        for (const t of tables) {
            t.hidden = true;
        }
    }

    private activateNav(tabElement: HTMLAnchorElement) {
        tabElement.dataset.active = "true";

        if (this.activedTab) this.activedTab.dataset.active = "false";
        this.activedTab = tabElement;
    }

    private activateTalble(table: HTMLElement) {
        table.hidden = false;

        if (this.activedTable) this.activedTable.hidden = true;
        this.activedTable = table;
    }
}
