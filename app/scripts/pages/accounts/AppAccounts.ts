import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";

export default class AppAccounts extends HTMLElement {
    private template: HTMLTemplateElement;
    private list: HTMLElement;

    constructor() {
        super();

        this.template = this.querySelector(
            "#accountItem"
        ) as HTMLTemplateElement;
        this.list = this.querySelector(".accountsList") as HTMLElement;
    }

    connectedCallback() {
        this.loadAccountData();
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
            totalAsset: this.roundToDecimalPlace(
                totalAsset,
                0
            ).toLocaleString(),
            locked: this.roundToDecimalPlace(data.locked, 0).toLocaleString(),
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
        data.map((data) => this.createElement(data)).forEach((element) =>
            fragment.appendChild(element)
        );
        this.list.appendChild(fragment);
        delete this.list.dataset.loading;
    }

    private createElement(anAccount: IProcessedAccountData) {
        const cloned = cloneTemplate<HTMLElement>(this.template);

        const contentData = {
            currency: anAccount.currency,
            unitCurrency: anAccount.unitCurrency,
            volume: anAccount.volume,
            buyPrice: this.roundToDecimalPlace(
                anAccount.buyPrice,
                0
            ).toLocaleString(),
            avgBuyPrice: this.roundToDecimalPlace(
                anAccount.avgBuyPrice,
                1
            ).toLocaleString(),
            profit: Math.round(anAccount.profit).toLocaleString(),
            profitRate: this.roundToDecimalPlace(anAccount.profitRate, 2) + "%",
        };

        updateElementsTextWithData(contentData, cloned);

        const isIncrement = anAccount.profit > 0 ? true : false;
        cloned.dataset.increase = isIncrement.toString();

        // [TODO] orders-chance
        this.ordersChance(anAccount.market);

        return cloned;
    }

    private async ordersChance(market: string) {
        const response = await this.fetchData(
            `/orders-chance?market=${market}`
        );
        console.log("ordersChance", response);
    }

    private roundToDecimalPlace(amount: number, point: number) {
        const decimalPoint = Math.pow(10, point);
        return Math.round(amount * decimalPoint) / decimalPoint;
    }
}
