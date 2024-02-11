export default class AppAccounts extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.fetchData();
    }

    private async fetchData() {
        try {
            const response = await fetch(`/accounts`);
            const data = await response.json();

            this.renderKRW(data.accountKRW);
            this.render(data.accounts);
        } catch (error) {
            console.error(error);
        }
    }

    private renderKRW(accountKRW: any) {
        const assetsElement = this.querySelector(".assets") as HTMLElement;
        const element = assetsElement.cloneNode(true) as HTMLElement;

        let tp = `<h4>My Asset</h4>`;
        tp += `<p>balance : ${this.roundToDecimalPlace(
            accountKRW.balance,
            0
        ).toLocaleString()} ${accountKRW.unit_currency}</p>`;
        tp += `<p>locked: ${this.roundToDecimalPlace(
            accountKRW.locked,
            0
        ).toLocaleString()} ${accountKRW.unit_currency}</p>`;
        element.innerHTML = tp;
        assetsElement.replaceWith(element);
    }

    private render(data: any) {
        const fragment = new DocumentFragment();
        data.map((data: any) => this.createElement(data)).forEach(
            (element: HTMLLIElement) => fragment.appendChild(element)
        );
        this.querySelector("ul")?.appendChild(fragment);
    }

    private createElement(data: any) {
        const element = document.createElement("li") as HTMLLIElement;
        const name = `${data.currency}-${data.unit_currency}`;
        let tp = `<h4>${name}</h4>`;
        tp += `<p>buy_price: ${this.roundToDecimalPlace(
            data.buy_price,
            0
        ).toLocaleString()}</p>`;
        tp += `<p>avg_buy_price: ${this.roundToDecimalPlace(
            data.avg_buy_price,
            1
        ).toLocaleString()}</p>`;
        tp += `<p>volume: ${data.volume}</p>`;
        tp += `<p>locked: ${data.locked}</p>`;
        element.innerHTML = tp;
        return element;
    }

    private roundToDecimalPlace(amount: number, point: number) {
        const decimalPoint = point > 0 ? 10 * point : 1;
        return Math.round(amount * decimalPoint) / decimalPoint;
    }
}
