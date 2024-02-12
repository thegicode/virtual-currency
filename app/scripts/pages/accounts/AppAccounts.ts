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

    private renderKRW(data: any) {
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
        this.querySelector("ul")?.appendChild(fragment);
    }

    private createElement(data: any) {
        const element = document.createElement("li") as HTMLLIElement;
        let tp = `<div class="name"><h4>${data.currency}</h4> <span>(${data.unit_currency})</span></div>`;
        tp += `<p>∙  매수금액: ${this.roundToDecimalPlace(
            data.buy_price,
            0
        ).toLocaleString()}</p>`;
        tp += `<p>∙  매수평균가: ${this.roundToDecimalPlace(
            data.avg_buy_price,
            1
        ).toLocaleString()}</p>`;
        tp += `<p>∙  volume: ${data.volume}</p>`;
        tp += `<p>∙  locked: ${data.locked}</p>`;
        element.innerHTML = tp;
        return element;
    }

    private roundToDecimalPlace(amount: number, point: number) {
        const decimalPoint = point > 0 ? 10 * point : 1;
        return Math.round(amount * decimalPoint) / decimalPoint;
    }
}
