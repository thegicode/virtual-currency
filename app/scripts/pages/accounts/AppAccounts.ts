import {
    roundToDecimalPlace,
    updateElementsTextWithData,
} from "@scripts/utils/helpers";

import AccountItem from "./AccountItem";

export default class AppAccounts extends HTMLElement {
    private markets: string[];
    private list: HTMLElement;

    constructor() {
        super();

        this.list = this.querySelector(".accountsList") as HTMLElement;

        this.markets = [];
    }

    connectedCallback() {
        this.loadAccountData();
    }

    private async loadAccountData() {
        try {
            const accountsResponse = await this.fetchData(`/accounts`);

            this.markets = accountsResponse.accounts.map(
                (account: IAccount) =>
                    `${account.unit_currency}-${account.currency}`
            );

            const tickerResponse = await this.fetchData(
                `/ticker?markets=${encodeURIComponent(this.markets.join(","))}`
            );

            this.displayAssets(accountsResponse.assets);

            const orderedResponse = await this.fetchData(`/ordered`);
            const orderedData = this.ordered(orderedResponse) as Record<
                string,
                IOrdered[]
            >;

            const processedAccounts = await this.processAccountsData(
                accountsResponse.accounts,
                tickerResponse,
                orderedData
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

    private ordered(data: IOrdered[]) {
        try {
            let orderedData: { [key: string]: IOrdered[] } = {};
            this.markets.map((market: string) => {
                orderedData[market] = [];
            });

            data.map((order: IOrdered) => {
                orderedData[order.market].push(order);
            });

            return orderedData;
        } catch (error) {
            console.error(error);
        }
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

    private processAccountsData(
        accounts: IAccount[],
        tickerData: ITicker[],
        orderedObject: Record<string, IOrdered[]>
    ) {
        function _handleData(account: IAccount) {
            const marketName = `${account.unit_currency}-${account.currency}`;
            const ticker = tickerData.find((t) => t.market === marketName);
            const orderedData = orderedObject[marketName];

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
                orderedData,
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
