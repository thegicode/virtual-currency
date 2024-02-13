var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { roundToDecimalPlace, updateElementsTextWithData, } from "@app/scripts/utils/helpers";
import AccountItem from "./AccountItem";
export default class AppAccounts extends HTMLElement {
    constructor() {
        super();
        this.list = this.querySelector(".accountsList");
    }
    connectedCallback() {
        this.loadAccountData();
        this.ordered();
    }
    ordered() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.fetchData(`/ordered`);
                console.log("ordered", response);
            }
            catch (error) {
                console.error(error);
            }
        });
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
            totalAsset: roundToDecimalPlace(totalAsset, 0).toLocaleString(),
            locked: roundToDecimalPlace(data.locked, 0).toLocaleString(),
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
                market: marketName,
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
        data.map((data) => new AccountItem(data)).forEach((accountItem) => {
            fragment.appendChild(accountItem);
        });
        this.list.appendChild(fragment);
        delete this.list.dataset.loading;
    }
}
//# sourceMappingURL=AppAccounts.js.map