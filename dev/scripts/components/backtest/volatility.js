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
    const range = calculateVolatility(prevData);
    const standardPrice = openingPrice + range * k;
    const buyCondition = realPrice > standardPrice;
    return {
        range,
        standardPrice,
        buyCondition,
    };
}
function calculateVolatility(data) {
    return data.high_price - data.low_price;
}
function volatilityRate(data) {
    const range = calculateVolatility(data);
    return (range / data.opening_price) * 100;
}
export { getDaliyVolatility, getVolatility, volatilityBreakout, volatilityRate, };
//# sourceMappingURL=volatility.js.map