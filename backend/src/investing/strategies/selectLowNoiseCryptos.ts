// 노이즈 값이 가장 작은 n개 선정

// const apis = require("../../../../apis/candles");
import { calculateAverageNoise } from "./noise";

function selectLowNoiseCryptos(cryptos: ICrypto[], n: number) {
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
    const markets = ["KRW-XRP", "KRW-BTC"];
    const promises = markets.map(async (market) => {
        const searchParams = {
            market,
            count: "30",
        };
        const candleList = (await apis.candles(searchParams)) as ICandle[];
        return {
            symbol: market,
            candles: candleList,
        };
    });

    const data = await Promise.all(promises);
    const result = selectLowNoiseCryptos(data, 3);

    console.log(result);
}

test(); */

export { selectLowNoiseCryptos };
