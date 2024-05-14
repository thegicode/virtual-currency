import { cloneTemplate, updateElementsTextWithData, } from "@app/scripts/utils/helpers";
export default class BacktestTable extends HTMLElement {
    constructor() {
        super();
        this.data = [];
        this.market = "";
        this.activedTable = null;
        this.activedTab = null;
        this.navElement = this.querySelector("nav");
        this.dataElement = this.querySelector(".dataTable");
        this.tableTemplate = document.querySelector("#tp-table");
        this.itemTemplate = document.querySelector("#tp-item");
        this.addNavEvent = this.addNavEvent.bind(this);
    }
    connectedCallback() { }
    initialize() {
        this.data = [];
        this.market = "";
        this.activedTable = null;
        this.activedTab = null;
        this.navElement.innerHTML = "";
        this.dataElement.innerHTML = "";
    }
    render(data, index) {
        this.data = data;
        this.market = this.data[0].market;
        this.renderNav(index);
        this.renderTable(index);
    }
    renderNav(index) {
        const tabElement = document.createElement("a");
        tabElement.textContent = this.market;
        tabElement.href = `#${this.market}`;
        if (index === 0) {
            tabElement.dataset.active = "true";
            this.activedTab = tabElement;
        }
        this.navElement.appendChild(tabElement);
        tabElement.addEventListener("click", this.addNavEvent);
    }
    addNavEvent(event) {
        event.preventDefault();
        const target = event.target;
        const targetTable = document.querySelector(target.hash);
        this.activateTalble(targetTable);
        this.activateNav(target);
    }
    renderTable(index) {
        const cloned = this.crateTable();
        if (index === 0) {
            cloned.hidden = false;
            this.activedTable = cloned;
        }
        else {
            cloned.hidden = true;
        }
        this.dataElement.appendChild(cloned);
    }
    crateTable() {
        const cloned = cloneTemplate(this.tableTemplate);
        const fragment = new DocumentFragment();
        this.data
            .map((aData, index) => this.createItem(aData, index))
            .forEach((cloned) => fragment.appendChild(cloned));
        cloned.id = this.market;
        cloned.dataset.market = this.market;
        cloned.appendChild(fragment);
        return cloned;
    }
    createItem(aData, index) {
        var _a, _b, _c, _d, _e, _f;
        const cloned = cloneTemplate(this.itemTemplate);
        const parseData = {
            index,
            date: aData.date.slice(0, 10),
            openingPrice: (_a = aData.openingPrice) === null || _a === void 0 ? void 0 : _a.toLocaleString(),
            range: (_b = aData.range) === null || _b === void 0 ? void 0 : _b.toLocaleString(),
            condition: aData.buyCondition.toString(),
            action: (_c = aData.action) === null || _c === void 0 ? void 0 : _c.toString(),
            standardPrice: ((_d = aData.standardPrice) === null || _d === void 0 ? void 0 : _d.toLocaleString()) || "",
            buyPrice: (aData.buyPrice &&
                Math.round(aData.buyPrice).toLocaleString()) ||
                "",
            sellPrice: (aData.sellPrice &&
                Math.round(aData.sellPrice).toLocaleString()) ||
                "",
            investmentAmount: (aData.investmentAmount &&
                Math.round(aData.investmentAmount).toLocaleString()) ||
                "",
            volatilityRate: (aData.volatilityRate && aData.volatilityRate.toFixed(2)) || "",
            rate: ((_e = (aData.rate && aData.rate * 100)) === null || _e === void 0 ? void 0 : _e.toFixed(2)) || "",
            profit: (aData.profit && Math.round(aData.profit).toLocaleString()) ||
                "",
            sumProfit: aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
        };
        updateElementsTextWithData(parseData, cloned);
        cloned.dataset.action = (_f = aData.action) === null || _f === void 0 ? void 0 : _f.toString();
        return cloned;
    }
    hideDataTables() {
        const tables = this.dataElement.querySelectorAll("table");
        for (const t of tables) {
            t.hidden = true;
        }
    }
    activateNav(tabElement) {
        tabElement.dataset.active = "true";
        if (this.activedTab)
            this.activedTab.dataset.active = "false";
        this.activedTab = tabElement;
    }
    activateTalble(table) {
        table.hidden = false;
        if (this.activedTable)
            this.activedTable.hidden = true;
        this.activedTable = table;
    }
}
//# sourceMappingURL=Table.js.map