"use strict";
(() => {
  // app/scripts/components/backtest/movingAverage.ts
  function setMovingAverage(data, period = 5) {
    const result = data.map((aData, index) => {
      if (index < period - 1) {
        return aData;
      }
      const average = calculateMovingAverage(data, index, period);
      aData[`moving_average_${period}`] = average.toFixed(2);
      return aData;
    });
    return result;
  }
  function calculateMovingAverage(data, index, period = 5) {
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[index - i].trade_price;
    }
    return sum / period;
  }

  // app/scripts/components/backtest/volatility.ts
  function getDaliyVolatility(aData) {
    const result = (aData.high_price - aData.low_price) / aData.opening_price * 100;
    return Number(result.toFixed(2));
  }
  function getVolatility(data, aData, index) {
    let sum = 0;
    if (index < 5) {
      return;
    }
    for (let i = 5; i > 0; i--) {
      sum += data[index - i].daily_volatility;
    }
    return Number((sum / 5).toFixed(2));
  }

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

  // dev/scripts/pages/backtest2/AppBacktest2.js
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
  var AppBacktest2 = class extends HTMLElement {
    constructor() {
      super();
      this.data = [];
      this.market = "KRW-XRP";
      this.count = 50;
      this.marketSize = 5;
      this.totalInvestmentPrice = 1e6;
    }
    connectedCallback() {
      this.loadAndRender();
    }
    loadAndRender() {
      return __awaiter(this, void 0, void 0, function* () {
        const originData = yield this.getCandles();
        this.movingAverages(originData);
        this.checkCondition();
        this.setAction();
        this.setVolatility();
        this.order();
        this.setProfit();
        this.render();
      });
    }
    getCandles() {
      return __awaiter(this, void 0, void 0, function* () {
        const searchParams = new URLSearchParams({
          market: this.market,
          count: this.count.toString()
        });
        const response = yield fetch(`/fetchCandles?${searchParams}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return yield response.json();
      });
    }
    movingAverages(originData) {
      let data = setMovingAverage(originData, 3);
      data = setMovingAverage(originData, 5);
      data = setMovingAverage(originData, 10);
      data = setMovingAverage(originData, 20);
      this.data = data;
    }
    checkCondition() {
      this.data = this.data.map((aData) => {
        if (aData.moving_average_3 > aData.trade_price && aData.moving_average_5 > aData.trade_price && aData.moving_average_10 > aData.trade_price && aData.moving_average_20 > aData.trade_price)
          aData.condition = true;
        else
          aData.condition = false;
        return Object.assign({}, aData);
      });
    }
    setAction() {
      this.data = this.data.map((aData, index) => {
        let action = "";
        if (index === 0) {
          if (aData.condition)
            action = "Buy";
          else if (!aData.condition)
            action = "";
        } else {
          const prevCondition = this.data[index - 1].condition;
          if (prevCondition && aData.condition) {
            action = "Hold";
          } else if (prevCondition && !aData.condition) {
            action = "Sell";
          } else if (!prevCondition && aData.condition) {
            action = "Buy";
          } else if (!prevCondition && !aData.condition) {
            action = "Reserve";
          }
        }
        return Object.assign(Object.assign({}, aData), { action });
      });
    }
    setVolatility() {
      this.data = this.data.map((aData) => {
        return Object.assign(Object.assign({}, aData), { daily_volatility: getDaliyVolatility(aData) });
      });
      this.data = this.data.map((aData, index) => {
        const volatility = getVolatility(this.data, aData, index);
        return Object.assign(Object.assign({}, aData), { volatility });
      });
    }
    order() {
      const target = 2;
      this.data = this.data.map((aData) => {
        if (!aData.volatility)
          return aData;
        if (aData.action === "Buy") {
          const percent = target / aData.volatility * 100;
          const unitPercent = percent / this.marketSize;
          const result = this.totalInvestmentPrice * unitPercent / 100;
          return Object.assign(Object.assign({}, aData), { order_price: Math.round(result) });
        } else
          return aData;
      });
    }
    setProfit() {
      let buyTradePrice = 0;
      let orderPrice = 0;
      let profit = 0;
      let sumProfit = 0;
      let sumPrice = this.totalInvestmentPrice / this.marketSize;
      this.data = this.data.map((aData) => {
        switch (aData.action) {
          case "Buy":
            buyTradePrice = aData.trade_price;
            if (aData.order_price)
              orderPrice = aData.order_price;
            profit = 0;
            break;
          case "Sell":
            const rate = (aData.trade_price - buyTradePrice) / buyTradePrice;
            profit = orderPrice * rate;
            sumProfit += profit;
            sumPrice += sumProfit;
            break;
          case "Reserve":
            profit = 0;
            break;
        }
        return Object.assign(Object.assign({}, aData), { profit, sumProfit: Number(sumProfit.toFixed(2)), sumPrice: Number(sumPrice.toFixed(2)) });
      });
    }
    render() {
      const tableElement = this.querySelector("tbody");
      tableElement.innerHTML = "";
      const fragment = new DocumentFragment();
      this.data.map((aData, index) => this.createItem(aData, index)).forEach((cloned) => fragment.appendChild(cloned));
      tableElement === null || tableElement === void 0 ? void 0 : tableElement.appendChild(fragment);
    }
    createItem(aData, index) {
      const tpElement = document.querySelector("#tp-item");
      tpElement;
      const cloned = cloneTemplate(tpElement);
      const parseData = {
        index,
        candle_date_time_kst: aData.candle_date_time_kst.replace("T", " "),
        opening_price: aData.opening_price.toLocaleString(),
        trade_price: aData.trade_price.toLocaleString(),
        condition: aData.condition,
        action: aData.action,
        daily_volatility: aData.daily_volatility && aData.daily_volatility,
        volatility: aData.volatility && aData.volatility || "",
        order_price: aData.order_price && aData.order_price.toLocaleString() || "",
        profit: aData.profit && Math.round(aData.profit).toLocaleString(),
        sumProfit: aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
        sumPrice: aData.sumPrice && Math.round(aData.sumPrice).toLocaleString()
      };
      updateElementsTextWithData(parseData, cloned);
      cloned.dataset.action = aData.action;
      return cloned;
    }
  };

  // dev/scripts/pages/backtest2/index.js
  customElements.define("app-backtest2", AppBacktest2);
})();
//# sourceMappingURL=index.js.map
