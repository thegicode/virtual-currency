export default class AppAccounts extends HTMLElement {
    private template: HTMLTemplateElement;

    constructor() {
        super();

        this.template = this.querySelector(
            "#accountItem"
        ) as HTMLTemplateElement;
    }

    connectedCallback() {
        this.fetch();
    }

    private async fetch() {
        try {
            const accountsdata = await this.fetchAccounts();
            const markets = accountsdata.accounts.map(
                (d: any) => `${d.unit_currency}-${d.currency}`
            );
            const tickerData = await this.fetchTikcer(markets);

            this.renderAssests(accountsdata.assets);
            const result = await this.transformData(
                accountsdata.accounts,
                tickerData
            );
            this.render(result);
        } catch (error) {
            console.error(error);
        }
    }

    private transformData(accounts: any, tickerData: any) {
        const tickerNames = tickerData.map((t: any) => t.market);

        const result = accounts.map((aAccount: any, index: number) => {
            const {
                avg_buy_price,
                buy_price,
                currency,
                locked,
                unit_currency,
                volume,
            } = aAccount;

            const marketName = `${aAccount.unit_currency}-${aAccount.currency}`;
            const tickerIndex = tickerNames.indexOf(marketName);
            const ticker = tickerData[tickerIndex];

            const price1 = avg_buy_price * volume;
            const price2 = ticker.trade_price * volume;
            const profit = price2 - price1;
            const profitRate = (profit / price1) * 100;

            return {
                currency: currency,
                unitCurrency: unit_currency,
                buyPrice: this.roundToDecimalPlace(
                    buy_price,
                    0
                ).toLocaleString(),
                avgBuyPrice: this.roundToDecimalPlace(
                    avg_buy_price,
                    1
                ).toLocaleString(),
                volume,
                locked,
                profit: Math.round(profit),
                profitRate,
            };
        });

        return result;
    }

    private async fetchAccounts() {
        try {
            const response = await fetch(`/accounts`);
            return await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    private async fetchTikcer(markets: Array<string>) {
        try {
            const response = await fetch(`/ticker?markets=${markets}`);
            return await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    private renderAssests(data: any) {
        const assetsElement = this.querySelector(".assets") as HTMLElement;
        const element = assetsElement.cloneNode(true) as HTMLElement;

        const totalAsset = Number(data.balance) + Number(data.locked);

        let tp = `<h4>My Asset</h4>`;
        tp += `<p>보유 ${data.unit_currency} : ${this.roundToDecimalPlace(
            totalAsset,
            0
        ).toLocaleString()}</p>`;

        tp += `<p>locked ${data.unit_currency} : ${this.roundToDecimalPlace(
            data.locked,
            0
        ).toLocaleString()}</p>`;
        element.innerHTML = tp;
        assetsElement.replaceWith(element);
    }

    private render(data: any) {
        const fragment = new DocumentFragment();
        data.map((data: any) => this.createElement(data)).forEach(
            (element: HTMLLIElement) => fragment.appendChild(element)
        );
        this.querySelector(".accounts")?.appendChild(fragment);
    }

    private createElement(aAccount: any) {
        const element = this.template?.content.firstElementChild?.cloneNode(
            true
        ) as HTMLElement;

        (element.querySelector(".currency") as HTMLElement).textContent =
            aAccount.currency;
        (element.querySelector(".unitCurrency") as HTMLElement).textContent =
            aAccount.unitCurrency;
        (element.querySelector(".buyPrice") as HTMLElement).textContent =
            aAccount.buyPrice;
        (element.querySelector(".avgBuyPrice") as HTMLElement).textContent =
            aAccount.avgBuyPrice;
        (element.querySelector(".volume") as HTMLElement).textContent =
            aAccount.volume;
        // (element.querySelector(".locked") as HTMLElement).textContent =
        //     aAccount.locked;

        const isPlus = aAccount.profit > 0 ? true : false;

        const profitElement = element.querySelector(".profit") as HTMLElement;
        profitElement.textContent = aAccount.profit;

        (
            element.querySelector(".profitRate") as HTMLElement
        ).textContent = `${aAccount.profitRate.toFixed(2)}%`;

        (profitElement.closest("li") as HTMLElement).dataset.increase =
            isPlus.toString();

        return element;
    }

    private roundToDecimalPlace(amount: number, point: number) {
        const decimalPoint = point > 0 ? 10 * point : 1;
        return Math.round(amount * decimalPoint) / decimalPoint;
    }
}
