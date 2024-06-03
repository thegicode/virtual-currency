"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPrice = void 0;
const formatPrice = (price) => {
    if (!price)
        return 0;
    return price > 1 ? Math.round(price).toLocaleString() : price.toFixed(5);
};
exports.formatPrice = formatPrice;
