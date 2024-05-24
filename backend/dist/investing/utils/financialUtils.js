"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRiskAdjustedCapital = void 0;
function calculateRiskAdjustedCapital(targetVolatility, volatility, count, initialCapital) {
    if (volatility === 0 || count === 0) {
        return 0;
    }
    return (targetVolatility / volatility / count) * initialCapital;
}
exports.calculateRiskAdjustedCapital = calculateRiskAdjustedCapital;
