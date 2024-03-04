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
          const response = yield fetch(`/fetchCancel?uuid=${this.data.uuid}`);
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

  // dev/scripts/pages/accounts/OrderBase.js
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
  var OrderBase = class extends HTMLElement {
    constructor(accountItem) {
      super();
      this.formElement = null;
      this.template = null;
      this.priceRadios = null;
      this.priceManual = null;
      this.priceInput = null;
      this.memoElement = null;
      this.orderPrice = 0;
      this.accountItem = accountItem;
      this.market = accountItem.market;
      this.onChangepriceRadios = this.onChangepriceRadios.bind(this);
      this.onInputPriceManual = this.onInputPriceManual.bind(this);
      this.onInputPrice = this.onInputPrice.bind(this);
    }
    connectedCallback() {
      var _a, _b;
      this.render();
      this.formElement = this.querySelector("form");
      this.priceRadios = this.querySelectorAll("input[name=price-option]");
      this.priceManual = this.querySelector("input[name=price-option-manual]");
      this.priceInput = this.querySelector("input[name=price]");
      this.memoElement = this.querySelector(".memo");
      this.priceRadios.forEach((radio) => {
        radio.addEventListener("change", this.onChangepriceRadios);
      });
      (_a = this.priceManual) === null || _a === void 0 ? void 0 : _a.addEventListener("input", this.onInputPriceManual);
      (_b = this.priceInput) === null || _b === void 0 ? void 0 : _b.addEventListener("input", this.onInputPrice);
    }
    render() {
      if (!this.template)
        return;
      const cloned = cloneTemplate(this.template);
      this.appendChild(cloned);
    }
    fetchData(searchParams) {
      return __awaiter2(this, void 0, void 0, function* () {
        const response = yield fetch(`/fetchOrders?${searchParams}`);
        if (!response.ok) {
          if (this.memoElement)
            this.memoElement.textContent = `Fail Order: status ${response.status}`;
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        if (data.error) {
          if (this.memoElement)
            this.memoElement.textContent = data.error.message;
          console.log(data.error);
          return;
        }
        this.renderOrderItem(data);
        return data;
      });
    }
    renderOrderItem(data) {
      const orderItem = new OrderedItem(data);
      if (!this.accountItem.orderedElement)
        return;
      const firstChild = this.accountItem.orderedElement.querySelector("ordered-item");
      if (firstChild) {
        this.accountItem.orderedElement.insertBefore(orderItem, firstChild);
      } else {
        this.accountItem.orderedElement.appendChild(orderItem);
        this.accountItem.orderedElement.hidden = false;
      }
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
      const value = this.accountItem.avgBuyPrice * aPercent * 0.01;
      this.setPrice(this.accountItem.avgBuyPrice + value);
    }
    onInputPrice(event) {
      const target = event.target;
      const validateValue = this.validateInputNumber(target.value);
      this.setPrice(parseInt(validateValue));
    }
    setPrice(price) {
      if (!this.priceInput)
        return;
      this.orderPrice = this.transformPrice(price);
      this.priceInput.value = this.orderPrice.toLocaleString();
    }
    validateInputNumber(value) {
      return value.replace(/[^0-9.-]+/g, "");
    }
    transformPrice(price) {
      const roundUnits = {
        "KRW-BTC": 1e3,
        "KRW-ETH": 1e3,
        "KRW-BCH": 50
      };
      const decimalCount = this.accountItem.decimalCount || 0;
      const roundUnit = roundUnits[this.market] || 1;
      if (decimalCount > 0) {
        const roundedPrice = price / roundUnit;
        return parseFloat(roundedPrice.toFixed(decimalCount));
      } else {
        return Math.round(price / roundUnit) * roundUnit;
      }
    }
  };

  // dev/scripts/pages/accounts/OrderBid.js
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
  var OrderBid = class extends OrderBase {
    constructor(parent) {
      super(parent);
      this.amountInput = null;
      this.orderAmountPrice = 0;
      this.template = document.querySelector("#tp-orderBid");
      this.show = this.show.bind(this);
      this.hide = this.hide.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
      this.onReset = this.onReset.bind(this);
      this.onInputAmount = this.onInputAmount.bind(this);
    }
    connectedCallback() {
      var _a, _b;
      super.connectedCallback();
      this.show();
      this.amountInput = this.querySelector("input[name=amount]");
      (_a = this.formElement) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", this.onSubmit);
      (_b = this.formElement) === null || _b === void 0 ? void 0 : _b.addEventListener("reset", this.onReset);
      this.amountInput.addEventListener("input", this.onInputAmount);
    }
    show() {
      this.hidden = false;
      this.accountItem.showOrderBid();
    }
    hide() {
      this.hidden = true;
      this.accountItem.hideOrderBid();
    }
    onSubmit(event) {
      var _a, _b;
      return __awaiter3(this, void 0, void 0, function* () {
        event.preventDefault();
        if (!this.orderAmountPrice || !this.orderPrice)
          return;
        const volume = this.orderAmountPrice / this.orderPrice;
        const searchParams = new URLSearchParams({
          market: this.accountItem.market,
          side: "bid",
          volume: volume.toString(),
          price: (_a = this.orderPrice.toString()) !== null && _a !== void 0 ? _a : "",
          ord_type: "limit"
        });
        this.fetchData(searchParams);
        (_b = this.formElement) === null || _b === void 0 ? void 0 : _b.reset();
      });
    }
    onReset() {
      this.orderAmountPrice = 0;
      this.orderPrice = 0;
      console.log(this.orderAmountPrice, this.orderPrice);
    }
    onInputAmount(event) {
      const target = event.target;
      const validateValue = this.validateInputNumber(target.value);
      this.orderAmountPrice = parseInt(validateValue);
      target.value = this.orderAmountPrice.toLocaleString();
    }
  };

  // dev/scripts/pages/accounts/OrderAsk.js
  var __awaiter4 = function(thisArg, _arguments, P, generator) {
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
  var OrderAsk = class extends OrderBase {
    constructor(parent) {
      super(parent);
      this.volumeRadios = null;
      this.volumeManual = null;
      this.volumeInput = null;
      this.orderVolume = 0;
      this.template = document.querySelector("#tp-orderAsk");
      this.show = this.show.bind(this);
      this.hide = this.hide.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
      this.onReset = this.onReset.bind(this);
      this.onChangeVolumeRadios = this.onChangeVolumeRadios.bind(this);
      this.onInputVolumeManual = this.onInputVolumeManual.bind(this);
    }
    connectedCallback() {
      var _a, _b;
      super.connectedCallback();
      this.show();
      this.volumeInput = this.querySelector("input[name=volume]");
      this.volumeRadios = this.querySelectorAll("input[name=volume-option]");
      this.volumeManual = this.querySelector("input[name=volume-option-manual]");
      (_a = this.formElement) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", this.onSubmit);
      (_b = this.formElement) === null || _b === void 0 ? void 0 : _b.addEventListener("reset", this.onReset);
      this.volumeRadios.forEach((radio) => {
        radio.addEventListener("change", this.onChangeVolumeRadios);
      });
      this.volumeManual.addEventListener("input", this.onInputVolumeManual);
    }
    show() {
      this.hidden = false;
      this.accountItem.showOrderAsk();
    }
    hide() {
      this.hidden = true;
      this.accountItem.hideOrderAsk();
    }
    onSubmit(event) {
      var _a, _b;
      return __awaiter4(this, void 0, void 0, function* () {
        event.preventDefault();
        const searchParams = new URLSearchParams({
          market: this.accountItem.market,
          side: "ask",
          volume: this.orderVolume.toString(),
          price: (_a = this.orderPrice.toString()) !== null && _a !== void 0 ? _a : "",
          ord_type: "limit"
        });
        this.fetchData(searchParams);
        (_b = this.formElement) === null || _b === void 0 ? void 0 : _b.reset();
      });
    }
    onReset() {
      this.orderVolume = 0;
      this.orderPrice = 0;
    }
    onChangeVolumeRadios(event) {
      const target = event.target;
      if (target.value === "manual")
        return;
      this.calculateVolume(parseInt(target.value));
    }
    onInputVolumeManual(event) {
      const target = event.target;
      this.calculateVolume(parseInt(target.value));
    }
    calculateVolume(aPercent) {
      if (!this.volumeInput)
        return;
      this.orderVolume = this.accountItem.volume * aPercent / 100;
      this.volumeInput.value = this.orderVolume.toString();
    }
  };

  // dev/scripts/pages/accounts/AccountItem.js
  var AccountItem = class extends HTMLElement {
    constructor(data) {
      super();
      this.orderedButton = null;
      this.ordered = null;
      this.bidButton = null;
      this.askButton = null;
      this.orderBid = null;
      this.orderAsk = null;
      this._decimalCount = null;
      this.data = data;
      this.template = document.querySelector("#tp-accountItem");
      this.orderedButton = null;
      this.ordered = null;
      this.bidButton = null;
      this.askButton = null;
      this.handleOrdereds = this.handleOrdereds.bind(this);
      this.handleOrderBid = this.handleOrderBid.bind(this);
      this.handleOrderAsk = this.handleOrderAsk.bind(this);
    }
    get market() {
      return this.data.market;
    }
    get avgBuyPrice() {
      return this.data.avgBuyPrice;
    }
    get volume() {
      return this.data.volume;
    }
    get orderedElement() {
      return this.ordered;
    }
    get decimalCount() {
      return this._decimalCount;
    }
    connectedCallback() {
      var _a, _b, _c;
      this.render();
      this.orderedButton = this.querySelector(".orderedButton");
      this.ordered = this.querySelector(".ordered");
      this.bidButton = this.querySelector(".bidButton");
      this.askButton = this.querySelector(".askButton");
      this.renderOrdereds();
      (_a = this.orderedButton) === null || _a === void 0 ? void 0 : _a.addEventListener("click", this.handleOrdereds);
      (_b = this.bidButton) === null || _b === void 0 ? void 0 : _b.addEventListener("click", this.handleOrderBid);
      (_c = this.askButton) === null || _c === void 0 ? void 0 : _c.addEventListener("click", this.handleOrderAsk);
    }
    disconnectedCallback() {
      var _a, _b, _c;
      (_a = this.orderedButton) === null || _a === void 0 ? void 0 : _a.removeEventListener("click", this.handleOrdereds);
      (_b = this.bidButton) === null || _b === void 0 ? void 0 : _b.removeEventListener("click", this.handleOrderBid);
      (_c = this.askButton) === null || _c === void 0 ? void 0 : _c.removeEventListener("click", this.handleOrderAsk);
    }
    render() {
      const cloned = cloneTemplate(this.template);
      this._decimalCount = this.countDecimalPlaces(this.data.tradePrice);
      const contentData = {
        currency: this.data.currency,
        unitCurrency: this.data.unitCurrency,
        volume: this.data.volume,
        buyPrice: Math.round(this.data.buyPrice).toLocaleString(),
        avgBuyPrice: Number(this.data.avgBuyPrice.toFixed(this._decimalCount)).toLocaleString(),
        profit: Math.round(this.data.profit).toLocaleString(),
        profitRate: this.data.profitRate.toFixed(2) + "%",
        tradePrice: Number(this.data.tradePrice.toFixed(this._decimalCount)).toLocaleString()
      };
      updateElementsTextWithData(contentData, cloned);
      const upbitAnchor = cloned.querySelector(".upbit");
      upbitAnchor.href = `https://upbit.com/exchange?code=CRIX.UPBIT.${this.data.market}`;
      this.innerHTML = cloned.innerHTML;
      const isIncrement = this.data.profit > 0 ? true : false;
      this.dataset.increase = isIncrement.toString();
    }
    renderOrdereds() {
      if (this.ordered && !this.data.orderedData) {
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
        if (this.orderBid.hidden)
          this.orderBid.show();
        else
          this.orderBid.hide();
        return;
      }
      this.orderBid = new OrderBid(this);
      (_a = this.querySelector("#orderBid")) === null || _a === void 0 ? void 0 : _a.replaceWith(this.orderBid);
    }
    showOrderBid() {
      if (!this.bidButton)
        return;
      this.bidButton.textContent = "\uB9E4\uC218 \uAC00\uB9AC\uAE30";
    }
    hideOrderBid() {
      if (!this.bidButton)
        return;
      this.bidButton.textContent = "\uB9E4\uC218";
    }
    handleOrderAsk() {
      var _a;
      if (this.orderAsk) {
        if (this.orderAsk.hidden)
          this.orderAsk.show();
        else
          this.orderAsk.hide();
        return;
      }
      this.orderAsk = new OrderAsk(this);
      (_a = this.querySelector("#orderAsk")) === null || _a === void 0 ? void 0 : _a.replaceWith(this.orderAsk);
    }
    showOrderAsk() {
      if (!this.askButton)
        return;
      this.askButton.textContent = "\uB9E4\uB3C4 \uAC00\uB9AC\uAE30";
    }
    hideOrderAsk() {
      if (!this.askButton)
        return;
      this.askButton.textContent = "\uB9E4\uB3C4";
    }
    countDecimalPlaces(price) {
      if (!isNaN(price) && Math.floor(price) !== price) {
        return price.toString().split(".")[1].length;
      }
      return 0;
    }
  };

  // dev/scripts/pages/accounts/AppAccounts.js
  var __awaiter5 = function(thisArg, _arguments, P, generator) {
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
      this.loadAssetsAndAccounts();
    }
    disconnectedCallback() {
    }
    loadAssetsAndAccounts() {
      return __awaiter5(this, void 0, void 0, function* () {
        try {
          const [accountsResponse, orderedResponse] = yield Promise.all([
            this.fetchData(`/fetchAccounts`),
            this.fetchData(`/fetchOrdereds`)
          ]);
          this.markets = accountsResponse.accounts.map((account) => account.market);
          const tickerResponse = yield this.fetchData(`/fetchTickers?markets=${encodeURIComponent(this.markets.join(","))}`);
          const processedAccounts = yield this.processAccountsData(accountsResponse.accounts, tickerResponse, orderedResponse);
          const profitPrices = processedAccounts.map((account) => account.profit);
          const profits = profitPrices.reduce((a, b) => a + b, 0);
          this.renderAssets(accountsResponse, profits);
          this.renderAccounts(processedAccounts);
        } catch (error) {
          console.error(error);
        }
      });
    }
    fetchData(url) {
      return __awaiter5(this, void 0, void 0, function* () {
        const response = yield fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return yield response.json();
      });
    }
    renderAssets({ assets, accounts }, profits) {
      const element = this.querySelector(".assets");
      const buyPrices = accounts.map((account) => account.buy_price);
      const totalBuyPrice = buyPrices.reduce((a, b) => a + b, 0);
      const profitRate = profits / totalBuyPrice * 100;
      const contentData = {
        asset: roundToDecimalPlace(assets.balance + assets.locked, 0).toLocaleString(),
        unit: assets.unit_currency,
        totalAsset: roundToDecimalPlace(assets.balance + assets.locked + totalBuyPrice + profits, 0).toLocaleString(),
        buyPrice: roundToDecimalPlace(totalBuyPrice, 0).toLocaleString(),
        buyPriceReal: roundToDecimalPlace(totalBuyPrice + profits, 0).toLocaleString(),
        profits: roundToDecimalPlace(profits, 0).toLocaleString(),
        profitRate: `${roundToDecimalPlace(profitRate, 2)}%`,
        locked: roundToDecimalPlace(assets.locked, 0).toLocaleString()
      };
      updateElementsTextWithData(contentData, element);
      if (profits > 0)
        element.dataset.increase = "true";
      if (profits < 0)
        element.dataset.increase = "false";
      delete element.dataset.loading;
    }
    processAccountsData(accounts, tickerData, orderedObject) {
      function _formatData(account) {
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
          orderedData,
          tradePrice: ticker.trade_price
        };
      }
      return accounts.map((account) => _formatData(account)).filter((account) => account !== null);
    }
    renderAccounts(data) {
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
  customElements.define("order-ask", OrderAsk);
  customElements.define("ordered-item", OrderedItem);
})();
//# sourceMappingURL=index.js.map
