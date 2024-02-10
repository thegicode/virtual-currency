"use strict";
(() => {
  // dev/scripts/pages/second/Base.js
  var Base = class {
    constructor(name) {
      this.name = name;
    }
    log() {
      return this.name;
    }
  };

  // dev/scripts/pages/second/index.js
  console.log("Base", Base);
})();
//# sourceMappingURL=index.js.map
