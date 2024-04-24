"use strict";
(() => {
  // dev/scripts/pages/backtest3/AppBacktest3.js
  var __awaiter = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var AppBacktest3 = class extends HTMLElement {
    constructor() {
      super();
      this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
      this.data = [];
      this.investmentPrice = 2e5;
    }
    connectedCallback() {
      return __awaiter(this, void 0, void 0, function* () {
        this.data = yield this.loadData();
        this.getGoodMarkets();
      });
    }
    disconnectedCallback() {
    }
    loadData() {
      return __awaiter(this, void 0, void 0, function* () {
        const promises = this.markets.map((market) => __awaiter(this, void 0, void 0, function* () {
          const candles = yield this.getCandles(market);
          return {
            market,
            candles
          };
        }));
        return yield Promise.all(promises);
      });
    }
    getCandles(market) {
      return __awaiter(this, void 0, void 0, function* () {
        const searchParams = new URLSearchParams({
          market,
          count: "30"
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
        rate: rate * 100
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
        markupStrings = "\uBAA8\uB4E0 \uAC00\uC0C1\uD654\uD3D0\uC758 30\uC77C \uC218\uC775\uB960\uC774 \uB9C8\uC774\uB108\uC2A4\uC785\uB2C8\uB2E4. <br>\uBAA8\uB4E0 \uCF54\uC778\uC744 \uB9E4\uB3C4\uD558\uC138\uC694.";
      }
      markets.forEach((aMarket) => {
        markupStrings += `<li><span>${aMarket.market}</span> | <span>${aMarket.rate.toFixed(2)}</span></li>`;
      });
      resultElement.innerHTML = markupStrings;
    }
  };

  // dev/scripts/pages/backtest3/index.js
  customElements.define("app-backtest2", AppBacktest3);
})();
//# sourceMappingURL=index.js.map
