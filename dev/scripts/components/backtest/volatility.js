function getDaliyVolatility(aData) {
    const result = ((aData.high_price - aData.low_price) / aData.opening_price) * 100;
    return result;
}
function getVolatility(dataList, index) {
    if (index < 5) {
        return;
    }
    let sum = 0;
    for (let i = index - 5; i < index; i++) {
        sum += dataList[i].daily_volatility;
    }
    return sum / 5;
}
function volatilityBreakout(prevCandle, realPrice, openingPrice, k) {
    const range = prevCandle.high_price - prevCandle.low_price;
    const standardPrice = openingPrice + range * k;
    const isBreakout = realPrice > standardPrice;
    const prevVolatilityRate = (range / prevCandle.opening_price) * 100;
    return {
        range,
        standardPrice,
        buyCondition: isBreakout,
        isBreakout,
        prevVolatilityRate,
    };
}
export { getDaliyVolatility, getVolatility, volatilityBreakout };
//# sourceMappingURL=volatility.js.map