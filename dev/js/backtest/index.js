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

  // dev/scripts/pages/backtest/AppBacktest.js
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
  var AppBacktest = class extends HTMLElement {
    constructor() {
      super();
      this.data = [];
      this.market = "KRW-BTC";
      this.onChangeMarket = this.onChangeMarket.bind(this);
    }
    connectedCallback() {
      var _a;
      this.loadAndRender();
      (_a = this.querySelector("select")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", this.onChangeMarket);
    }
    onChangeMarket(event) {
      const target = event.target;
      this.market = target.value;
      this.loadAndRender();
    }
    loadAndRender() {
      return __awaiter(this, void 0, void 0, function* () {
        const originData = yield this.getCandles();
        this.calculateMovingAverage(originData);
        this.enrichingData();
        this.render();
      });
    }
    getCandles() {
      return __awaiter(this, void 0, void 0, function* () {
        const searchParams = new URLSearchParams({
          market: this.market,
          count: "1000"
        });
        const response = yield fetch(`/fetchCandles?${searchParams}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return yield response.json();
      });
    }
    calculateMovingAverage(originData, period = 5) {
      this.data = originData.slice(period - 1).map((aData, index) => {
        let sum = 0;
        for (let i = 0; i < period; i++) {
          sum += originData[index + i].trade_price;
        }
        return Object.assign(Object.assign({}, aData), { moving_average_5: sum / period });
      });
    }
    enrichingData() {
      this.data = this.data.map((aData) => {
        if (!aData.moving_average_5)
          return aData;
        return Object.assign(Object.assign({}, aData), { condition: aData.moving_average_5 > aData.trade_price });
      });
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
            action = "none";
          }
        }
        return Object.assign(Object.assign({}, aData), { action });
      });
      const investmentAmount = 2e5;
      let orderPrice = 0;
      let profit = 0;
      let totalProfit = 0;
      let total = 0;
      this.data = this.data.map((aData) => {
        switch (aData.action) {
          case "Buy":
            orderPrice = aData.trade_price;
            profit = 0;
            total = total || investmentAmount;
            break;
          case "Sell":
            const rate = (aData.trade_price - orderPrice) / orderPrice;
            profit = rate * total || investmentAmount;
            totalProfit += profit;
            total = investmentAmount + totalProfit;
            break;
          case "none":
            profit = 0;
            break;
        }
        return Object.assign(Object.assign({}, aData), {
          profit,
          totalProfit,
          total
        });
      });
    }
    render() {
      return __awaiter(this, void 0, void 0, function* () {
        const tableElement = this.querySelector("tbody");
        const summaryElement = this.querySelector(".summary");
        tableElement.innerHTML = "";
        const fragment = new DocumentFragment();
        this.data.map((aData) => this.createItem(aData)).forEach((cloned) => fragment.appendChild(cloned));
        tableElement === null || tableElement === void 0 ? void 0 : tableElement.appendChild(fragment);
        const lastProfit = this.data[this.data.length - 1].totalProfit;
        if (!lastProfit)
          return;
        const totalRate = Math.round(lastProfit / 2e5 * 100);
        summaryElement.textContent = `${this.market} | ${totalRate}% | ${Math.round(lastProfit).toLocaleString()}`;
      });
    }
    createItem(aData) {
      const tpElement = document.querySelector("#tp-item");
      tpElement;
      const cloned = cloneTemplate(tpElement);
      if (!aData.moving_average_5)
        return cloned;
      const parseData = Object.assign(Object.assign({}, aData), { candle_date_time_kst: aData.candle_date_time_kst.replace("T", " "), opening_price: aData.opening_price.toLocaleString(), trade_price: aData.trade_price.toLocaleString(), moving_average_5: aData.moving_average_5 && aData.moving_average_5.toLocaleString(), profit: aData.profit && Math.round(aData.profit).toLocaleString(), totalProfit: aData.totalProfit && Math.round(aData.totalProfit).toLocaleString(), total: aData.total && Math.round(aData.total).toLocaleString() });
      updateElementsTextWithData(parseData, cloned);
      return cloned;
    }
  };

  // dev/scripts/pages/backtest/index.js
  customElements.define("app-backtest", AppBacktest);
})();
//# sourceMappingURL=index.js.map
