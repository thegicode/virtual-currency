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
    renderKRW(data) {
        const assetsElement = this.querySelector(".assets");
        const element = assetsElement.cloneNode(true);
        const totalAsset = Number(data.balance) + Number(data.locked);
        let tp = `<h4>My Asset</h4>`;
        tp += `<p>보유 ${data.unit_currency} : ${this.roundToDecimalPlace(totalAsset, 0).toLocaleString()}</p>`;
        tp += `<p>locked ${data.unit_currency} : ${this.roundToDecimalPlace(data.locked, 0).toLocaleString()}</p>`;
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
        let tp = `<div class="name"><h4>${data.currency}</h4> <span>(${data.unit_currency})</span></div>`;
        tp += `<p>∙  매수금액: ${this.roundToDecimalPlace(data.buy_price, 0).toLocaleString()}</p>`;
        tp += `<p>∙  매수평균가: ${this.roundToDecimalPlace(data.avg_buy_price, 1).toLocaleString()}</p>`;
        tp += `<p>∙  volume: ${data.volume}</p>`;
        tp += `<p>∙  locked: ${data.locked}</p>`;
        element.innerHTML = tp;
        return element;
    }
    roundToDecimalPlace(amount, point) {
        const decimalPoint = point > 0 ? 10 * point : 1;
        return Math.round(amount * decimalPoint) / decimalPoint;
    }
}
//# sourceMappingURL=AppAccounts.js.map