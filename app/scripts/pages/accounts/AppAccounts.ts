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
                this.fetchData(`/fetchOrdered`),
            ]);

            this.markets = accountsResponse.accounts.map(
                (account: IAccount) => account.market
            );

            const tickerResponse = await this.fetchData(
                `/fetchTickers?markets=${encodeURIComponent(
                    this.markets.join(",")
                )}`
            );

            const formatOrders = this.formatOrderedData(
                orderedResponse
            ) as TOrdredData;

            const processedAccounts = await this.processAccountsData(
                accountsResponse.accounts,
                tickerResponse,
                formatOrders
            );

            this.renderAssets(accountsResponse);
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

    private renderAssets({ assets, accounts }: IAccountsProps) {
        const element = this.querySelector(".assets") as HTMLElement;

        const buyPrices = accounts.map((account: any) => account.buy_price);
        const totalBuyPrice = buyPrices.reduce(
            (a: number, b: number) => a + b,
            0
        );

        const contentData = {
            totalAsset: roundToDecimalPlace(
                assets.balance + assets.locked + totalBuyPrice,
                0
            ).toLocaleString(),
            locked: roundToDecimalPlace(assets.locked, 0).toLocaleString(),
            unit: assets.unit_currency,
            buyPrice: totalBuyPrice.toLocaleString(),
        };

        updateElementsTextWithData(contentData, element);

        delete element.dataset.loading;
    }

    private formatOrderedData(data: IOrdered[]) {
        try {
            let formatOrders: TOrdredData = {};

            // markets 배열에 있는 각 market에 대해 빈 배열을 할당
            this.markets.forEach((market) => {
                formatOrders[market] = [];
            });

            // 주어진 data 배열을 순회하면서 formatOrders 객체를 채움
            data.forEach((order) => {
                // 해당 market이 formatOrders 객체에 존재하면, order 객체를 배열에 추가
                if (formatOrders[order.market]) {
                    formatOrders[order.market].push(order);
                } else {
                    // 만약 이 market에 해당하는 배열이 아직 없으면, 이를 생성
                    formatOrders[order.market] = [order];
                }
            });

            return formatOrders;
        } catch (error) {
            console.error(error);
        }
    }

    private processAccountsData(
        accounts: IAccount[],
        tickerData: ITicker[],
        orderedObject: Record<string, IOrdered[]>
    ) {
        function _handleData(account: IAccount) {
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
