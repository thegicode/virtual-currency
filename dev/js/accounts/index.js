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
  function roundToDecimalPlace(amount, point) {
    const decimalPoint = Math.pow(10, point);
    return Math.round(amount * decimalPoint) / decimalPoint;
  }

  // dev/scripts/pages/accounts/OrderedItem.js
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
  var OrderedItem = class extends HTMLElement {
    constructor(data) {
      super();
      this.cancelButton = null;
      this.data = data;
      this.template = document.querySelector("#tp-orderedItem");
      this.cancelButton = null;
      this.onCancel = this.onCancel.bind(this);
    }
    connectedCallback() {
      var _a;
      const cloned = this.createElement();
      this.innerHTML = cloned.innerHTML;
      this.dataset.side = this.data.side;
      this.cancelButton = this.querySelector(".cancelButton");
      (_a = this.cancelButton) === null || _a === void 0 ? void 0 : _a.addEventListener("click", this.onCancel);
    }
    disconnectedCallback() {
      var _a;
      (_a = this.cancelButton) === null || _a === void 0 ? void 0 : _a.removeEventListener("click", this.onCancel);
    }
    createElement() {
      const cloned = cloneTemplate(this.template);
      const contentData = {
        created_at: this.formatDateTime(this.data.created_at),
        price: this.data.price.toLocaleString(),
        side: this.data.side === "bid" ? "\uB9E4\uC218" : "\uB9E4\uB3C4",
        volume: this.data.volume
      };
      updateElementsTextWithData(contentData, cloned);
      return cloned;
    }
    onCancel() {
      return __awaiter(this, void 0, void 0, function* () {
        if (!this.cancelButton)
          return;
        this.cancelButton.disabled = true;
        try {
          const response = yield fetch(`/cancelOrder?uuid=${this.data.uuid}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = yield response.json();
          if (data.uuid === this.data.uuid) {
            this.remove();
          }
        } catch (error) {
          console.error("Error", error);
        }
      });
    }
    formatDateTime(dateTime) {
      const date = new Date(dateTime);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      return `${month}.${day} ${hours}:${minutes}:${seconds}`;
    }
  };

  // dev/scripts/pages/accounts/OrderBid.js
  var __awaiter2 = function(thisArg, _arguments, P, generator) {
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
  var OrderBid = class extends HTMLElement {
    constructor(parent) {
      super();
      this.form = null;
      this.amountInput = null;
      this.priceInput = null;
      this.priceRadios = null;
      this.priceManual = null;
      this.hideButton = null;
      this.orderData = {
        amountPrice: 0,
        price: 0
      };
      this.parent = parent;
      this.template = document.querySelector("#tp-orderBid");
      this.show = this.show.bind(this);
      this.hide = this.hide.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
      this.onReset = this.onReset.bind(this);
      this.onInputAmount = this.onInputAmount.bind(this);
      this.onChangepriceRadios = this.onChangepriceRadios.bind(this);
      this.onInputPriceManual = this.onInputPriceManual.bind(this);
    }
    connectedCallback() {
      this.render();
      this.form = this.querySelector("form");
      this.amountInput = this.querySelector("input[name=amount]");
      this.priceInput = this.querySelector("input[name=price]");
      this.priceRadios = this.querySelectorAll("input[name=price-option]");
      this.priceManual = this.querySelector("input[name=price-option-manual]");
      this.hideButton = this.querySelector(".hideButton");
      this.form.addEventListener("submit", this.onSubmit);
      this.form.addEventListener("reset", this.onReset);
      this.amountInput.addEventListener("input", this.onInputAmount);
      this.priceRadios.forEach((radio) => {
        radio.addEventListener("change", this.onChangepriceRadios);
      });
      this.priceManual.addEventListener("input", this.onInputPriceManual);
      this.hideButton.addEventListener("click", this.hide);
    }
    render() {
      const cloned = cloneTemplate(this.template);
      this.appendChild(cloned);
      this.show();
    }
    show() {
      this.hidden = false;
      this.parent.showOrderBid();
    }
    hide() {
      this.hidden = true;
      this.parent.hideOrderBid();
    }
    onSubmit(event) {
      var _a;
      return __awaiter2(this, void 0, void 0, function* () {
        event.preventDefault();
        const price = Math.round(this.orderData.price || 0);
        const volume = this.orderData.amountPrice && this.orderData.price ? (this.orderData.amountPrice / price).toString() : "0";
        const searchParams = new URLSearchParams({
          market: this.parent.market,
          side: "bid",
          volume,
          price: (_a = price.toString()) !== null && _a !== void 0 ? _a : "",
          ord_type: "limit"
        });
        const response = yield fetch(`/fetchOrders?${searchParams}`);
        const data = yield response.json();
        this.renderOrderItem(data);
      });
    }
    renderOrderItem(data) {
      const orderItem = new OrderedItem(data);
      if (this.parent.orderedElement) {
        const firstChild = this.parent.orderedElement.querySelector("ordered-item");
        this.parent.orderedElement.insertBefore(orderItem, firstChild);
      }
    }
    onReset() {
      this.orderData.amountPrice = 0;
      this.orderData.price = 0;
      console.log(this.orderData);
    }
    onInputAmount(event) {
      const target = event.target;
      const validateValue = target.value.replace(/[^0-9.-]+/g, "");
      this.orderData.amountPrice = Number(validateValue);
      target.value = this.orderData.amountPrice.toLocaleString();
    }
    onChangepriceRadios(event) {
      const target = event.target;
      if (target.value === "manual")
        return;
      this.calculatePrice(parseInt(target.value));
    }
    onInputPriceManual(event) {
      const target = event.target;
      this.calculatePrice(-parseInt(target.value));
    }
    calculatePrice(aPercent) {
      if (!this.priceInput)
        return;
      const value = this.parent.avgBuyPrice * aPercent * 0.01;
      this.orderData.price = this.parent.avgBuyPrice + value;
      this.priceInput.value = this.orderData.price.toLocaleString();
    }
  };

  // dev/scripts/pages/accounts/AccountItem.js
  var AccountItem = class extends HTMLElement {
    constructor(data) {
      super();
      this.orderedButton = null;
      this.ordered = null;
      this.bidButton = null;
      this.orderBid = null;
      this.data = data;
      this.template = document.querySelector("#tp-accountItem");
      this.orderedButton = null;
      this.ordered = null;
      this.bidButton = null;
      this.handleOrdereds = this.handleOrdereds.bind(this);
      this.handleOrderBid = this.handleOrderBid.bind(this);
    }
    get market() {
      return this.data.market;
    }
    get avgBuyPrice() {
      return this.data.avgBuyPrice;
    }
    get orderedElement() {
      return this.ordered;
    }
    connectedCallback() {
      var _a, _b;
      this.render();
      this.orderedButton = this.querySelector(".orderedButton");
      this.ordered = this.querySelector(".ordered");
      this.bidButton = this.querySelector(".bidButton");
      this.renderOrdereds();
      (_a = this.orderedButton) === null || _a === void 0 ? void 0 : _a.addEventListener("click", this.handleOrdereds);
      (_b = this.bidButton) === null || _b === void 0 ? void 0 : _b.addEventListener("click", this.handleOrderBid);
    }
    disconnectedCallback() {
      var _a, _b;
      (_a = this.orderedButton) === null || _a === void 0 ? void 0 : _a.removeEventListener("click", this.handleOrdereds);
      (_b = this.bidButton) === null || _b === void 0 ? void 0 : _b.removeEventListener("click", this.handleOrderBid);
    }
    render() {
      const cloned = cloneTemplate(this.template);
      const contentData = {
        currency: this.data.currency,
        unitCurrency: this.data.unitCurrency,
        volume: this.data.volume,
        buyPrice: roundToDecimalPlace(this.data.buyPrice, 0).toLocaleString(),
        avgBuyPrice: roundToDecimalPlace(this.data.avgBuyPrice, 1).toLocaleString(),
        profit: Math.round(this.data.profit).toLocaleString(),
        profitRate: roundToDecimalPlace(this.data.profitRate, 2) + "%"
      };
      updateElementsTextWithData(contentData, cloned);
      this.innerHTML = cloned.innerHTML;
      const isIncrement = this.data.profit > 0 ? true : false;
      this.dataset.increase = isIncrement.toString();
    }
    renderOrdereds() {
      if (this.ordered && this.data.orderedData.length === 0) {
        this.ordered.hidden = true;
        return;
      }
      this.data.orderedData.map((data) => {
        var _a;
        const orderedItem = new OrderedItem(data);
        (_a = this.ordered) === null || _a === void 0 ? void 0 : _a.appendChild(orderedItem);
      });
    }
    handleOrdereds() {
      if (!this.ordered)
        return;
      this.ordered.hidden = !this.ordered.hidden;
    }
    handleOrderBid() {
      var _a;
      if (this.orderBid) {
        this.orderBid.show();
        return;
      }
      this.orderBid = new OrderBid(this);
      (_a = this.querySelector("#orderBid")) === null || _a === void 0 ? void 0 : _a.replaceWith(this.orderBid);
    }
    showOrderBid() {
      if (!this.bidButton)
        return;
      this.bidButton.disabled = true;
    }
    hideOrderBid() {
      if (!this.bidButton)
        return;
      this.bidButton.disabled = false;
    }
  };

  // dev/scripts/pages/accounts/AppAccounts.js
  var __awaiter3 = function(thisArg, _arguments, P, generator) {
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
  var AppAccounts = class extends HTMLElement {
    constructor() {
      super();
      this.list = this.querySelector(".accountsList");
      this.markets = [];
    }
    connectedCallback() {
      this.loadAccountData();
    }
    disconnectedCallback() {
    }
    loadAccountData() {
      return __awaiter3(this, void 0, void 0, function* () {
        try {
          const accountsResponse = yield this.fetchData(`/fetchAccounts`);
          this.markets = accountsResponse.accounts.map((account) => account.market);
          const tickerResponse = yield this.fetchData(`/fetchTickers?markets=${encodeURIComponent(this.markets.join(","))}`);
          this.displayAssets(accountsResponse.assets);
          const orderedResponse = yield this.fetchData(`/fetchOrdered`);
          const orderedData = this.ordered(orderedResponse);
          const processedAccounts = yield this.processAccountsData(accountsResponse.accounts, tickerResponse, orderedData);
          this.renderAccountsList(processedAccounts);
        } catch (error) {
          console.error(error);
        }
      });
    }
    fetchData(url) {
      return __awaiter3(this, void 0, void 0, function* () {
        const response = yield fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return yield response.json();
      });
    }
    ordered(data) {
      try {
        let orderedData = {};
        this.markets.map((market) => {
          orderedData[market] = [];
        });
        data.map((order) => {
          orderedData[order.market].push(order);
        });
        return orderedData;
      } catch (error) {
        console.error(error);
      }
    }
    displayAssets(data) {
      const element = this.querySelector(".assets");
      const totalAsset = data.balance + data.locked;
      const contentData = {
        totalAsset: roundToDecimalPlace(totalAsset, 0).toLocaleString(),
        locked: roundToDecimalPlace(data.locked, 0).toLocaleString(),
        unit: data.unit_currency
      };
      updateElementsTextWithData(contentData, element);
      delete element.dataset.loading;
    }
    processAccountsData(accounts, tickerData, orderedObject) {
      function _handleData(account) {
        const ticker = tickerData.find((t) => t.market === account.market);
        const orderedData = orderedObject[account.market];
        if (!ticker) {
          console.error(`Ticker not found for market: ${account.market}`);
          return null;
        }
        const priceAtBuy = account.avg_buy_price * account.volume;
        const currentPrice = ticker.trade_price * account.volume;
        const profit = currentPrice - priceAtBuy;
        const profitRate = priceAtBuy > 0 ? profit / priceAtBuy * 100 : 0;
        return {
          market: account.market,
          currency: account.currency,
          unitCurrency: account.unit_currency,
          buyPrice: account.buy_price,
          avgBuyPrice: account.avg_buy_price,
          volume: account.volume,
          locked: account.locked,
          profit,
          profitRate,
          orderedData
        };
      }
      return accounts.map((account) => _handleData(account)).filter((account) => account !== null);
    }
    renderAccountsList(data) {
      const fragment = new DocumentFragment();
      data.map((aData) => new AccountItem(aData)).forEach((accountItem) => {
        fragment.appendChild(accountItem);
      });
      this.list.appendChild(fragment);
      delete this.list.dataset.loading;
    }
  };

  // dev/scripts/pages/accounts/index.js
  customElements.define("app-accounts", AppAccounts);
  customElements.define("account-item", AccountItem);
  customElements.define("order-bid", OrderBid);
  customElements.define("ordered-item", OrderedItem);
})();
//# sourceMappingURL=index.js.map
