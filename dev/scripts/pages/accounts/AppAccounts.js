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
                const processedAccounts = yield this.processAccountsData(accountsResponse.accounts, tickerResponse, orderedResponse);
                const profitPrices = processedAccounts.map((account) => account.profit);
                const profits = profitPrices.reduce((a, b) => a + b, 0);
                this.renderAssets(accountsResponse, profits);
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
    renderAssets({ assets, accounts }, profits) {
        const element = this.querySelector(".assets");
        const buyPrices = accounts.map((account) => account.buy_price);
        const totalBuyPrice = buyPrices.reduce((a, b) => a + b, 0);
        const profitRate = (profits / totalBuyPrice) * 100;
        const contentData = {
            asset: roundToDecimalPlace(assets.balance + assets.locked, 0).toLocaleString(),
            unit: assets.unit_currency,
            totalAsset: roundToDecimalPlace(assets.balance + assets.locked + totalBuyPrice + profits, 0).toLocaleString(),
            buyPrice: roundToDecimalPlace(totalBuyPrice, 0).toLocaleString(),
            buyPriceReal: roundToDecimalPlace(totalBuyPrice + profits, 0).toLocaleString(),
            profits: roundToDecimalPlace(profits, 0).toLocaleString(),
            profitRate: `${roundToDecimalPlace(profitRate, 2)}%`,
            locked: roundToDecimalPlace(assets.locked, 0).toLocaleString(),
        };
        updateElementsTextWithData(contentData, element);
        if (profits > 0)
            element.dataset.increase = "true";
        if (profits < 0)
            element.dataset.increase = "false";
        delete element.dataset.loading;
    }
    processAccountsData(accounts, tickerData, orderedObject) {
        function _formatData(account) {
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
            .map((account) => _formatData(account))
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