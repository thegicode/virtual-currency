var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class AppAccounts extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.fetchData();
    }
    fetchData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`/accounts`);
                const data = yield response.json();
                this.renderKRW(data.accountKRW);
                this.render(data.accounts);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    renderKRW(accountKRW) {
        const assetsElement = this.querySelector(".assets");
        const element = assetsElement.cloneNode(true);
        let tp = `<h4>My Asset</h4>`;
        tp += `<p>balance : ${this.roundToDecimalPlace(accountKRW.balance, 0).toLocaleString()} ${accountKRW.unit_currency}</p>`;
        tp += `<p>locked: ${this.roundToDecimalPlace(accountKRW.locked, 0).toLocaleString()} ${accountKRW.unit_currency}</p>`;
        element.innerHTML = tp;
        assetsElement.replaceWith(element);
    }
    render(data) {
        var _a;
        const fragment = new DocumentFragment();
        data.map((data) => this.createElement(data)).forEach((element) => fragment.appendChild(element));
        (_a = this.querySelector("ul")) === null || _a === void 0 ? void 0 : _a.appendChild(fragment);
    }
    createElement(data) {
        const element = document.createElement("li");
        const name = `${data.currency}-${data.unit_currency}`;
        let tp = `<h4>${name}</h4>`;
        tp += `<p>buy_price: ${this.roundToDecimalPlace(data.buy_price, 0).toLocaleString()}</p>`;
        tp += `<p>avg_buy_price: ${this.roundToDecimalPlace(data.avg_buy_price, 1).toLocaleString()}</p>`;
        tp += `<p>volume: ${data.volume}</p>`;
        tp += `<p>locked: ${data.locked}</p>`;
        element.innerHTML = tp;
        return element;
    }
    roundToDecimalPlace(amount, point) {
        const decimalPoint = point > 0 ? 10 * point : 1;
        return Math.round(amount * decimalPoint) / decimalPoint;
    }
}
//# sourceMappingURL=AppAccounts.js.map