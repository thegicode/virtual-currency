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
      this.period = 200;
      this.investmentPrice = 2e5;
      this.fee = 139e-5;
      this.allSumPrice = 0;
      this.allSumSize = 0;
      this.periodInput = this.querySelector("input[name=period]");
      this.onChangeMarket = this.onChangeMarket.bind(this);
      this.onOptionSubmit = this.onOptionSubmit.bind(this);
    }
    connectedCallback() {
      var _a, _b;
      this.initialize();
      this.loadAndRender();
      (_a = this.querySelector("select")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", this.onChangeMarket);
      (_b = this.querySelector("form")) === null || _b === void 0 ? void 0 : _b.addEventListener("submit", this.onOptionSubmit);
    }
    initialize() {
      this.periodInput.value = this.period.toString();
      this.querySelector(".investmentPrice").textContent = this.investmentPrice.toLocaleString();
    }
    loadAndRender() {
      return __awaiter(this, void 0, void 0, function* () {
        const originData = yield this.getCandles();
        this.calculateMovingAverage(originData);
        this.checkCondition();
        this.setAction();
        this.setProfit();
        this.render();
        this.renderSummary();
      });
    }
    getCandles() {
      return __awaiter(this, void 0, void 0, function* () {
        const searchParams = new URLSearchParams({
          market: this.market,
          count: this.period.toString()
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
    checkCondition() {
      this.data = this.data.map((aData) => {
        if (!aData.moving_average_5)
          return aData;
        return Object.assign(Object.assign({}, aData), { condition: aData.trade_price > aData.moving_average_5 });
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
    setProfit() {
      let buyTradePrice = 0;
      let profit = 0;
      let rate = 0;
      let unrealize_rate = 0;
      let unrealize_profit = 0;
      let unrealize_gain = 0;
      let sumProfit = 0;
      let sumPrice = 0;
      const getRate = (aData) => (aData.trade_price - buyTradePrice) / buyTradePrice;
      const getProfit = (aData) => getRate(aData) * getSumPrice();
      const getSumPrice = () => sumPrice || this.investmentPrice;
      this.data = this.data.map((aData) => {
        switch (aData.action) {
          case "Buy":
            buyTradePrice = aData.trade_price;
            profit = 0;
            rate = 0;
            sumPrice = getSumPrice();
            unrealize_profit = 0;
            unrealize_gain = sumPrice;
            break;
          case "Sell":
            rate = getRate(aData);
            profit = getProfit(aData);
            sumProfit += profit;
            sumPrice = this.investmentPrice + sumProfit;
            unrealize_rate = rate;
            unrealize_profit = profit;
            unrealize_gain = sumPrice;
            break;
          case "Hold":
            unrealize_rate = getRate(aData);
            unrealize_profit = getProfit(aData);
            unrealize_gain = sumPrice + getProfit(aData);
            break;
          case "Reserve":
            profit = 0;
            rate = 0;
            sumPrice = getSumPrice();
            unrealize_rate = 0;
            unrealize_profit = 0;
            unrealize_gain = sumPrice;
            break;
        }
        return Object.assign(Object.assign({}, aData), { unrealize_rate: Number((unrealize_rate * 100).toFixed(2)), unrealize_profit: Math.round(unrealize_profit) || 0, unrealize_gain: Math.round(unrealize_gain) || 0, rate: rate * 100, profit, sumProfit: Number(sumProfit.toFixed(2)), sumPrice: Number(sumPrice.toFixed(2)) });
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
      var _a, _b;
      const tpElement = document.querySelector("#tp-item");
      tpElement;
      const cloned = cloneTemplate(tpElement);
      if (!aData.moving_average_5)
        return cloned;
      const parseData = {
        index,
        candle_date_time_kst: aData.candle_date_time_kst.replace("T", " "),
        opening_price: aData.opening_price.toLocaleString(),
        trade_price: aData.trade_price.toLocaleString(),
        moving_average_5: aData.moving_average_5 && aData.moving_average_5.toLocaleString(),
        condition: aData.condition,
        action: aData.action,
        unrealize_rate: aData.unrealize_rate,
        unrealize_profit: (_a = aData.unrealize_profit) === null || _a === void 0 ? void 0 : _a.toLocaleString(),
        unrealize_gain: (_b = aData.unrealize_gain) === null || _b === void 0 ? void 0 : _b.toLocaleString(),
        rate: aData.rate && aData.rate.toFixed(2),
        profit: aData.profit && Math.round(aData.profit).toLocaleString(),
        sumProfit: aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
        sumPrice: aData.sumPrice && Math.round(aData.sumPrice).toLocaleString()
      };
      updateElementsTextWithData(parseData, cloned);
      cloned.dataset.action = aData.action;
      return cloned;
    }
    renderSummary() {
      if (this.data.length === 0)
        return;
      const tpElement = document.querySelector("#tp-summary");
      const summaryListElement = this.querySelector(".summary-list");
      const cloned = cloneTemplate(tpElement);
      const lastProfit = this.data[this.data.length - 1].sumProfit;
      if (!lastProfit)
        return;
      const totalRate = Math.round(lastProfit / this.investmentPrice * 100);
      const summaryData = {
        market: this.market,
        period: this.period,
        totalRate: `${totalRate} %`,
        lastProfit: ` ${Math.round(lastProfit).toLocaleString()} \uC6D0`
      };
      updateElementsTextWithData(summaryData, cloned);
      summaryListElement.appendChild(cloned);
      this.allSumPrice += lastProfit;
      this.allSumSize++;
      this.renderAllSum();
      const deleteButton = cloned.querySelector(".deleteButton");
      deleteButton.addEventListener("click", () => {
        cloned.remove();
        this.allSumPrice -= lastProfit;
        this.allSumSize--;
        this.renderAllSum();
      });
    }
    renderAllSum() {
      const allSumRate = this.allSumPrice / (this.allSumSize * this.investmentPrice) * 100 || 0;
      const allSumData = {
        allSumPrice: Math.round(this.allSumPrice).toLocaleString(),
        allSumRate: allSumRate.toFixed(2).toLocaleString()
      };
      const summaryAllElement = this.querySelector(".summary-all");
      updateElementsTextWithData(allSumData, summaryAllElement);
    }
    onChangeMarket(event) {
      const target = event.target;
      this.market = target.value;
      this.loadAndRender();
    }
    onOptionSubmit(event) {
      event === null || event === void 0 ? void 0 : event.preventDefault();
      const maxSize = Number(this.periodInput.getAttribute("max"));
      this.period = Number(this.periodInput.value) > maxSize ? maxSize : Number(this.periodInput.value);
      this.periodInput.value = this.period.toString();
      this.loadAndRender();
    }
    getMinutes() {
      return __awaiter(this, void 0, void 0, function* () {
        const searchParams = new URLSearchParams({
          market: "KRW-XRP",
          unit: "30",
          to: "2024-01-11T09:00:00",
          count: "10"
        });
        const response = yield fetch(`/fetchCandlesMinutes?${searchParams}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        console.log(data);
      });
    }
  };

  // dev/scripts/pages/backtest/index.js
  customElements.define("app-backtest", AppBacktest);
})();
//# sourceMappingURL=index.js.map
