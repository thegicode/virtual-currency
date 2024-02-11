"use strict";
(() => {
  // dev/scripts/pages/accounts/AppAccounts.js
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
  var AppAccounts = class extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      console.log("AppAccounts");
      this.fetchData();
    }
    fetchData() {
      return __awaiter(this, void 0, void 0, function* () {
        try {
          const result = yield fetch(`/accounts`);
          const data = yield result.json();
          this.render(data);
        } catch (error) {
          console.error(error);
        }
      });
    }
    render(data) {
      console.log(data);
    }
  };

  // dev/scripts/pages/accounts/index.js
  customElements.define("app-accounts", AppAccounts);
})();
//# sourceMappingURL=index.js.map
