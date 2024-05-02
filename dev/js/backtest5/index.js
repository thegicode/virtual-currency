"use strict";
(() => {
  // dev/scripts/pages/backtest5/AppBacktest5.js
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
  var AppBacktest5 = class extends HTMLElement {
    constructor() {
      super();
      this.tradeData = [];
      this.markets = ["KRW-NEAR"];
      this.market = this.markets[0];
      this.count = 60;
      this.totalInvestmentAmount = 1e6;
      this.investmentAmount = this.totalInvestmentAmount / this.markets.length;
      this.k = 0.5;
      this.overviewCustomElement = this.querySelector("backtest-overview");
      this.controlCustomElement = this.querySelector("backtest-control");
      this.tableCustomElement = this.querySelector("backtest-table");
    }
    connectedCallback() {
      this.runBackTest();
    }
    runBackTest() {
      return __awaiter(this, void 0, void 0, function* () {
        for (const market of this.markets) {
          console.log(market);
          try {
            const data = yield this.fetchData(market, (this.count + 1).toString());
            const realprices = yield this.getRealPrices(data);
            const result = this.backtest(data, realprices);
            this.render(result);
          } catch (error) {
            console.error("Error in runBackTest:", error);
          }
        }
      });
    }
    backtest(fetchedData, orginRealPrices) {
      const data = fetchedData.slice(1);
      const realPrices = orginRealPrices.slice(1);
      let sumProfit = 0;
      let action = "";
      const result = data.map((aData, index) => {
        const prevData = fetchedData[index];
        const range = prevData.high_price - prevData.low_price;
        const realPrice = realPrices[index].price;
        const standardPrice = aData.opening_price + range * this.k;
        const buyCondition = realPrice > standardPrice;
        if (index === 0) {
          action = buyCondition ? "Buy" : "Reserve";
        } else {
        }
        debugger;
        const buyPrice = realPrice;
        const sellPrice = aData.trade_price;
        const rate = !buyCondition ? (sellPrice - buyPrice) / buyPrice : 0;
        const profit = !buyCondition ? rate * this.investmentAmount : 0;
        sumProfit += profit;
        return {
          market: aData.market,
          date: aData.candle_date_time_kst,
          range,
          buyCondition,
          action,
          standardPrice,
          buyPrice: buyCondition ? buyPrice : 0,
          sellPrice: !buyCondition ? sellPrice : 0,
          rate,
          profit,
          sumProfit
        };
      });
      return result;
    }
    getRealPrices(data) {
      return __awaiter(this, void 0, void 0, function* () {
        const realprices = [];
        for (const aData of data) {
          const date = aData.candle_date_time_kst;
          const toDate = date.replace("T09:00:00", "T13:00:00+09:00");
          const response = yield this.fetchMinutes("60", "1", toDate);
          const price = response[0].opening_price;
          realprices.push({
            date,
            price
          });
          yield this.delay(100);
        }
        return realprices;
      });
    }
    fetchData(market, count) {
      return __awaiter(this, void 0, void 0, function* () {
        const searchParams = new URLSearchParams({
          market,
          count
        });
        const response = yield fetch(`/fetchCandles?${searchParams}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return yield response.json();
      });
    }
    fetchMinutes(unit, fetchCount, to) {
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
    delay(duration) {
      return new Promise((resolve) => setTimeout(resolve, duration));
    }
    render(data) {
      this.tableCustomElement.render(data);
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

  // dev/scripts/pages/backtest5/Overview.js
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

  // dev/scripts/pages/backtest5/Control.js
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

  // dev/scripts/pages/backtest5/Table.js
  var BacktestTable = class extends HTMLElement {
    constructor() {
      super();
      this.app = document.querySelector("app-backtest5");
      this.tableElement = this.querySelector("tbody");
      this.template = document.querySelector("#tp-item");
    }
    connectedCallback() {
    }
    render(data) {
      if (!this.app)
        return;
      this.tableElement.innerHTML = "";
      const fragment = new DocumentFragment();
      data.map((aData, index) => this.createItem(aData, index)).forEach((cloned) => fragment.appendChild(cloned));
      this.tableElement.appendChild(fragment);
    }
    createItem(aData, index) {
      var _a;
      const cloned = cloneTemplate(this.template);
      const parseData = {
        index,
        date: aData.date,
        range: aData.range.toLocaleString(),
        condition: aData.buyCondition.toString(),
        action: aData.action.toString(),
        standardPrice: aData.standardPrice.toLocaleString(),
        buyPrice: Math.round(aData.buyPrice).toLocaleString(),
        sellPrice: Math.round(aData.sellPrice).toLocaleString(),
        rate: (_a = aData.rate && aData.rate * 100) === null || _a === void 0 ? void 0 : _a.toFixed(2),
        profit: Math.round(aData.profit).toLocaleString(),
        sumProfit: aData.sumProfit && Math.round(aData.sumProfit).toLocaleString()
      };
      updateElementsTextWithData(parseData, cloned);
      cloned.dataset.action = aData.buyCondition.toString();
      return cloned;
    }
  };

  // dev/scripts/pages/backtest5/index.js
  customElements.define("backtest-control", Control);
  customElements.define("backtest-overview", Overview);
  customElements.define("backtest-table", BacktestTable);
  customElements.define("app-backtest5", AppBacktest5);
})();
//# sourceMappingURL=index.js.map
