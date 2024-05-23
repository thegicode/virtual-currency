var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class DailyMovingAverageBacktest extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("DailyMovingAverageBacktest");
            const data = yield this.fetchData();
            console.log(data);
        });
    }
    fetchData() {
        return __awaiter(this, void 0, void 0, function* () {
            const searchParams = new URLSearchParams({
                markets: "KRW-DOGE, KRW-AVAX",
                period: "5",
                initialCapital: "10000",
            });
            const response = yield fetch(`/fetchDailyMABacktest?${searchParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return yield response.json();
        });
    }
}
//# sourceMappingURL=DailyMovingAverageBacktest.js.map