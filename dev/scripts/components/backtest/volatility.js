function getDaliyVolatility(aData) {
    const result = ((aData.high_price - aData.low_price) / aData.opening_price) * 100;
    return Number(result.toFixed(2));
}
function getVolatility(dataList, index) {
    if (index < 5) {
        return;
    }
    let sum = 0;
    for (let i = index - 5; i < index; i++) {
        sum += dataList[i].daily_volatility;
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