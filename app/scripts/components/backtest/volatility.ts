// 변동성 구하기

function getDaliyVolatility(aData: any) {
    const result =
        ((aData.high_price - aData.low_price) / aData.opening_price) * 100;

    return result;
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

    return sum / 5;
}

// 5, 6, 7
// to Name :  calculateBreakoutThreshold
function volatilityBreakout(
    prevCandle: {
        high_price: number;
        low_price: number;
        opening_price: number;
    },
    realPrice: number,
    openingPrice: number,
    k: number
) {
    // 1. 전날 하루만에 움직인 최대폭
    const range = prevCandle.high_price - prevCandle.low_price;

    //  2. 돌파 가격 : 당일 시가 + (레인지 * k)
    const standardPrice = openingPrice + range * k;

    // 3. 매수 기준 : 실시간 가격 > 당일 시가 + (레인지 * k)
    const isBreakout = realPrice > standardPrice;

    // 4. 전일 변동성
    const prevVolatilityRate = (range / prevCandle.opening_price) * 100;

    return {
        range,
        standardPrice,
        buyCondition: isBreakout, // to delete
        isBreakout,
        prevVolatilityRate,
    };
}

export { getDaliyVolatility, getVolatility, volatilityBreakout };
