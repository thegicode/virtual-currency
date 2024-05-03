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
      this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
      this.count = 30;
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
            this.tradeData.push(result);
          } catch (error) {
            console.error("Error in runBackTest:", error);
          }
        }
        this.tableCustomElement.initialSet();
      });
    }
    backtest(fetchedData, orginRealPrices) {
      const realPrices = orginRealPrices.slice(1);
      const strategedData = this.strategy(fetchedData, realPrices);
      const calculatedData = this.calculateProfits(strategedData);
      return calculatedData;
    }
    strategy(fetchedData, realPrices) {
      const result = fetchedData.slice(1).map((aData, index) => {
        const prevData = fetchedData[index];
        const range = prevData.high_price - prevData.low_price;
        const realPrice = realPrices[index].price;
        const standardPrice = aData.opening_price + range * this.k;
        const buyCondition = realPrice > standardPrice;
        return {
          market: aData.market,
          date: aData.candle_date_time_kst,
          range,
          standardPrice,
          buyCondition,
          action: buyCondition ? "Trade" : "Reserve",
          buyPrice: realPrice,
          sellPrice: aData.trade_price
        };
      });
      return result;
    }
    calculateProfits(data) {
      let sumProfit = 0;
      const result = data.map((aData) => {
        switch (aData.action) {
          case "Trade":
            const rate = aData.sellPrice && aData.buyPrice ? (aData.sellPrice - aData.buyPrice) / aData.buyPrice : 0;
            const profit = rate * this.investmentAmount;
            sumProfit += profit;
            return Object.assign(Object.assign({}, aData), {
              rate,
              profit,
              sumProfit
            });
          default:
            return Object.assign(Object.assign({}, aData), { buyPrice: null, sellPrice: null, sumProfit });
        }
      });
      return result;
    }
    getRealPrices(data) {
      return __awaiter(this, void 0, void 0, function* () {
        const realprices = [];
        for (const aData of data) {
          const date = aData.candle_date_time_kst;
          const toDate = date.replace("T09:00:00", "T13:00:00+09:00");
          const response = yield this.fetchMinutes(aData.market, "60", "1", toDate);
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
    fetchMinutes(market, unit, fetchCount, to) {
      return __awaiter(this, void 0, void 0, function* () {
        const searchParams = new URLSearchParams({
          market,
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
      this.overviewCustomElement.redner(data);
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
      this.app = document.querySelector("app-backtest5");
      this.data = [];
      this.profit = 0;
      this.totalSumPrice = 0;
      this.size = 0;
      this.sumElement = this.querySelector(".overview-sum");
      this.listElement = this.querySelector(".overview-list");
      this.itemTemplate = document.querySelector("#tp-overviewItem");
    }
    connectedCallback() {
    }
    redner(data) {
      this.data = data;
      this.renderList();
      this.renderSum(true);
    }
    renderList() {
      const profit = this.data[this.data.length - 1].sumProfit || 0;
      const rate = profit / this.app.investmentAmount * 100;
      const renderData = {
        market: this.data[0].market,
        period: this.app.count,
        totalRate: `${rate.toFixed(2)}%`,
        totalProfit: ` ${Math.round(profit).toLocaleString()} \uC6D0`
      };
      const cloned = cloneTemplate(this.itemTemplate);
      cloned.dataset.value = profit.toString();
      updateElementsTextWithData(renderData, cloned);
      this.listElement.appendChild(cloned);
      this.addEvent(cloned);
      this.profit = profit;
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
        this.totalSumPrice += this.profit;
        this.size++;
      } else {
        if (profit === void 0)
          return;
        this.totalSumPrice -= profit;
        this.size--;
      }
      const totalSumRate = this.totalSumPrice === 0 ? 0 : this.totalSumPrice / (this.app.investmentAmount * this.size) * 100;
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
      this.data = [];
      this.market = "";
      this.navElement = this.querySelector("nav");
      this.dataElement = this.querySelector(".dataTable");
      this.tableTemplate = document.querySelector("#tp-table");
      this.itemTemplate = document.querySelector("#tp-item");
      this.activedTable = null;
      this.activedTab = null;
      this.addNavEvent = this.addNavEvent.bind(this);
    }
    connectedCallback() {
    }
    render(data) {
      this.data = data;
      this.market = this.data[0].market;
      this.renderNav();
      this.renderTable();
    }
    initialSet() {
      const firstNav = this.navElement.querySelector("a");
      const firstTable = this.dataElement.querySelector("table");
      this.hideDataTables();
      this.activateNav(firstNav);
      this.activateTalble(firstTable);
    }
    renderNav() {
      const tabElement = document.createElement("a");
      tabElement.textContent = this.market;
      tabElement.href = `#${this.market}`;
      this.navElement.appendChild(tabElement);
      tabElement.addEventListener("click", this.addNavEvent);
    }
    addNavEvent(event) {
      event.preventDefault();
      const target = event.target;
      const targetTable = document.querySelector(target.hash);
      this.activateTalble(targetTable);
      this.activateNav(target);
    }
    renderTable() {
      const cloned = this.crateTable();
      this.dataElement.appendChild(cloned);
    }
    crateTable() {
      const cloned = cloneTemplate(this.tableTemplate);
      const fragment = new DocumentFragment();
      this.data.map((aData, index) => this.createItem(aData, index)).forEach((cloned2) => fragment.appendChild(cloned2));
      cloned.id = this.market;
      cloned.dataset.market = this.market;
      cloned.appendChild(fragment);
      return cloned;
    }
    createItem(aData, index) {
      var _a, _b, _c;
      const cloned = cloneTemplate(this.itemTemplate);
      const parseData = {
        index,
        date: aData.date.slice(0, 10),
        range: aData.range.toLocaleString(),
        condition: aData.buyCondition.toString(),
        action: (_a = aData.action) === null || _a === void 0 ? void 0 : _a.toString(),
        standardPrice: aData.standardPrice.toLocaleString(),
        buyPrice: aData.buyPrice && Math.round(aData.buyPrice).toLocaleString() || "",
        sellPrice: aData.sellPrice && Math.round(aData.sellPrice).toLocaleString() || "",
        rate: ((_b = aData.rate && aData.rate * 100) === null || _b === void 0 ? void 0 : _b.toFixed(2)) || "",
        profit: aData.profit && Math.round(aData.profit).toLocaleString() || "",
        sumProfit: aData.sumProfit && Math.round(aData.sumProfit).toLocaleString()
      };
      updateElementsTextWithData(parseData, cloned);
      cloned.dataset.action = (_c = aData.action) === null || _c === void 0 ? void 0 : _c.toString();
      return cloned;
    }
    hideDataTables() {
      const tables = this.dataElement.querySelectorAll("table");
      for (const t of tables) {
        t.hidden = true;
      }
    }
    activateNav(tabElement) {
      tabElement.dataset.active = "true";
      if (this.activedTab)
        this.activedTab.dataset.active = "false";
      this.activedTab = tabElement;
    }
    activateTalble(table) {
      table.hidden = false;
      if (this.activedTable)
        this.activedTable.hidden = true;
      this.activedTable = table;
    }
  };

  // dev/scripts/pages/backtest5/index.js
  customElements.define("backtest-control", Control);
  customElements.define("backtest-overview", Overview);
  customElements.define("backtest-table", BacktestTable);
  customElements.define("app-backtest5", AppBacktest5);
})();
//# sourceMappingURL=index.js.map
