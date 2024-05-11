// 변동성 구하기

function getDaliyVolatility(aData: any) {
    const result =
        ((aData.high_price - aData.low_price) / aData.opening_price) * 100;

    return Number(result.toFixed(2));
}

function getVolatility(dataList: any, index: number) {
    if (index < 5) {
        return;
    }

    let sum = 0;

    // for (let i = 5; i > 0; i--) {
    //     sum += dataList[index - i].daily_volatility;
    // }

    for (let i = index - 5; i < index; i++) {
        sum += dataList[i].daily_volatility;
    }

    return Number((sum / 5).toFixed(2));
}

//
function volatilityBreakout(
    prevData: { high_price: number; low_price: number },
    realPrice: number,
    openingPrice: number,
    k: number
) {
    // 1. 전날 하루만에 움직인 최대폭
    const range = calculateVolatility(prevData);

    // 2. 매수 기준 : 실시간 가격 > 당일 시가 + (레인지 * k)
    const standardPrice = openingPrice + range * k;

    const buyCondition = realPrice > standardPrice;

    return {
        range,
        standardPrice,
        buyCondition,
    };
}

function calculateVolatility(data: any) {
    return data.high_price - data.low_price;
}

function volatilityRate(data: any) {
    const range = calculateVolatility(data);
    return (range / data.opening_price) * 100; // 시가 기준 변동률
}

export {
    getDaliyVolatility,
    getVolatility,
    volatilityBreakout,
    volatilityRate,
};
