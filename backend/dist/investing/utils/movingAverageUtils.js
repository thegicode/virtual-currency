"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAboveAllMovingAverages = void 0;
function isAboveAllMovingAverages(currentPrice, movingAverages) {
    return (currentPrice > movingAverages.ma3 &&
        currentPrice > movingAverages.ma5 &&
        currentPrice > movingAverages.ma10 &&
        currentPrice > movingAverages.ma20);
}
exports.isAboveAllMovingAverages = isAboveAllMovingAverages;
