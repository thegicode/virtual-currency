"use strict";
(() => {
  // app/scripts/components/backtest/volatility.ts
  function getDaliyVolatility(aData) {
    const result = (aData.high_price - aData.low_price) / aData.opening_price * 100;
    return Number(result.toFixed(2));
  }

  // dev/scripts/pages/backtest4/TradeStrategy.js
  var TradeStrategy = class {
    constructor(app, data, index) {
      this.app = app;
      this.data = data;
      this.index = index;
    }
    get buy_index() {
      return this.index > 0 ? this.prevData.buy_index : null;
    }
    get prevData() {
      return this.index > 0 ? this.app.tradeData[this.index - 1] : null;
    }
    get buyData() {
      return this.index > 0 && this.prevData && typeof this.prevData.buy_index === "number" ? this.app.tradeData[this.prevData.buy_index] : null;
    }
    get orderAmount() {
      if (!this.buyData.volatility)
        return 0;
      const percent = this.app.target / this.buyData.volatility * 100;
      const unitPercent = percent / this.app.marketSize;
      return this.app.totalInvestmentPrice * unitPercent / 100;
    }
    get rate() {
      return 0;
    }
    get profit() {
      return 0;
    }
    get sum_profit() {
      return this.prevData ? this.prevData.sum_profit : 0;
    }
    get unrealize_rate() {
      return 0;
    }
    get unrealize_profit() {
      return 0;
    }
    get unrealize_sum() {
      return this.prevData ? this.prevData.unrealize_sum : 0;
    }
  };
  var BuyStrategy = class extends TradeStrategy {
    constructor(app, data, index) {
      super(app, data, index);
    }
    get buy_index() {
      return this.index;
    }
    get unrealize_sum() {
      if (!this.prevData)
        return 0;
      return this.prevData.unrealize_sum ? this.prevData.unrealize_sum : 0;
    }
    get orderAmount() {
      if (!this.data.volatility || this.data.volatility === 0)
        return 0;
      const percent = this.app.target / this.data.volatility * 100;
      const unitPercent = percent / this.app.marketSize;
      return this.app.totalInvestmentPrice * unitPercent / 100;
    }
  };
  var HoldStrategy = class extends TradeStrategy {
    constructor(app, data, index) {
      super(app, data, index);
    }
    get unrealize_rate() {
      return (this.data.trade_price - this.buyData.trade_price) / this.buyData.trade_price;
    }
    get unrealize_profit() {
      return this.unrealize_rate * this.orderAmount;
    }
    get unrealize_sum() {
      return this.prevData.unrealize_sum ? this.prevData.unrealize_sum + this.unrealize_profit : 0;
    }
  };
  var SellStrategy = class extends TradeStrategy {
    constructor(app, data, index, sellPrice) {
      super(app, data, index);
      this.sellPrice = sellPrice;
    }
    get rate() {
      return (this.sellPrice - this.buyData.trade_price) / this.buyData.trade_price;
    }
    get profit() {
      return this.rate * this.orderAmount;
    }
    get sum_profit() {
      return (this.prevData.sum_profit || 0) + this.profit;
    }
    get unrealize_sum() {
      return this.sum_profit;
    }
  };
  var ReserveStrategy = class extends TradeStrategy {
    constructor(app, data, index) {
      super(app, data, index);
    }
  };

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
      this.tradeData = [];
      this.market = "";
      this.count = 30;
      this.marketSize = 5;
      this.totalInvestmentPrice = 1e6;
      this.investmentPrice = this.totalInvestmentPrice / this.marketSize;
      this.target = 2;
      this.overviewCustomElement = this.querySelector("backtest-overview");
      this.controlCustomElement = this.querySelector("backtest-control");
      this.tableCustomElement = this.querySelector("backtest-table");
    }
    connectedCallback() {
      this.initialize();
      this.runBackTest();
    }
    initialize() {
      this.controlCustomElement.initialize();
    }
    runBackTest() {
      return __awaiter(this, void 0, void 0, function* () {
        this.reset();
        for (let index = 0; index < this.count; index++) {
          try {
            const tradeData = yield this.getTradeData(index);
            this.tradeData.push(tradeData);
            yield this.delay(100);
          } catch (error) {
            console.error(`Failed to process index ${index}:`, error.message);
          }
        }
        this.render();
      });
    }
    getTradeData(index) {
      return __awaiter(this, void 0, void 0, function* () {
        const toDate = `${this.getToDate(index)}+09:00`;
        const fetchedData = yield this.fetchData("60", "37", toDate);
        const { makedData, afternoonData, sellPrice } = this.makeTradeData(fetchedData, toDate);
        const actionedData = this.setTradingAction(makedData, index);
        const volatedData = this.setVolatility(actionedData, afternoonData);
        const enrichedData = this.getStrategy(volatedData, index, sellPrice);
        return enrichedData;
      });
    }
    reset() {
      this.dataset.loading = "true";
      this.tradeData = [];
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
      now.setDate(now.getDate() - this.count + index + 1);
      now.setHours(22, 0, 0, 0);
      return now.toISOString().slice(0, 19);
    }
    makeTradeData(data, date) {
      const dates = data.map((d) => d.candle_date_time_kst);
      const prevDate = new Date(date);
      prevDate.setUTCDate(prevDate.getUTCDate() - 1);
      const prevDateISOString = prevDate.toISOString().slice(0, 10);
      const prevFirstIndex = dates.indexOf(prevDateISOString + "T00:00:00");
      const prevMidIndex = dates.indexOf(prevDateISOString + "T12:00:00");
      const prevLastIndex = dates.indexOf(date.slice(0, 11) + "00:00:00");
      const prevDayData = {
        morning: [data[prevFirstIndex], data[prevMidIndex]],
        afternoon: [data[prevMidIndex], data[prevLastIndex]]
      };
      const startPrice = prevDayData.afternoon[0].trade_price;
      const afternoonRate = (prevDayData.afternoon[1].trade_price - startPrice) / startPrice;
      const moringVolume = prevDayData.morning[1].candle_acc_trade_volume - prevDayData.morning[0].candle_acc_trade_volume;
      const afterVolume = prevDayData.afternoon[1].candle_acc_trade_volume - prevDayData.afternoon[0].candle_acc_trade_volume;
      const condition = afternoonRate > 0 && afterVolume > moringVolume;
      const makedData = {
        date: date.slice(0, 10),
        condition,
        trade_price: data[prevLastIndex].trade_price
      };
      return {
        makedData,
        afternoonData: this.getAfternoonData(data.slice(12)),
        sellPrice: data[data.length - 1].trade_price
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
    setVolatility(data, afternoonData) {
      return Object.assign(Object.assign({}, JSON.parse(JSON.stringify(data))), { volatility: getDaliyVolatility(afternoonData) });
    }
    getStrategy(data, index, sellPrice) {
      const result = this.tradeStrategy(data, index, sellPrice);
      return Object.assign(Object.assign({}, data), { buy_index: result.buy_index, order_amount: data.action === "Buy" && result.orderAmount || "", rate: result.rate, profit: result.profit, sum_profit: result.sum_profit, unrealize_rate: result.unrealize_rate, unrealize_profit: result.unrealize_profit, unrealize_sum: result.unrealize_sum });
    }
    tradeStrategy(data, index, sellPrice) {
      switch (data.action) {
        case "Buy":
          return new BuyStrategy(this, data, index);
        case "Hold":
          return new HoldStrategy(this, data, index);
        case "Sell":
          return new SellStrategy(this, data, index, sellPrice);
        case "Reserve":
          return new ReserveStrategy(this, data, index);
        default:
          throw new Error(`\uC54C \uC218 \uC5C6\uB294 \uC7A5\uB974: ${data.action}`);
      }
    }
    render() {
      this.tableCustomElement.render();
      this.overviewCustomElement.redner();
      this.dataset.loading = "false";
    }
  };

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

  // dev/scripts/pages/backtest4/Overview.js
  var Overview = class extends HTMLElement {
    constructor() {
      super();
      this.app = document.querySelector("app-backtest4");
      this.totalProfit = 0;
      this.totalSumPrice = 0;
      this.size = 0;
      this.sumElement = this.querySelector(".overview-sum");
      this.listElement = this.querySelector(".overview-list");
      this.itemTemplate = document.querySelector("#tp-overviewItem");
    }
    connectedCallback() {
    }
    redner() {
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
      cloned.dataset.value = totalProfit;
      updateElementsTextWithData(renderData, cloned);
      this.listElement.appendChild(cloned);
      this.addEvent(cloned);
      this.totalProfit = totalProfit;
    }
    addEvent(cloned) {
      const deleteButton = cloned.querySelector(".deleteButton");
      deleteButton.addEventListener("click", () => {
        const profit = Number(cloned.dataset.value);
        cloned.remove();
        this.renderSum(false, profit);
      });
    }
    renderSum(isAdd, profit) {
      if (!this.app)
        return;
      if (isAdd) {
        this.totalSumPrice += this.totalProfit;
        this.size++;
      } else {
        if (!profit)
          return;
        this.totalSumPrice -= profit;
        this.size--;
      }
      const totalSumRate = this.totalSumPrice === 0 ? 0 : this.totalSumPrice / (this.app.investmentPrice * this.size) * 100;
      const renderData = {
        totalSumPrice: Math.round(this.totalSumPrice).toLocaleString(),
        totalSumRate: totalSumRate.toFixed(2).toLocaleString()
      };
      updateElementsTextWithData(renderData, this.sumElement);
    }
  };

  // dev/scripts/pages/backtest4/Control.js
  var Control = class extends HTMLElement {
    constructor() {
      super();
      this.app = document.querySelector("app-backtest4");
      this.formElement = this.querySelector("form");
      this.selectElement = this.querySelector("select");
      this.countElement = this.querySelector("input[name=count]");
      this.investmentPriceElement = this.querySelector(".investmentPrice");
      this.onSubmit = this.onSubmit.bind(this);
      this.onChange = this.onChange.bind(this);
    }
    connectedCallback() {
      this.formElement.addEventListener("submit", this.onSubmit);
      this.selectElement.addEventListener("change", this.onChange);
    }
    disconnectedCallback() {
      this.formElement.removeEventListener("submit", this.onSubmit);
      this.selectElement.removeEventListener("change", this.onChange);
    }
    initialize() {
      if (!this.app)
        return;
      this.app.market = this.selectElement.value;
      this.countElement.value = this.app.count.toString();
      this.investmentPriceElement.textContent = this.app.investmentPrice.toLocaleString();
    }
    onChange(event) {
      if (!this.app)
        return;
      const target = event.target;
      this.app.market = target.value;
      this.app.runBackTest();
    }
    onSubmit(event) {
      event === null || event === void 0 ? void 0 : event.preventDefault();
      if (!this.app)
        return;
      const maxSize = Number(this.countElement.getAttribute("max"));
      this.app.count = Number(this.countElement.value) > maxSize ? maxSize : Number(this.countElement.value);
      this.countElement.value = this.app.count.toString();
      this.app.runBackTest();
    }
  };

  // dev/scripts/pages/backtest4/Table.js
  var BacktestTable = class extends HTMLElement {
    constructor() {
      super();
      this.app = document.querySelector("app-backtest4");
      this.tableElement = this.querySelector("tbody");
      this.template = document.querySelector("#tp-item");
    }
    connectedCallback() {
    }
    render() {
      if (!this.app)
        return;
      this.tableElement.innerHTML = "";
      const fragment = new DocumentFragment();
      this.app.tradeData.map((aData, index) => this.createItem(aData, index)).forEach((cloned) => fragment.appendChild(cloned));
      this.tableElement.appendChild(fragment);
    }
    createItem(aData, index) {
      var _a, _b;
      const cloned = cloneTemplate(this.template);
      const parseData = {
        index,
        date: aData.date,
        trade_price: aData.trade_price.toLocaleString(),
        order_amount: aData.order_amount && Math.round(aData.order_amount).toLocaleString(),
        condition: aData.condition.toString(),
        action: aData.action,
        volatility: (_a = aData.volatility) === null || _a === void 0 ? void 0 : _a.toFixed(2),
        rate: ((_b = aData.rate && aData.rate * 100) === null || _b === void 0 ? void 0 : _b.toFixed(2)) || "",
        profit: aData.profit && Math.round(aData.profit).toLocaleString() || "",
        sum_profit: aData.sum_profit && Math.round(aData.sum_profit).toLocaleString(),
        unrealize_rate: aData.unrealize_rate && (aData.unrealize_rate * 100).toFixed(2) || "",
        unrealize_profit: aData.unrealize_profit && Math.round(aData.unrealize_profit).toLocaleString() || "",
        unrealize_sum: aData.unrealize_sum && Math.round(aData.unrealize_sum).toLocaleString()
      };
      updateElementsTextWithData(parseData, cloned);
      cloned.dataset.action = aData.action;
      return cloned;
    }
  };

  // dev/scripts/pages/backtest4/index.js
  customElements.define("backtest-control", Control);
  customElements.define("backtest-overview", Overview);
  customElements.define("backtest-table", BacktestTable);
  customElements.define("app-backtest4", AppBacktest4);
})();
//# sourceMappingURL=index.js.map
