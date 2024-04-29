"use strict";
(() => {
  // app/scripts/utils/helpers.ts
  function cloneTemplate(template) {
    const content = template.content.firstElementChild;
    if (!content) {
      throw new Error("Template content is empty");
    }
    return content.cloneNode(true);
  }
  function updateElementsTextWithData(data, container) {
    Object.entries(data).forEach(([key, value]) => {
      const element = container.querySelector(`.${key}`);
      element.textContent = String(value);
    });
  }

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
      this.investmentPrice = 2e5;
      this.profit = [];
      this.data = [];
      this.qqqData = {};
      this.tradeData = [];
      this.count = 200;
      this.totalGain = this.investmentPrice * 3;
      this.totalUnrealizeGain = 0;
      this.template = document.querySelector("#tp-item");
    }
    connectedCallback() {
      return __awaiter(this, void 0, void 0, function* () {
        const toDate = this.getToDate();
        this.data = yield this.loadData(toDate, this.count.toString());
        this.qqqData = this.transformData();
        this.runBackTest();
      });
    }
    runBackTest() {
      return __awaiter(this, void 0, void 0, function* () {
        for (let index = 0; index < 30; index++) {
          const { testMonthData, qqqTestMonthData } = this.getTestData(index);
          const { marketTestRates, qqqMarketTestRates } = this.getMarketTestRates(testMonthData, qqqTestMonthData);
          const tradeDate = testMonthData[0].tradeDate;
          console.log(index, tradeDate);
          const { sortedMarkets, qqqSortedMarkets } = this.getSortedMarkets(marketTestRates, qqqMarketTestRates);
          const { tradeMarkets, qqqTradeMarkets } = this.getTradeMarkets(sortedMarkets, qqqMarketTestRates);
          const { tradeData, newTradeData } = this.getTradeData(tradeMarkets, index);
          const formedTradeData = this.setTradeData(newTradeData, index, tradeDate);
          this.tradeData.push(formedTradeData);
          const { tradeProfits, selledProfits, sumGain, SumUnrealizeGain } = this.getTradeProfits(tradeData, newTradeData, index, formedTradeData);
          this.profit.push(SumUnrealizeGain);
          this.render(index, tradeDate, tradeProfits, selledProfits, sumGain, SumUnrealizeGain);
        }
        this.renderSummary();
      });
    }
    getToDate() {
      const now = /* @__PURE__ */ new Date();
      now.setMonth(now.getMonth());
      now.setDate(now.getDate());
      now.setHours(18, 0, 0, 0);
      return now.toISOString().slice(0, 19);
    }
    loadData(toDate, count) {
      return __awaiter(this, void 0, void 0, function* () {
        const promises = this.markets.map((market) => __awaiter(this, void 0, void 0, function* () {
          const candles = yield this.getCandles(market, count, toDate);
          return {
            market,
            candles
          };
        }));
        return yield Promise.all(promises);
      });
    }
    transformData() {
      const data = [...this.data];
      let newData = {};
      data.forEach(({ market, candles }) => {
        newData[market] = candles;
      });
      return newData;
    }
    getTestData(index) {
      const testMonthData = this.data.map(({ market, candles }) => {
        const newCandles = candles.slice(index, 30 + index);
        const tradeDate = candles[index + 30].candle_date_time_kst;
        return {
          market,
          candles: newCandles,
          tradeDate
        };
      });
      const qqqTestMonthData = {};
      for (const market in this.qqqData) {
        const candles = this.qqqData[market].slice(index, 30 + index);
        const tradeDate = this.qqqData[market][30 + index].candle_date_time_kst;
        qqqTestMonthData[market] = {
          candles,
          tradeDate
        };
      }
      return { testMonthData, qqqTestMonthData };
    }
    getCandles(market, count, to) {
      return __awaiter(this, void 0, void 0, function* () {
        const searchParams = new URLSearchParams({
          market,
          count,
          to
        });
        const response = yield fetch(`/fetchCandles?${searchParams}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return yield response.json();
      });
    }
    getMarketTestRates(oneMonthData, qqqTestMonthData) {
      const marketTestRates = oneMonthData.map(({ market, candles }) => {
        const startPrice = candles[0].trade_price;
        const lastPrice = candles[candles.length - 1].trade_price;
        const rate = (lastPrice - startPrice) / startPrice;
        return {
          market,
          rate: rate * 100
        };
      });
      const qqqMarketTestRates = {};
      for (const market in qqqTestMonthData) {
        const candles = qqqTestMonthData[market].candles;
        const startPrice = candles[0].trade_price;
        const lastPrice = candles[candles.length - 1].trade_price;
        const rate = (lastPrice - startPrice) / startPrice;
        qqqMarketTestRates[market] = rate * 100;
      }
      return {
        marketTestRates,
        qqqMarketTestRates
      };
    }
    getSortedMarkets(marketRates, qqqMarketTestRates) {
      const markets = [...marketRates].sort((a, b) => b.rate - a.rate);
      const sortedMarkets = markets.filter((aMarket) => aMarket.rate > 0);
      const qqqSortedMarkets = Object.entries(qqqMarketTestRates).sort((a, b) => b[1] - a[1]).filter((item) => item[1] > 0);
      return { sortedMarkets, qqqSortedMarkets };
    }
    getTradeMarkets(markets, qqqMarketTestRates) {
      const newMarkets = markets.filter((aMarket) => {
        if (aMarket.rate > 0)
          return aMarket;
      }).map((aMarket) => aMarket.market);
      const tradeMarkets = newMarkets.length > 3 ? newMarkets.slice(0, 3) : newMarkets;
      const qqqMarkets = Object.entries(qqqMarketTestRates).filter(([market, rate]) => rate > 0).map(([market, rate]) => market);
      const qqqTradeMarkets = qqqMarkets.length > 3 ? qqqMarkets.slice(0, 3) : qqqMarkets;
      return { tradeMarkets, qqqTradeMarkets };
    }
    getTradeData(tradeMarkets, index) {
      const tradeIndex = 30 + index;
      const marketNames = this.data.map((aMarketData) => aMarketData.market);
      const tradeData = tradeMarkets.map((market) => {
        const index2 = marketNames.indexOf(market);
        const candles = this.data[index2].candles;
        return {
          market,
          candles: [candles[tradeIndex - 1], candles[tradeIndex]]
        };
      });
      const newTradeData = {};
      tradeMarkets.forEach((market) => {
        newTradeData[market] = [
          this.qqqData[market][tradeIndex - 1],
          this.qqqData[market][tradeIndex]
        ];
      });
      return { tradeData, newTradeData };
    }
    setTradeData(tradeData, index, date) {
      let tradeMarkets = {};
      const prevTrades = index > 0 && this.tradeData[index - 1].tradeMarkets;
      const prevMarkets = Object.keys(prevTrades);
      if (index === 0) {
        for (const market in tradeData) {
          tradeMarkets[market] = {
            action: "Buy"
          };
        }
      } else {
        for (const market in tradeData) {
          tradeMarkets[market] = {
            action: prevMarkets.includes(market) ? "Hold" : "Buy"
          };
        }
      }
      const markets = Object.keys(tradeData);
      const sellMarkets = prevMarkets.filter((prevMarket) => !markets.includes(prevMarket));
      const result = {
        date,
        tradeMarkets,
        sellMarkets
      };
      return result;
    }
    getTradeProfits(tradeData, newTradeData, index, formedTradeData) {
      for (const market in formedTradeData.tradeMarkets) {
        let buyPrice = 0;
        const action = formedTradeData.tradeMarkets[market].action;
        const candles = newTradeData[market];
        switch (action) {
          case "Buy":
            buyPrice = candles[1].trade_price;
            break;
          case "Hold":
            buyPrice = this.tradeData[index - 1].tradeMarkets[market].buy_price;
            break;
        }
        formedTradeData.tradeMarkets[market] = Object.assign(Object.assign({}, formedTradeData.tradeMarkets[market]), { buy_price: buyPrice });
      }
      const tradeProfits = Object.entries(newTradeData).map(([market, candles]) => {
        const marketTradeData = formedTradeData.tradeMarkets[market];
        switch (marketTradeData.action) {
          case "Hold":
            const distance = candles[1].trade_price - marketTradeData.buy_price;
            const rate = distance / marketTradeData.buy_price;
            const gain = this.investmentPrice * rate;
            return {
              market,
              rate,
              gain
            };
          default:
            return {
              market,
              rate: 0,
              gain: 0
            };
        }
      });
      const selledProfits = formedTradeData.sellMarkets && formedTradeData.sellMarkets.map((market) => {
        const tradeIndex = 30 + index;
        const buyPrice = this.tradeData[index - 1].tradeMarkets[market].buy_price;
        const aData = this.qqqData[market][30 + index];
        const rate = (aData.trade_price - buyPrice) / buyPrice;
        const gain = this.investmentPrice * rate;
        return {
          market,
          rate,
          gain
        };
      });
      const sumGain = selledProfits.reduce((acc, value) => {
        return acc + value.gain;
      }, 0);
      const SumUnrealizeGain = [...tradeProfits].reduce((acc, value) => {
        return acc + value.gain;
      }, 0);
      this.totalGain += sumGain;
      this.totalUnrealizeGain = this.totalGain + SumUnrealizeGain;
      return {
        tradeProfits,
        selledProfits,
        sumGain,
        SumUnrealizeGain
      };
    }
    render(index, tradeDate, tradeProfits, selledProfits, sumGain, SumUnrealizeGain) {
      var _a, _b;
      const cloned = cloneTemplate(this.template);
      const buyContainer = this.renderBuySell(tradeProfits);
      const sellContainer = this.renderBuySell(selledProfits);
      (_a = cloned.querySelector(".tradeMarkets")) === null || _a === void 0 ? void 0 : _a.appendChild(buyContainer);
      (_b = cloned.querySelector(".sellMarkets")) === null || _b === void 0 ? void 0 : _b.appendChild(sellContainer);
      const data = {
        index,
        date: tradeDate,
        SumUnrealizeGain: Math.round(SumUnrealizeGain).toLocaleString(),
        sumGain: Math.round(sumGain).toLocaleString(),
        totalGain: Math.round(this.totalGain).toLocaleString(),
        totalUnrealizeGain: Math.round(this.totalUnrealizeGain).toLocaleString()
      };
      updateElementsTextWithData(data, cloned);
      const container = this.querySelector("tbody");
      container.appendChild(cloned);
    }
    renderBuySell(data) {
      const tradeTp = document.querySelector("#tp-trade");
      const container = document.createElement("ul");
      data.map(({ market, rate, gain }) => {
        const tradeData = {
          market,
          rate: (rate * 100).toFixed(2),
          gain: Math.round(gain).toLocaleString()
        };
        const clonedTrade = cloneTemplate(tradeTp);
        updateElementsTextWithData(tradeData, clonedTrade);
        return clonedTrade;
      }).forEach((cloned) => container.appendChild(cloned));
      return container;
    }
    renderSummary() {
      const priceElement = this.querySelector(".summaryAllPrice");
      const rateElement = this.querySelector(".summaryAllRate");
      const marketsElement = this.querySelector(".markets");
      const countElement = this.querySelector(".count");
      const sumRate = (this.totalUnrealizeGain - this.investmentPrice * 3) / this.investmentPrice * 100;
      priceElement.textContent = Math.round(this.totalUnrealizeGain - this.investmentPrice * 3).toLocaleString();
      rateElement.textContent = Math.round(sumRate).toLocaleString();
      marketsElement.textContent = this.markets.join(" | ");
      countElement.textContent = this.count.toString();
    }
  };

  // dev/scripts/pages/backtest3/index.js
  customElements.define("app-backtest2", AppBacktest3);
})();
//# sourceMappingURL=index.js.map
