var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cloneTemplate, updateElementsTextWithData, } from "@app/scripts/utils/helpers";
export default class AppAccounts extends HTMLElement {
    constructor() {
        super();
        this.template = this.querySelector("#accountItem");
        this.list = this.querySelector(".accounts");
    }
    connectedCallback() {
        this.loadAccountData();
    }
    loadAccountData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accountsResponse = yield this.fetchData(`/accounts`);
                const markets = accountsResponse.accounts.map((anAccount) => `${anAccount.unit_currency}-${anAccount.currency}`);
                const tickerResponse = yield this.fetchData(`/ticker?markets=${encodeURIComponent(markets)}`);
                this.displayAssets(accountsResponse.assets);
                const processedAccounts = yield this.processAccountsData(accountsResponse.accounts, tickerResponse);
                this.renderAccountsList(processedAccounts);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    fetchData(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return yield response.json();
        });
    }
    displayAssets(data) {
        const element = this.querySelector(".assets");
        const totalAsset = Number(data.balance) + Number(data.locked);
        const contentData = {
            totalAsset: this.roundToDecimalPlace(totalAsset, 0).toLocaleString(),
            locked: this.roundToDecimalPlace(data.locked, 0).toLocaleString(),
            unit: data.unit_currency,
        };
        updateElementsTextWithData(contentData, element);
        delete element.dataset.loading;
    }
    processAccountsData(accounts, tickerData) {
        function _handleData(account) {
            const marketName = `${account.unit_currency}-${account.currency}`;
            const ticker = tickerData.find((t) => t.market === marketName);
            if (!ticker) {
                console.error(`Ticker not found for market: ${marketName}`);
                return null;
            }
            const priceAtBuy = account.avg_buy_price * account.volume;
            const currentPrice = ticker.trade_price * account.volume;
            const profit = currentPrice - priceAtBuy;
            const profitRate = priceAtBuy > 0 ? (profit / priceAtBuy) * 100 : 0;
            return {
                currency: account.currency,
                unitCurrency: account.unit_currency,
                buyPrice: account.buy_price,
                avgBuyPrice: account.avg_buy_price,
                volume: account.volume,
                locked: account.locked,
                profit,
                profitRate,
            };
        }
        return accounts
            .map((account) => _handleData(account))
            .filter((account) => account !== null);
    }
    renderAccountsList(data) {
        const fragment = new DocumentFragment();
        data.map((data) => this.createElement(data)).forEach((element) => fragment.appendChild(element));
        this.list.appendChild(fragment);
        delete this.list.dataset.loading;
    }
    createElement(anAccount) {
        const cloned = cloneTemplate(this.template);
        const contentData = {
            currency: anAccount.currency,
            unitCurrency: anAccount.unitCurrency,
            volume: anAccount.volume,
            buyPrice: this.roundToDecimalPlace(anAccount.buyPrice, 0).toLocaleString(),
            avgBuyPrice: this.roundToDecimalPlace(anAccount.avgBuyPrice, 1).toLocaleString(),
            profit: Math.round(anAccount.profit).toLocaleString(),
            profitRate: this.roundToDecimalPlace(anAccount.profitRate, 2) + "%",
        };
        updateElementsTextWithData(contentData, cloned);
        const isIncrement = anAccount.profit > 0 ? true : false;
        cloned.dataset.increase = isIncrement.toString();
        return cloned;
    }
    roundToDecimalPlace(amount, point) {
        const decimalPoint = Math.pow(10, point);
        return Math.round(amount * decimalPoint) / decimalPoint;
    }
}
//# sourceMappingURL=AppAccounts.js.map