"use strict";
(() => {
  // app/scripts/components/backtest/movingAverage.ts
  function setMovingAverage(data, period = 5) {
    const result = data.map((aData, index) => {
      if (index < period - 1) {
        return aData;
      }
      const average = calculateMovingAverage(data, index, period);
      return {
        ...aData,
        [`moving_average_${period}`]: average
      };
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
      this.market = "";
      this.count = 30;
      this.marketSize = 5;
      this.totalInvestmentPrice = 1e6;
      this.investmentPrice = this.totalInvestmentPrice / this.marketSize;
      this.summaryAllPrice = 0;
      this.allSumSize = 0;
      this.target = 2;
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
      this.market = this.selectElement.value;
      this.countElement.value = this.count.toString();
      this.querySelector(".investmentPrice").textContent = this.investmentPrice.toLocaleString();
    }
    loadAndRender() {
      return __awaiter(this, void 0, void 0, function* () {
        const originData = yield this.getCandles();
        const avreagedData = this.movingAverages(originData);
        const conditiondData = this.checkCondition(avreagedData);
        const actionedData = this.setTradingAction(conditiondData);
        const volatedData = this.setVolatility(actionedData);
        const orderedData = this.order(volatedData);
        const profitedData = this.setProfit(orderedData);
        this.data = profitedData.slice(19);
        this.render();
        this.renderSummary();
      });
    }
    getCandles() {
      return __awaiter(this, void 0, void 0, function* () {
        const searchParams = new URLSearchParams({
          market: this.market,
          count: (this.count + 19).toString()
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
      data = setMovingAverage(data, 5);
      data = setMovingAverage(data, 10);
      data = setMovingAverage(data, 20);
      return data;
    }
    checkCondition(dataList) {
      return dataList.map((aData, index) => {
        const bData = JSON.parse(JSON.stringify(aData));
        if (aData.trade_price > bData.moving_average_3 && bData.trade_price > bData.moving_average_5 && bData.trade_price > bData.moving_average_10 && bData.trade_price > bData.moving_average_20)
          bData.condition = true;
        else
          bData.condition = false;
        return Object.assign({}, bData);
      });
    }
    setTradingAction(dataList) {
      return dataList.map((aData, index) => {
        const bData = JSON.parse(JSON.stringify(aData));
        let tradingAction = "";
        if (index === 0) {
          tradingAction = bData.condition ? "Buy" : "Reserve";
        } else {
          const prevCondition = dataList[index - 1].condition;
          if (prevCondition !== bData.condition) {
            tradingAction = bData.condition ? "Buy" : "Sell";
          } else {
            tradingAction = bData.condition ? "Hold" : "Reserve";
          }
        }
        return Object.assign(Object.assign({}, bData), { tradingAction });
      });
    }
    setVolatility(dataList) {
      const dailyData = dataList.map((aData) => {
        return Object.assign(Object.assign({}, aData), { daily_volatility: getDaliyVolatility(aData) });
      });
      const result = dailyData.map((aData, index) => {
        const volatility = getVolatility(dailyData, aData, index);
        return Object.assign(Object.assign({}, aData), { volatility });
      });
      return result;
    }
    order(dataList) {
      return dataList.map((aData) => {
        if (!aData.volatility)
          return Object.assign({}, aData);
        if (aData.tradingAction === "Buy") {
          const percent = this.target / aData.volatility * 100;
          const unitPercent = percent / this.marketSize;
          const result = this.totalInvestmentPrice * unitPercent / 100;
          return Object.assign(Object.assign({}, aData), { order_price: Math.round(result) });
        } else
          return Object.assign({}, aData);
      });
    }
    setProfit(dataList) {
      let buyTradePrice = 0;
      let orderPrice = 0;
      let profit = 0;
      let rate = 0;
      let unrealize_rate = 0;
      let unrealize_gain = 0;
      let unrealize_profit = 0;
      let sumProfit = 0;
      let sumPrice = this.investmentPrice;
      const getRate = (aData) => (aData.trade_price - buyTradePrice) / buyTradePrice;
      const getProfit = (aData) => orderPrice * getRate(aData);
      const getSumPrice = () => this.investmentPrice + sumProfit;
      return dataList.map((oneData) => {
        const aData = JSON.parse(JSON.stringify(oneData));
        switch (aData.tradingAction) {
          case "Buy":
            buyTradePrice = aData.trade_price;
            if (aData.order_price)
              orderPrice = aData.order_price;
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
            sumPrice = getSumPrice();
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
        return Object.assign(Object.assign({}, aData), { profit, rate: rate * 100, unrealize_rate: Number((unrealize_rate * 100).toFixed(2)), unrealize_profit: Math.round(unrealize_profit) || 0, unrealize_gain: Math.round(unrealize_gain), sumProfit: Number(sumProfit.toFixed(2)), sumPrice: Number(sumPrice.toFixed(2)) });
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
      const parseData = {
        index,
        candle_date_time_kst: aData.candle_date_time_kst.replace("T", " "),
        opening_price: aData.opening_price.toLocaleString(),
        trade_price: aData.trade_price.toLocaleString(),
        condition: aData.condition,
        tradingAction: aData.tradingAction,
        volatility: aData.volatility && aData.volatility || "",
        order_price: aData.order_price && aData.order_price.toLocaleString() || "",
        unrealize_rate: aData.unrealize_rate,
        unrealize_profit: (_a = aData.unrealize_profit) === null || _a === void 0 ? void 0 : _a.toLocaleString(),
        unrealize_gain: (_b = aData.unrealize_gain) === null || _b === void 0 ? void 0 : _b.toLocaleString(),
        profit: aData.profit && Math.round(aData.profit).toLocaleString(),
        rate: aData.rate && aData.rate.toFixed(2),
        sumProfit: aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
        sumPrice: aData.sumPrice && Math.round(aData.sumPrice).toLocaleString()
      };
      updateElementsTextWithData(parseData, cloned);
      cloned.dataset.action = aData.tradingAction;
      return cloned;
    }
    renderSummary() {
      if (this.data.length === 0)
        return;
      const tpElement = document.querySelector("#tp-summary");
      const summaryListElement = this.querySelector(".summary-list");
      const cloned = cloneTemplate(tpElement);
      const deleteButton = cloned.querySelector(".deleteButton");
      const lastProfit = this.data[this.data.length - 1].sumProfit;
      if (lastProfit === void 0)
        return;
      const totalRate = lastProfit / this.investmentPrice * 100;
      const summaryData = {
        market: this.market,
        period: this.count,
        totalRate: `${totalRate.toFixed(2)} %`,
        lastProfit: ` ${Math.round(lastProfit).toLocaleString()} \uC6D0`
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

  // dev/scripts/pages/backtest2/index.js
  customElements.define("app-backtest2", AppBacktest2);
})();
//# sourceMappingURL=index.js.map
