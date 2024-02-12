var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class AppAccounts extends HTMLElement {
    constructor() {
        super();
        this.template = this.querySelector("#accountItem");
    }
    connectedCallback() {
        this.fetch();
    }
    fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accountsdata = yield this.fetchAccounts();
                const markets = accountsdata.accounts.map((d) => `${d.unit_currency}-${d.currency}`);
                const tickerData = yield this.fetchTikcer(markets);
                this.renderAssests(accountsdata.assets);
                const result = yield this.transformData(accountsdata.accounts, tickerData);
                this.render(result);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    transformData(accounts, tickerData) {
        const tickerNames = tickerData.map((t) => t.market);
        const result = accounts.map((aAccount, index) => {
            const { avg_buy_price, buy_price, currency, locked, unit_currency, volume, } = aAccount;
            const marketName = `${aAccount.unit_currency}-${aAccount.currency}`;
            const tickerIndex = tickerNames.indexOf(marketName);
            const ticker = tickerData[tickerIndex];
            const price1 = avg_buy_price * volume;
            const price2 = ticker.trade_price * volume;
            const profit = price2 - price1;
            const profitRate = (profit / price1) * 100;
            return {
                currency: currency,
                unitCurrency: unit_currency,
                buyPrice: this.roundToDecimalPlace(buy_price, 0).toLocaleString(),
                avgBuyPrice: this.roundToDecimalPlace(avg_buy_price, 1).toLocaleString(),
                volume,
                locked,
                profit: Math.round(profit),
                profitRate,
            };
        });
        return result;
    }
    fetchAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`/accounts`);
                return yield response.json();
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    fetchTikcer(markets) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`/ticker?markets=${markets}`);
                return yield response.json();
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    renderAssests(data) {
        const assetsElement = this.querySelector(".assets");
        const element = assetsElement.cloneNode(true);
        const totalAsset = Number(data.balance) + Number(data.locked);
        let tp = `<h4>My Asset</h4>`;
        tp += `<p>보유 ${data.unit_currency} : ${this.roundToDecimalPlace(totalAsset, 0).toLocaleString()}</p>`;
        tp += `<p>locked ${data.unit_currency} : ${this.roundToDecimalPlace(data.locked, 0).toLocaleString()}</p>`;
        element.innerHTML = tp;
        assetsElement.replaceWith(element);
    }
    render(data) {
        var _a;
        const fragment = new DocumentFragment();
        data.map((data) => this.createElement(data)).forEach((element) => fragment.appendChild(element));
        (_a = this.querySelector(".accounts")) === null || _a === void 0 ? void 0 : _a.appendChild(fragment);
    }
    createElement(aAccount) {
        var _a, _b;
        const element = (_b = (_a = this.template) === null || _a === void 0 ? void 0 : _a.content.firstElementChild) === null || _b === void 0 ? void 0 : _b.cloneNode(true);
        element.querySelector(".currency").textContent =
            aAccount.currency;
        element.querySelector(".unitCurrency").textContent =
            aAccount.unitCurrency;
        element.querySelector(".buyPrice").textContent =
            aAccount.buyPrice;
        element.querySelector(".avgBuyPrice").textContent =
            aAccount.avgBuyPrice;
        element.querySelector(".volume").textContent =
            aAccount.volume;
        const isPlus = aAccount.profit > 0 ? true : false;
        const profitElement = element.querySelector(".profit");
        profitElement.textContent = aAccount.profit;
        element.querySelector(".profitRate").textContent = `${aAccount.profitRate.toFixed(2)}%`;
        profitElement.closest("li").dataset.increase =
            isPlus.toString();
        return element;
    }
    roundToDecimalPlace(amount, point) {
        const decimalPoint = point > 0 ? 10 * point : 1;
        return Math.round(amount * decimalPoint) / decimalPoint;
    }
}
//# sourceMappingURL=AppAccounts.js.map