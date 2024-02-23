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
        this.loadAssetsAndAccounts();
    }
    disconnectedCallback() { }
    loadAssetsAndAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [accountsResponse, orderedResponse] = yield Promise.all([
                    this.fetchData(`/fetchAccounts`),
                    this.fetchData(`/fetchOrdered`),
                ]);
                this.markets = accountsResponse.accounts.map((account) => account.market);
                const tickerResponse = yield this.fetchData(`/fetchTickers?markets=${encodeURIComponent(this.markets.join(","))}`);
                const formatOrders = this.formatOrderedData(orderedResponse);
                const processedAccounts = yield this.processAccountsData(accountsResponse.accounts, tickerResponse, formatOrders);
                this.renderAssets(accountsResponse);
                this.renderAccounts(processedAccounts);
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
    renderAssets({ assets, accounts }) {
        const element = this.querySelector(".assets");
        const buyPrices = accounts.map((account) => account.buy_price);
        const totalBuyPrice = buyPrices.reduce((a, b) => a + b, 0);
        const contentData = {
            totalAsset: roundToDecimalPlace(assets.balance + assets.locked + totalBuyPrice, 0).toLocaleString(),
            locked: roundToDecimalPlace(assets.locked, 0).toLocaleString(),
            unit: assets.unit_currency,
            buyPrice: totalBuyPrice.toLocaleString(),
        };
        updateElementsTextWithData(contentData, element);
        delete element.dataset.loading;
    }
    formatOrderedData(data) {
        try {
            let formatOrders = {};
            this.markets.forEach((market) => {
                formatOrders[market] = [];
            });
            data.forEach((order) => {
                if (formatOrders[order.market]) {
                    formatOrders[order.market].push(order);
                }
                else {
                    formatOrders[order.market] = [order];
                }
            });
            return formatOrders;
        }
        catch (error) {
            console.error(error);
        }
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
                tradePrice: ticker.trade_price,
            };
        }
        return accounts
            .map((account) => _handleData(account))
            .filter((account) => account !== null);
    }
    renderAccounts(data) {
        const fragment = new DocumentFragment();
        data.map((aData) => new AccountItem(aData)).forEach((accountItem) => {
            fragment.appendChild(accountItem);
        });
        this.list.appendChild(fragment);
        delete this.list.dataset.loading;
    }
}
//# sourceMappingURL=AppAccounts.js.map