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
  function applyStandardMovingAverages(data) {
    let result = setMovingAverage(data, 3);
    result = setMovingAverage(result, 5);
    result = setMovingAverage(result, 10);
    result = setMovingAverage(result, 20);
    return result;
  }

  // app/scripts/components/backtest/volatility.ts
  function volatilityBreakout(prevCandle, realPrice, openingPrice, k) {
    const range = prevCandle.high_price - prevCandle.low_price;
    const standardPrice = openingPrice + range * k;
    const isBreakout = realPrice > standardPrice;
    const prevVolatilityRate = range / prevCandle.opening_price * 100;
    return {
      range,
      standardPrice,
      buyCondition: isBreakout,
      // to delete
      isBreakout,
      prevVolatilityRate
    };
  }

  // dev/scripts/pages/backtest8/AppBacktest8.js
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
  var AppBacktest8 = class extends HTMLElement {
    constructor() {
      super();
      this.markets = [
        "KRW-BTC",
        "KRW-ETH",
        "KRW-DOGE",
        "KRW-XRP",
        "KRW-NEAR"
      ];
      this.count = 30;
      this.totalInvestmentAmount = 1e6;
      this.investmentAmount = this.totalInvestmentAmount / this.markets.length;
      this.targetRate = 2;
      this.tradeCount = 0;
      this.controlIndex = 19;
      this.k = 0.1;
      this.overviewCustomElement = this.querySelector("backtest-overview");
      this.controlCustomElement = this.querySelector("backtest-control");
      this.tableCustomElement = this.querySelector("backtest-table");
    }
    connectedCallback() {
      return __awaiter(this, void 0, void 0, function* () {
        this.runBackTest();
      });
    }
    runBackTest() {
      return __awaiter(this, void 0, void 0, function* () {
        for (const market of this.markets) {
          console.log(market);
          try {
            const data = yield this.fetchData(market, (this.count + this.controlIndex).toString());
            const realprices = yield this.getRealPrices(data);
            const result = this.backtest(data, realprices);
            this.render(result, this.markets.indexOf(market));
          } catch (error) {
            console.error("Error in runBackTest:", error);
          }
        }
      });
    }
    backtest(fetchedData, orginRealPrices) {
      const movingAverageData = applyStandardMovingAverages(fetchedData);
      const strategedData = this.processTradingDecisions(movingAverageData, orginRealPrices);
      const calculatedData = this.calculateProfits(strategedData);
      return calculatedData;
    }
    processTradingDecisions(fetchedData, realPrices) {
      const relevantData = fetchedData.slice(this.controlIndex);
      const result = relevantData.map((candleData, index) => {
        const isOverMovingAverage = this.checkOverMovingAverage(candleData);
        const { previousCandle, nextCandle, currentRealPrice } = this.getProcessData(fetchedData, realPrices, index);
        this.verifyDataConsistency(candleData, realPrices, index);
        const { range, standardPrice, isBreakout, prevVolatilityRate } = volatilityBreakout(previousCandle, currentRealPrice, candleData.opening_price, this.k);
        const tradeCondition = Boolean(isOverMovingAverage && isBreakout);
        const investmentAmount = this.calculateInvestmentAmount(tradeCondition, prevVolatilityRate);
        const nextDayOpningPrice = this.getNextDayOpeningPrice(realPrices, index);
        return {
          market: candleData.market,
          date: candleData.candle_date_time_kst,
          openingPrice: candleData.opening_price,
          range,
          standardPrice,
          buyCondition: tradeCondition,
          action: tradeCondition ? "Trade" : "Reserve",
          volatilityRate: prevVolatilityRate,
          buyPrice: currentRealPrice,
          sellPrice: nextCandle ? nextCandle.opening_price : null,
          investmentAmount
        };
      });
      return result;
    }
    checkOverMovingAverage(candleData) {
      if (!candleData.moving_average_3 || !candleData.moving_average_5 || !candleData.moving_average_10 || !candleData.moving_average_20)
        return null;
      const result = candleData.trade_price > candleData.moving_average_3 && candleData.trade_price > candleData.moving_average_5 && candleData.trade_price > candleData.moving_average_10 && candleData.trade_price > candleData.moving_average_20 ? true : false;
      return result;
    }
    getProcessData(fetchedData, realPrices, index) {
      const previousCandle = fetchedData[index + this.controlIndex - 1];
      const nextCandle = fetchedData[index + this.controlIndex + 1];
      const currentRealPrice = realPrices[index + this.controlIndex].price;
      return {
        previousCandle,
        nextCandle,
        currentRealPrice
      };
    }
    verifyDataConsistency(candleData, realPrices, index) {
      if (candleData.candle_date_time_kst.slice(0, 10) !== realPrices[index + this.controlIndex].date.slice(0, 10)) {
        throw new Error("Data date and real price date mismatch.");
      }
    }
    calculateInvestmentAmount(tradeCondition, prevVolatilityRate) {
      if (!tradeCondition)
        return 0;
      const investmentRatio = this.targetRate / prevVolatilityRate / this.markets.length;
      return investmentRatio * this.totalInvestmentAmount;
    }
    getNextDayOpeningPrice(realPrices, index) {
      if (!realPrices[index + this.controlIndex + 1])
        return null;
      return realPrices[index + this.controlIndex + 1].price;
    }
    calculateProfits(data) {
      let sumProfit = 0;
      let tradeCount = 0;
      const result = data.map((aData) => {
        switch (aData.action) {
          case "Trade":
            const rate = aData.sellPrice && aData.buyPrice ? (aData.sellPrice - aData.buyPrice) / aData.buyPrice : 0;
            const profit = aData.investmentAmount ? rate * aData.investmentAmount : 0;
            sumProfit += profit;
            tradeCount++;
            return Object.assign(Object.assign({}, aData), {
              rate,
              profit,
              sumProfit
            });
          default:
            return Object.assign(Object.assign({}, aData), { buyPrice: null, sellPrice: null, sumProfit });
        }
      });
      this.tradeCount = tradeCount;
      return result;
    }
    getRealPrices(data) {
      return __awaiter(this, void 0, void 0, function* () {
        const realprices = [];
        for (const aData of data) {
          const date = aData.candle_date_time_kst;
          const toDate = date.replace("T09:00:00", "T11:00:00+09:00");
          const response = yield this.fetchMinutes(aData.market, "60", "1", toDate);
          const price = response[0].opening_price;
          realprices.push({
            date: response[0].candle_date_time_kst,
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
    render(data, index) {
      this.controlCustomElement.render();
      this.overviewCustomElement.redner(data);
      this.tableCustomElement.render(data, index);
    }
    initialize() {
      this.controlCustomElement.initialize();
      this.overviewCustomElement.initialize();
      this.tableCustomElement.initialize();
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

  // dev/scripts/pages/backtest8/Overview.js
  var Overview = class extends HTMLElement {
    constructor() {
      super();
      this.app = document.querySelector("app-backtest8");
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
    initialize() {
      this.data = [];
      this.profit = 0;
      this.totalSumPrice = 0;
      this.size = 0;
      this.listElement.innerHTML = "";
      const renderData = {
        totalSumPrice: 0,
        totalSumRate: 0
      };
      updateElementsTextWithData(renderData, this.sumElement);
    }
    redner(data) {
      this.data = data;
      this.renderList();
      this.renderSum(true);
    }
    renderList() {
      const profit = this.data[this.data.length - 1].sumProfit || 0;
      const rate = profit / this.app.investmentAmount * 100;
      const market = this.data[0].market;
      const renderData = {
        market,
        period: this.app.count,
        tradeCount: this.app.tradeCount,
        totalRate: `${rate.toFixed(2)}%`,
        totalProfit: ` ${Math.round(profit).toLocaleString()} \uC6D0`
      };
      const cloned = cloneTemplate(this.itemTemplate);
      cloned.dataset.value = profit.toString();
      cloned.dataset.market = market;
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

  // dev/scripts/pages/backtest8/Control.js
  var Control = class extends HTMLElement {
    constructor() {
      super();
      this.app = document.querySelector("app-backtest8");
      this.formElement = this.querySelector("form");
      this.marketsInput = this.querySelector('input[name="markets"]');
      this.countInput = this.querySelector("input[name=count]");
      this.investmentPriceElement = this.querySelector(".investmentPrice");
      this.onSubmit = this.onSubmit.bind(this);
    }
    connectedCallback() {
      this.formElement.addEventListener("submit", this.onSubmit);
    }
    disconnectedCallback() {
      this.formElement.removeEventListener("submit", this.onSubmit);
    }
    render() {
      if (!this.app)
        return;
      this.marketsInput.value = this.app.markets.join(", ");
      this.countInput.value = this.app.count.toString();
      this.investmentPriceElement.textContent = this.app.investmentAmount.toLocaleString();
    }
    initialize() {
    }
    onSubmit(event) {
      event === null || event === void 0 ? void 0 : event.preventDefault();
      if (!this.app)
        return;
      this.app.markets = this.marketsInput.value.split(",");
      const maxSize = Number(this.countInput.getAttribute("max"));
      this.app.count = Number(this.countInput.value) > maxSize ? maxSize : Number(this.countInput.value);
      this.countInput.value = this.app.count.toString();
      this.app.initialize();
      this.app.runBackTest();
    }
  };

  // dev/scripts/pages/backtest8/Table.js
  var BacktestTable = class extends HTMLElement {
    constructor() {
      super();
      this.data = [];
      this.market = "";
      this.activedTable = null;
      this.activedTab = null;
      this.navElement = this.querySelector("nav");
      this.dataElement = this.querySelector(".dataTable");
      this.tableTemplate = document.querySelector("#tp-table");
      this.itemTemplate = document.querySelector("#tp-item");
      this.addNavEvent = this.addNavEvent.bind(this);
    }
    connectedCallback() {
    }
    initialize() {
      this.data = [];
      this.market = "";
      this.activedTable = null;
      this.activedTab = null;
      this.navElement.innerHTML = "";
      this.dataElement.innerHTML = "";
    }
    render(data, index) {
      this.data = data;
      this.market = this.data[0].market;
      this.renderNav(index);
      this.renderTable(index);
    }
    renderNav(index) {
      const tabElement = document.createElement("a");
      tabElement.textContent = this.market;
      tabElement.href = `#${this.market}`;
      if (index === 0) {
        tabElement.dataset.active = "true";
        this.activedTab = tabElement;
      }
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
    renderTable(index) {
      const cloned = this.crateTable();
      if (index === 0) {
        cloned.hidden = false;
        this.activedTable = cloned;
      } else {
        cloned.hidden = true;
      }
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
      var _a, _b, _c, _d, _e, _f;
      const cloned = cloneTemplate(this.itemTemplate);
      const parseData = {
        index,
        date: aData.date.slice(0, 10),
        openingPrice: (_a = aData.openingPrice) === null || _a === void 0 ? void 0 : _a.toLocaleString(),
        range: (_b = aData.range) === null || _b === void 0 ? void 0 : _b.toLocaleString(),
        condition: aData.buyCondition.toString(),
        action: (_c = aData.action) === null || _c === void 0 ? void 0 : _c.toString(),
        standardPrice: ((_d = aData.standardPrice) === null || _d === void 0 ? void 0 : _d.toLocaleString()) || "",
        buyPrice: aData.buyPrice && Math.round(aData.buyPrice).toLocaleString() || "",
        sellPrice: aData.sellPrice && Math.round(aData.sellPrice).toLocaleString() || "",
        investmentAmount: aData.investmentAmount && Math.round(aData.investmentAmount).toLocaleString() || "",
        volatilityRate: aData.volatilityRate && aData.volatilityRate.toFixed(2) || "",
        rate: ((_e = aData.rate && aData.rate * 100) === null || _e === void 0 ? void 0 : _e.toFixed(2)) || "",
        profit: aData.profit && Math.round(aData.profit).toLocaleString() || "",
        sumProfit: aData.sumProfit && Math.round(aData.sumProfit).toLocaleString()
      };
      updateElementsTextWithData(parseData, cloned);
      cloned.dataset.action = (_f = aData.action) === null || _f === void 0 ? void 0 : _f.toString();
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

  // dev/scripts/pages/backtest8/index.js
  customElements.define("backtest-table", BacktestTable);
  customElements.define("backtest-control", Control);
  customElements.define("backtest-overview", Overview);
  customElements.define("app-backtest8", AppBacktest8);
})();
//# sourceMappingURL=index.js.map