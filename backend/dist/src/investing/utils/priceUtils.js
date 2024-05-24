"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPrice = void 0;
const formatPrice = (price) => {
    return price > 1 ? price.toLocaleString() : price.toFixed(5);
};
exports.formatPrice = formatPrice;