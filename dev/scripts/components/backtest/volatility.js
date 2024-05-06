function getDaliyVolatility(aData) {
    const result = ((aData.high_price - aData.low_price) / aData.opening_price) * 100;
    return Number(result.toFixed(2));
}
function getVolatility(data, aData, index) {
    let sum = 0;
    if (index < 5) {
        return;
    }
    for (let i = 5; i > 0; i--) {
        sum += data[index - i].daily_volatility;
    }
    return Number((sum / 5).toFixed(2));
}
function volatilityBreakout(prevData, realPrice, openingPrice, k) {
    const range = prevData.high_price - prevData.low_price;
    const standardPrice = openingPrice + range * k;
    const buyCondition = realPrice > standardPrice;
    return {
        range,
        standardPrice,
        buyCondition,
    };
}
export { getDaliyVolatility, getVolatility, volatilityBreakout };
//# sourceMappingURL=volatility.js.map