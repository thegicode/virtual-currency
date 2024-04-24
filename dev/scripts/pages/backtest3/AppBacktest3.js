var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class AppBacktest3 extends HTMLElement {
    constructor() {
        super();
        this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
        this.data = [];
        this.investmentPrice = 200000;
    }
    connectedCallback() {
        return __awaiter(this, void 0, void 0, function* () {
            this.data = yield this.loadData();
            this.getGoodMarkets();
        });
    }
    disconnectedCallback() { }
    loadData() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = this.markets.map((market) => __awaiter(this, void 0, void 0, function* () {
                const candles = yield this.getCandles(market);
                return {
                    market,
                    candles,
                };
            }));
            return yield Promise.all(promises);
        });
    }
    getCandles(market) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchParams = new URLSearchParams({
                market: market,
                count: "30",
            });
            const response = yield fetch(`/fetchCandles?${searchParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return yield response.json();
        });
    }
    getGoodMarkets() {
        const marketRates = this.data.map((marketData) => this.getRates(marketData));
        const markets = this.getMarkets(marketRates);
        this.renderMarkets(markets);
    }
    getRates({ market, candles }) {
        const startPrice = candles[0].trade_price;
        const lastPrice = candles[candles.length - 1].trade_price;
        const rate = (lastPrice - startPrice) / startPrice;
        return {
            market,
            rate: rate * 100,
        };
    }
    getMarkets(marketRates) {
        const sortedMarkets = marketRates.sort((a, b) => b.rate - a.rate);
        const newMarkets = sortedMarkets.filter((aMarket) => aMarket.rate > 0);
        return newMarkets;
    }
    renderMarkets(markets) {
        const resultElement = this.querySelector(".reulst");
        let markupStrings = "";
        if (markets.length === 0) {
            markupStrings =
                "모든 가상화폐의 30일 수익률이 마이너스입니다. <br>모든 코인을 매도하세요.";
        }
        markets.forEach((aMarket) => {
            markupStrings += `<li><span>${aMarket.market}</span> | <span>${aMarket.rate.toFixed(2)}</span></li>`;
        });
        resultElement.innerHTML = markupStrings;
    }
}
//# sourceMappingURL=AppBacktest3.js.map