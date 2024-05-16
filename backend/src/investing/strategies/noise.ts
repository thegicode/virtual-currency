// 노이즈 계산하기

// const apis = require("../../../../apis/candles");

// 1day 노이즈 = 1 - abs(시가 - 종가)/(고가 - 저가)
function calculateNoise(candle: ICandle) {
    const range = candle.high_price - candle.low_price;
    const body = candle.opening_price - candle.trade_price;
    return 1 - Math.abs(body) / range;
}

// 노이즈 평균 계산하기
function calculateAverageNoise(candles: ICandle[]) {
    const noiseValues = candles.map(calculateNoise);
    const totalNoise = noiseValues.reduce((sum, noise) => sum + noise, 0);
    return totalNoise / noiseValues.length;
}

/* async function test() {
    const searchParams = {
        market: "KRW-XRP",
        count: "30",
    };

    const candleList = await apis.candles(searchParams);
    const result = calculateAverageNoise(candleList);
    console.log(result);
}

test(); */

export { calculateAverageNoise };
