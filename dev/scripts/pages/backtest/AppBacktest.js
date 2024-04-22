var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cloneTemplate, updateElementsTextWithData, } from "@app/scripts/utils/helpers";
export default class AppBacktest extends HTMLElement {
    constructor() {
        super();
        this.data = [];
    }
    connectedCallback() {
        console.log("AppBacktest");
        this.loadAndRender();
    }
    loadAndRender() {
        return __awaiter(this, void 0, void 0, function* () {
            const responseData = yield this.getCandles();
            this.data = this.setMovingAverage(responseData);
            this.setData();
            this.render();
        });
    }
    getCandles() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch("/fetchCandles");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return yield response.json();
        });
    }
    setMovingAverage(responseData) {
        const result = responseData.slice(4).map((aData, index) => {
            let sum = 0;
            for (let i = 0; i < 5; i++) {
                sum += Number(responseData[index + i].trade_price);
            }
            return Object.assign(Object.assign({}, aData), { moving_average_5: sum / 5 });
        });
        return result;
    }
    setData() {
        this.data = this.data.map((aData) => {
            if (!aData.moving_average_5)
                return aData;
            return Object.assign(Object.assign({}, aData), { condition: aData.moving_average_5 > Number(aData.trade_price) });
        });
    }
    render() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const fragment = new DocumentFragment();
            this.data
                .map((aData) => this.createItem(aData))
                .forEach((cloned) => fragment.appendChild(cloned));
            (_a = this.querySelector("table")) === null || _a === void 0 ? void 0 : _a.appendChild(fragment);
        });
    }
    createItem(aData) {
        const tpElement = document.querySelector("#tp-item");
        tpElement;
        const cloned = cloneTemplate(tpElement);
        if (!aData.moving_average_5)
            return cloned;
        const parseData = Object.assign(Object.assign({}, aData), { candle_date_time_kst: aData.candle_date_time_kst.replace("T", " "), opening_price: aData.opening_price.toLocaleString(), trade_price: aData.trade_price.toLocaleString(), prev_closing_price: aData.prev_closing_price.toLocaleString(), moving_average_5: aData.moving_average_5 &&
                aData.moving_average_5.toLocaleString() });
        console.log(parseData);
        updateElementsTextWithData(parseData, cloned);
        return cloned;
    }
}
//# sourceMappingURL=AppBacktest.js.map