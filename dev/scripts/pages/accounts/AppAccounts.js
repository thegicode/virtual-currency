var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { roundToDecimalPlace, updateElementsTextWithData, } from "@scripts/utils/helpers";
import AccountItem from "./AccountItem";
export default class AppAccounts extends HTMLElement {
    constructor() {
        super();
        this.list = this.querySelector(".accountsList");
        this.markets = [];
    }
    connectedCallback() {
        this.loadAccountData();
    }
    disconnectedCallback() { }
    loadAccountData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accountsResponse = yield this.fetchData(`/fetchAccounts`);
                this.markets = accountsResponse.accounts.map((account) => account.market);
                const tickerResponse = yield this.fetchData(`/fetchTickers?markets=${encodeURIComponent(this.markets.join(","))}`);
                this.displayAssets(accountsResponse.assets);
                const orderedResponse = yield this.fetchData(`/fetchOrdered`);
                const orderedData = this.ordered(orderedResponse);
                const processedAccounts = yield this.processAccountsData(accountsResponse.accounts, tickerResponse, orderedData);
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
    ordered(data) {
        try {
            let orderedData = {};
            this.markets.map((market) => {
                orderedData[market] = [];
            });
            data.map((order) => {
                orderedData[order.market].push(order);
            });
            return orderedData;
        }
        catch (error) {
            console.error(error);
        }
    }
    displayAssets(data) {
        const element = this.querySelector(".assets");
        const totalAsset = data.balance + data.locked;
        const contentData = {
            totalAsset: roundToDecimalPlace(totalAsset, 0).toLocaleString(),
            locked: roundToDecimalPlace(data.locked, 0).toLocaleString(),
            unit: data.unit_currency,
        };
        updateElementsTextWithData(contentData, element);
        delete element.dataset.loading;
    }
    processAccountsData(accounts, tickerData, orderedObject) {
        function _handleData(account) {
            const ticker = tickerData.find((t) => t.market === account.market);
            const orderedData = orderedObject[account.market];
            if (!ticker) {
                console.error(`Ticker not found for market: ${account.market}`);
                return null;
            }
            const priceAtBuy = account.avg_buy_price * account.volume;
            const currentPrice = ticker.trade_price * account.volume;
            const profit = currentPrice - priceAtBuy;
            const profitRate = priceAtBuy > 0 ? (profit / priceAtBuy) * 100 : 0;
            return {
                market: account.market,
                currency: account.currency,
                unitCurrency: account.unit_currency,
                buyPrice: account.buy_price,
                avgBuyPrice: account.avg_buy_price,
                volume: account.volume,
                locked: account.locked,
                profit,
                profitRate,
                orderedData,
            };
        }
        return accounts
            .map((account) => _handleData(account))
            .filter((account) => account !== null);
    }
    renderAccountsList(data) {
        const fragment = new DocumentFragment();
        data.map((aData) => new AccountItem(aData)).forEach((accountItem) => {
            fragment.appendChild(accountItem);
        });
        this.list.appendChild(fragment);
        delete this.list.dataset.loading;
    }
}
//# sourceMappingURL=AppAccounts.js.map