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
        this.loadAssetsAndAccounts();
    }

    disconnectedCallback() {}

    private async loadAssetsAndAccounts() {
        try {
            const [accountsResponse, orderedResponse] = await Promise.all([
                this.fetchData(`/fetchAccounts`),
                this.fetchData(`/fetchOrdereds`),
            ]);

            this.markets = accountsResponse.accounts.map(
                (account: IAccount) => account.market
            );

            const tickerResponse = await this.fetchData(
                `/fetchTickers?markets=${encodeURIComponent(
                    this.markets.join(",")
                )}`
            );

            const processedAccounts = await this.processAccountsData(
                accountsResponse.accounts,
                tickerResponse,
                orderedResponse
            );

            const profitPrices = processedAccounts.map(
                (account) => account.profit
            );
            const profits = profitPrices.reduce((a, b) => a + b, 0);

            this.renderAssets(accountsResponse, profits);
            this.renderAccounts(processedAccounts);
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

    private renderAssets(
        { assets, accounts }: IAccountsProps,
        profits: number
    ) {
        const element = this.querySelector(".assets") as HTMLElement;

        const buyPrices = accounts.map((account: any) => account.buy_price);
        const totalBuyPrice = buyPrices.reduce(
            (a: number, b: number) => a + b,
            0
        );
        const profitRate = (profits / totalBuyPrice) * 100;

        const contentData = {
            asset: roundToDecimalPlace(
                assets.balance + assets.locked,
                0
            ).toLocaleString(),
            unit: assets.unit_currency,
            totalAsset: roundToDecimalPlace(
                assets.balance + assets.locked + totalBuyPrice + profits,
                0
            ).toLocaleString(),
            buyPrice: roundToDecimalPlace(totalBuyPrice, 0).toLocaleString(),
            buyPriceReal: roundToDecimalPlace(
                totalBuyPrice + profits,
                0
            ).toLocaleString(),
            profits: roundToDecimalPlace(profits, 0).toLocaleString(),
            profitRate: `${roundToDecimalPlace(profitRate, 2)}%`,
            locked: roundToDecimalPlace(assets.locked, 0).toLocaleString(),
        };

        updateElementsTextWithData(contentData, element);

        if (profits > 0) element.dataset.increase = "true";
        if (profits < 0) element.dataset.increase = "false";

        delete element.dataset.loading;
    }

    private processAccountsData(
        accounts: IAccount[],
        tickerData: ITicker[],
        orderedObject: Record<string, IOrdered[]>
    ) {
        function _formatData(account: IAccount) {
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
            .filter((account) => account !== null) as IProcessedAccountData[];
    }

    private renderAccounts(data: IProcessedAccountData[]) {
        const fragment = new DocumentFragment();

        data.map((aData) => new AccountItem(aData)).forEach((accountItem) => {
            fragment.appendChild(accountItem);
        });

        this.list.appendChild(fragment);

        delete this.list.dataset.loading;
    }
}
