import {
    roundToDecimalPlace,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";

import AccountItem from "./AccountItem";

export default class AppAccounts extends HTMLElement {
    private list: HTMLElement;

    constructor() {
        super();

        this.list = this.querySelector(".accountsList") as HTMLElement;
    }

    connectedCallback() {
        this.loadAccountData();

        // ing...
        this.ordered();
    }

    private async ordered() {
        try {
            const response = await this.fetchData(`/ordered`);
            console.log("ordered", response);
        } catch (error) {
            console.error(error);
        }
    }

    private async loadAccountData() {
        try {
            const accountsResponse = await this.fetchData(`/accounts`);

            const markets = accountsResponse.accounts.map(
                (anAccount: IAccount) =>
                    `${anAccount.unit_currency}-${anAccount.currency}`
            );
            const tickerResponse = await this.fetchData(
                `/ticker?markets=${encodeURIComponent(markets)}`
            );

            this.displayAssets(accountsResponse.assets);

            const processedAccounts = await this.processAccountsData(
                accountsResponse.accounts,
                tickerResponse
            );

            this.renderAccountsList(processedAccounts);
        } catch (error) {
            console.error(error);
        }
    }

    private async fetchData(url: string) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    private displayAssets(data: IAsset) {
        const element = this.querySelector(".assets") as HTMLElement;

        const totalAsset = Number(data.balance) + Number(data.locked);

        const contentData = {
            totalAsset: roundToDecimalPlace(totalAsset, 0).toLocaleString(),
            locked: roundToDecimalPlace(data.locked, 0).toLocaleString(),
            unit: data.unit_currency,
        };

        updateElementsTextWithData(contentData, element);

        delete element.dataset.loading;
    }

    private processAccountsData(accounts: IAccount[], tickerData: ITicker[]) {
        function _handleData(account: IAccount) {
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
            .filter((account) => account !== null) as IProcessedAccountData[];
    }

    private renderAccountsList(data: IProcessedAccountData[]) {
        const fragment = new DocumentFragment();

        data.map((data) => new AccountItem(data)).forEach((accountItem) => {
            fragment.appendChild(accountItem);
        });

        this.list.appendChild(fragment);

        delete this.list.dataset.loading;
    }
}
