// 노이즈 계산하기

// const apis = require("../../../../apis/candles");

// 1day 노이즈 = 1 - abs(시가 - 종가)/(고가 - 저가)
function calculateNoise(candle: ICandle) {
    const range = candle.high_price - candle.low_price;
    const body = candle.opening_price - candle.trade_price;
    return 1 - Math.abs(body) / range;
}

// 노이즈 평균 계산하기
export function calculateAverageNoise(candles: ICandle[]) {
    const noiseValues = candles.map(calculateNoise);
    const totalNoise = noiseValues.reduce((sum, noise) => sum + noise, 0);
    return totalNoise / noiseValues.length;
}

// 노이즈 값이 가장 작은 n개 선정
export function selectLowNoiseCryptos(cryptos: ICrypto[], n: number) {
    const cryptowithNoise = cryptos.map((crypto) => {
        const averageNoise = calculateAverageNoise(crypto.candles);
        return {
            ...crypto,
            averageNoise,
        };
    });

    cryptowithNoise.sort((a, b) => a.averageNoise - b.averageNoise);

    return cryptowithNoise.slice(0, n);
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
