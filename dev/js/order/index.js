"use strict";
(() => {
  // src/scripts/components/Nav.ts
  var Nav = class {
    constructor() {
      this.render();
    }
    render() {
      console.log("Nav render");
    }
  };

  // dev/scripts/pages/order/Base.js
  var Base = class {
    constructor(name) {
      this.name = name;
    }
    log() {
      console.log("Nav", Nav);
      return this.name;
    }
  };

  // dev/scripts/pages/order/index.js
  console.log("Base", Base);
})();
//# sourceMappingURL=index.js.map
