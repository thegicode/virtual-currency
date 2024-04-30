"use strict";
(() => {
  // app/scripts/components/backtest/volatility.ts
  function getDaliyVolatility(aData) {
    const result = (aData.high_price - aData.low_price) / aData.opening_price * 100;
    return Number(result.toFixed(2));
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

  // dev/scripts/pages/backtest4/AppBacktest4.js
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
  var AppBacktest4 = class extends HTMLElement {
    constructor() {
      super();
      this.data = [];
      this.tradeData = [];
      this.market = "KRW-ONG";
      this.count = 30;
      this.marketSize = 5;
      this.totalInvestmentPrice = 1e6;
      this.investmentPrice = this.totalInvestmentPrice / this.marketSize;
      this.target = 2;
      this.countElement = this.querySelector("input[name=count]");
      this.tableElement = this.querySelector("tbody");
      this.itemTempleteElement = document.querySelector("#tp-item");
      this.selectElement = this.querySelector("select");
      this.formElement = this.querySelector("form");
      this.overviewCustomElement = this.querySelector("backtest-overview");
      this.onChangeMarket = this.onChangeMarket.bind(this);
      this.onOptionSubmit = this.onOptionSubmit.bind(this);
    }
    connectedCallback() {
      this.initialize();
      this.runBackTest();
      this.selectElement.addEventListener("change", this.onChangeMarket);
      this.formElement.addEventListener("submit", this.onOptionSubmit);
    }
    disconnectedCallback() {
      this.selectElement.removeEventListener("change", this.onChangeMarket);
      this.formElement.removeEventListener("submit", this.onOptionSubmit);
    }
    initialize() {
      const investmentPriceElement = this.querySelector(".investmentPrice");
      this.countElement.value = this.count.toString();
      investmentPriceElement.textContent = this.investmentPrice.toLocaleString();
    }
    runBackTest() {
      return __awaiter(this, void 0, void 0, function* () {
        this.dataset.loading = "true";
        this.data = [];
        this.tradeData = [];
        for (let index = 0; index < this.count; index++) {
          console.log(index);
          try {
            const toDate = `${this.getToDate(index)}+09:00`;
            const fetchedData = yield this.fetchData("60", "37", toDate);
            this.data.push(fetchedData);
            const makedData = this.makeTradeData(fetchedData);
            const actionedData = this.setTradingAction(makedData, index);
            const volatedData = this.setVolatility(actionedData);
            const orderedData = this.order(volatedData);
            const profitedData = this.setProfit(orderedData, index);
            this.tradeData.push(profitedData);
            yield this.delay(90);
          } catch (error) {
            console.error(`Failed to process index ${index}:`, error.message);
          }
        }
        this.render();
        this.overviewCustomElement.redner(this);
        this.dataset.loading = "false";
      });
    }
    delay(duration) {
      return new Promise((resolve) => setTimeout(resolve, duration));
    }
    fetchData(unit, fetchCount, to) {
      return __awaiter(this, void 0, void 0, function* () {
        const searchParams = new URLSearchParams({
          market: this.market,
          count: fetchCount,
          unit,
          to
        });
        const response = yield fetch(`/fetchCandlesMinutes?${searchParams}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return yield response.json();
      });
    }
    getToDate(index) {
      const now = /* @__PURE__ */ new Date();
      now.setMonth(now.getMonth());
      now.setDate(now.getDate() - this.count + index);
      now.setHours(22, 0, 0, 0);
      return now.toISOString().slice(0, 19);
    }
    makeTradeData(data) {
      const lastData = data[24];
      const date = lastData.candle_date_time_kst.slice(0, 10);
      const prevDayData = {
        morning: [data[0], data[12]],
        afternoon: [data[12], lastData]
      };
      const startPrice = prevDayData.afternoon[0].trade_price;
      const afternoonRate = (prevDayData.afternoon[1].trade_price - startPrice) / startPrice;
      const moringVolume = prevDayData.morning[1].candle_acc_trade_volume - prevDayData.morning[0].candle_acc_trade_volume;
      const afterVolume = prevDayData.afternoon[1].candle_acc_trade_volume - prevDayData.afternoon[0].candle_acc_trade_volume;
      const condition = afternoonRate > 0 && afterVolume > moringVolume;
      const afternoonData = this.getAfternoonData(data.slice(12));
      return {
        date,
        condition,
        afternoonData,
        trade_price: lastData.trade_price,
        trade_sell_date: data[data.length - 1]
      };
    }
    getAfternoonData(data) {
      const highPrices = data.map((d) => d.high_price);
      const lowPrices = data.map((d) => d.low_price);
      return {
        high_price: Math.max(...highPrices),
        low_price: Math.min(...lowPrices),
        opening_price: data[0].opening_price
      };
    }
    setTradingAction(aData, index) {
      let action = "";
      if (index === 0) {
        action = aData.condition ? "Buy" : "Reserve";
      } else {
        if (this.tradeData[index - 1].condition === aData.condition) {
          action = aData.condition ? "Hold" : "Reserve";
        } else {
          action = aData.condition ? "Buy" : "Sell";
        }
      }
      return Object.assign(Object.assign({}, JSON.parse(JSON.stringify(aData))), { action });
    }
    setVolatility(data) {
      return Object.assign(Object.assign({}, JSON.parse(JSON.stringify(data))), { volatility: getDaliyVolatility(data.afternoonData) });
    }
    order(data) {
      const parseData = JSON.parse(JSON.stringify(data));
      if (!data.volatility)
        return parseData;
      if (data.action === "Buy") {
        const percent = this.target / data.volatility * 100;
        const unitPercent = percent / this.marketSize;
        const orderAmount = this.totalInvestmentPrice * unitPercent / 100;
        return Object.assign(Object.assign({}, parseData), { order_amount: Math.round(orderAmount) });
      }
      return parseData;
    }
    setProfit(data, index) {
      const aData = JSON.parse(JSON.stringify(data));
      const prevTradeData = index > 0 && this.tradeData[index - 1];
      const buyData = index > 0 && this.tradeData[prevTradeData.buy_index];
      switch (aData.action) {
        case "Buy":
          return Object.assign(Object.assign({}, aData), { buy_index: index, sumProfit: prevTradeData.sumProfit || 0, unrealize_sum: prevTradeData.unrealize_sum || 0 });
        case "Hold":
          const unrealize_rate = (aData.trade_price - buyData.trade_price) / buyData.trade_price;
          const unrealize_profit = unrealize_rate * buyData.order_amount;
          return Object.assign(Object.assign({}, aData), {
            buy_index: prevTradeData.buy_index,
            sumProfit: prevTradeData.sumProfit || 0,
            unrealize_rate,
            unrealize_profit,
            unrealize_sum: prevTradeData.unrealize_sum + unrealize_profit
          });
        case "Sell":
          const rate = (aData.trade_sell_date.trade_price - buyData.trade_price) / buyData.trade_price;
          const profit = rate * buyData.order_amount;
          const sumProfit = prevTradeData.sumProfit + profit;
          return Object.assign(Object.assign({}, aData), {
            rate,
            profit,
            sumProfit,
            unrealize_sum: sumProfit
          });
        case "Reserve": {
          return Object.assign(Object.assign({}, aData), { sumProfit: prevTradeData.sumProfit || 0, unrealize_sum: prevTradeData.unrealize_sum || 0 });
        }
      }
    }
    render() {
      this.tableElement.innerHTML = "";
      const fragment = new DocumentFragment();
      this.tradeData.map((aData, index) => this.createItem(aData, index)).forEach((cloned) => fragment.appendChild(cloned));
      this.tableElement.appendChild(fragment);
    }
    createItem(aData, index) {
      var _a, _b, _c;
      const cloned = cloneTemplate(this.itemTempleteElement);
      const parseData = {
        index,
        date: aData.date,
        trade_price: aData.trade_price.toLocaleString(),
        condition: aData.condition.toString(),
        action: aData.action,
        volatility: (_a = aData.volatility) === null || _a === void 0 ? void 0 : _a.toFixed(2),
        order_amount: ((_b = aData.order_amount) === null || _b === void 0 ? void 0 : _b.toLocaleString()) || "",
        rate: ((_c = aData.rate && aData.rate * 100) === null || _c === void 0 ? void 0 : _c.toFixed(2)) || "",
        profit: aData.profit && Math.round(aData.profit).toLocaleString() || "",
        sumProfit: aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
        unrealize_rate: aData.unrealize_rate && (aData.unrealize_rate * 100).toFixed(2) || "",
        unrealize_profit: aData.unrealize_profit && Math.round(aData.unrealize_profit).toLocaleString() || "",
        unrealize_sum: aData.unrealize_sum && Math.round(aData.unrealize_sum).toLocaleString()
      };
      updateElementsTextWithData(parseData, cloned);
      cloned.dataset.action = aData.action;
      return cloned;
    }
    onChangeMarket(event) {
      const target = event.target;
      this.market = target.value;
      this.runBackTest();
    }
    onOptionSubmit(event) {
      event === null || event === void 0 ? void 0 : event.preventDefault();
      const maxSize = Number(this.countElement.getAttribute("max"));
      this.count = Number(this.countElement.value) > maxSize ? maxSize : Number(this.countElement.value);
      this.countElement.value = this.count.toString();
      this.runBackTest();
    }
  };

  // dev/scripts/pages/backtest4/Overview.js
  var Overview = class extends HTMLElement {
    constructor() {
      super();
      this.app = null;
      this.totalProfit = 0;
      this.totalSumPrice = 0;
      this.allSumSize = 0;
      this.sumElement = this.querySelector(".overview-sum");
      this.listElement = this.querySelector(".overview-list");
      this.itemTemplate = document.querySelector("#tp-overviewItem");
    }
    connectedCallback() {
    }
    redner(app) {
      this.app = app;
      this.renderList();
      this.renderSum(true);
    }
    renderList() {
      if (!this.app)
        return;
      const totalProfit = this.app.tradeData[this.app.tradeData.length - 1].unrealize_sum;
      const totalRate = totalProfit / this.app.investmentPrice * 100;
      const renderData = {
        market: this.app.market,
        period: this.app.count,
        totalRate: `${totalRate.toFixed(2)}%`,
        totalProfit: ` ${Math.round(totalProfit).toLocaleString()} \uC6D0`
      };
      const cloned = cloneTemplate(this.itemTemplate);
      updateElementsTextWithData(renderData, cloned);
      this.listElement.appendChild(cloned);
      this.addEvent(cloned);
      this.totalProfit = totalProfit;
    }
    addEvent(cloned) {
      const deleteButton = cloned.querySelector(".deleteButton");
      deleteButton.addEventListener("click", () => {
        cloned.remove();
        this.renderSum(false);
      });
    }
    renderSum(isAdd) {
      if (!this.app)
        return;
      if (isAdd) {
        this.totalSumPrice += this.totalProfit;
        this.allSumSize++;
      } else {
        this.totalSumPrice -= this.totalProfit;
        this.allSumSize--;
      }
      const totalSumRate = this.totalSumPrice / (this.app.investmentPrice * this.allSumSize) * 100;
      const renderData = {
        totalSumPrice: Math.round(this.totalSumPrice).toLocaleString(),
        totalSumRate: totalSumRate.toFixed(2).toLocaleString()
      };
      updateElementsTextWithData(renderData, this.sumElement);
    }
  };

  // dev/scripts/pages/backtest4/index.js
  customElements.define("app-backtest4", AppBacktest4);
  customElements.define("backtest-overview", Overview);
})();
//# sourceMappingURL=index.js.map
