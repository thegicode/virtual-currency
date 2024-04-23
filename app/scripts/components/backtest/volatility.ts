// 변동성 구하기

function getDaliyVolatility(aData: any) {
    const result =
        ((aData.high_price - aData.low_price) / aData.opening_price) * 100;
    return Number(result.toFixed(2));
}

function getVolatility(data: any, aData: any, index: number) {
    let sum = 0;

    if (index < 5) {
        return;
    }

    // console.log("index", index);

    for (let i = 5; i > 0; i--) {
        // console.log(index - i);
        sum += data[index - i].daily_volatility;
    }

    return Number((sum / 5).toFixed(2));
}

export { getDaliyVolatility, getVolatility };
