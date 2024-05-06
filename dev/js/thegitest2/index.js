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

  // dev/scripts/pages/thegitest2/AppThegiTest2.js
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
  var AppThegiTest2 = class extends HTMLElement {
    constructor() {
      super();
      this.data = [];
      this.market = "KRW-SBD";
      this.count = 100;
      this.investmentPrice = 5e4;
      this.summaryAllPrice = 0;
      this.allSumSize = 0;
      this.countElement = this.querySelector("input[name=count]");
      this.selectElement = this.querySelector("select");
      this.formElement = this.querySelector("form");
      this.onChangeMarket = this.onChangeMarket.bind(this);
      this.onOptionSubmit = this.onOptionSubmit.bind(this);
    }
    connectedCallback() {
      this.initialize();
      this.loadAndRender();
      this.selectElement.addEventListener("change", this.onChangeMarket);
      this.formElement.addEventListener("submit", this.onOptionSubmit);
    }
    disconnectedCallback() {
      this.selectElement.removeEventListener("change", this.onChangeMarket);
      this.formElement.removeEventListener("submit", this.onOptionSubmit);
    }
    initialize() {
      this.countElement.value = this.count.toString();
      this.querySelector(".investmentPrice").textContent = this.investmentPrice.toLocaleString();
    }
    loadAndRender() {
      return __awaiter(this, void 0, void 0, function* () {
        const originData = yield this.getCandles();
        this.data = this.checkCondition(originData);
        this.render();
        this.renderSummary();
      });
    }
    checkCondition(data) {
      let buyPrice = 0;
      let amount = 0;
      let rate = 0;
      let quantity = 0;
      let sellPrice = 0;
      let profit = 0;
      let sumProfit = 0;
      let action = "";
      const newData = data.map((aData, index) => {
        if (buyPrice === 0) {
          amount = this.investmentPrice;
          action = "Buy";
          buyPrice = aData.opening_price;
          quantity = amount / aData.opening_price;
        } else {
          const highRate = (aData.high_price - buyPrice) / buyPrice;
          const lowRate = (aData.low_price - buyPrice) / buyPrice;
          if (lowRate <= -0.2) {
            action = "AddBuy";
            const thisQuantity = amount / aData.opening_price;
            const newquantity = quantity + thisQuantity;
            buyPrice = (buyPrice * quantity + aData.opening_price * thisQuantity) / newquantity;
            quantity = newquantity;
            amount = amount * 2;
            rate = lowRate;
          } else if (highRate >= 0.1) {
            action = "Sell";
            sellPrice = aData.opening_price;
            profit = highRate * amount;
            sumProfit += profit;
            buyPrice = 0;
            rate = highRate;
          } else {
            action = "Hold";
          }
        }
        return {
          date: aData.candle_date_time_kst,
          opening_price: aData.opening_price,
          action,
          buyPrice,
          sellPrice,
          rate,
          amount,
          profit,
          sumProfit
        };
      });
      return newData;
    }
    setTradingAction() {
      this.data = this.data.map((aData, index) => {
        let tradingAction = "";
        if (index === 0) {
          tradingAction = aData.condition ? "Buy" : "Reserve";
        } else {
          const prevCondition = this.data[index - 1].condition;
          if (prevCondition !== aData.condition) {
            tradingAction = aData.condition ? "Buy" : "Sell";
          } else {
            tradingAction = aData.condition ? "Hold" : "Reserve";
          }
        }
        return Object.assign(Object.assign({}, aData), { tradingAction });
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
      this.data = this.data.map((aData, index) => {
        switch (aData.tradingAction) {
          case "Buy":
            buyTradePrice = aData.trade_price;
            profit = 0;
            rate = 0;
            sumPrice = getSumPrice();
            unrealize_rate = 0;
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
        candle_date_time_kst: aData.date,
        opening_price: aData.opening_price.toLocaleString(),
        action: aData.action,
        buyPrice: aData.action === "Hold" || aData.action === "Sell" ? "" : Math.round(aData.buyPrice).toLocaleString(),
        sellPrice: aData.action === "Sell" ? aData.sellPrice.toLocaleString() : "",
        rate: aData.action === "Sell" ? aData.rate && (aData.rate * 100).toFixed(2) : "",
        amount: aData.action === "Buy" || aData.action === "AddBuy" ? aData.amount && aData.amount.toLocaleString() : "",
        profit: aData.action === "Sell" ? aData.profit && Math.round(aData.profit).toLocaleString() : "",
        sumProfit: aData.sumProfit && Math.round(aData.sumProfit).toLocaleString()
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
      const deleteButton = cloned.querySelector(".deleteButton");
      const lastData = this.data[this.data.length - 1];
      const lastProfit = lastData.sumProfit;
      if (lastProfit === void 0)
        return;
      const totalRate = lastProfit / this.investmentPrice * 100;
      const unrealizeAllRate = lastData.unrealize_gain && (lastData.unrealize_gain - this.investmentPrice) / this.investmentPrice * 100;
      const lastRate = lastData.sumProfit / this.investmentPrice * 100;
      const summaryData = {
        market: this.market,
        period: this.count,
        totalRate: `${totalRate.toFixed(2)} %`,
        lastProfit: ` ${Math.round(lastProfit).toLocaleString()} \uC6D0`,
        unrealizeAllRate: `${lastRate.toFixed(2)} %`
      };
      updateElementsTextWithData(summaryData, cloned);
      summaryListElement.appendChild(cloned);
      this.summaryAllPrice += lastProfit;
      this.allSumSize++;
      this.renderAllSum();
      deleteButton.addEventListener("click", () => {
        cloned.remove();
        this.summaryAllPrice -= lastProfit;
        this.allSumSize--;
        this.renderAllSum();
      });
    }
    renderAllSum() {
      const summaryAllElement = this.querySelector(".summary-all");
      const summaryAllRate = this.summaryAllPrice / (this.allSumSize * this.investmentPrice) * 100 || 0;
      const allSumData = {
        summaryAllPrice: Math.round(this.summaryAllPrice).toLocaleString(),
        summaryAllRate: summaryAllRate.toFixed(2).toLocaleString()
      };
      updateElementsTextWithData(allSumData, summaryAllElement);
    }
    onChangeMarket(event) {
      const target = event.target;
      this.market = target.value;
      this.loadAndRender();
    }
    onOptionSubmit(event) {
      event === null || event === void 0 ? void 0 : event.preventDefault();
      const maxSize = Number(this.countElement.getAttribute("max"));
      this.count = Number(this.countElement.value) > maxSize ? maxSize : Number(this.countElement.value);
      this.countElement.value = this.count.toString();
      this.loadAndRender();
    }
  };

  // dev/scripts/pages/thegitest2/index.js
  customElements.define("thegi-backtest2", AppThegiTest2);
})();
//# sourceMappingURL=index.js.map
