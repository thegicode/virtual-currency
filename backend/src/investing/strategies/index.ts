import { checkDailyMovingAverage } from "./checkDailyMovingAverage";
import { checkMinutesMovingAverage } from "./checkMinutesMovingAverage";
import { executeMovingAverageAndVolatility } from "./movingAverageAndVolatility";

export { checkDailyMovingAverage, checkMinutesMovingAverage };

(async () => {
    const markets = [
        "KRW-BTC",
        "KRW-ETH",
        "KRW-DOGE",
        "KRW-SOL",
        "KRW-BCH",
        // "KRW-XRP",
        // "KRW-GRS",
        // "KRW-CTC",
        // "KRW-ZRX",
        // "KRW-NEAR",
        // "KRW-BTG",
        // "KRW-THETA",
        // "KRW-AVAX",
        // "KRW-SHIB",
    ];

    const initialCapital = 1000000;

    // 일캔들 기준 5일 이동평균 확인
    /*  const result1 = await checkDailyMovingAverage(markets, 5);
    console.log(result1);
 */
    // 분캔들 기준 이동평균 확인 - interval
    /*  await checkMinutesMovingAverage(
        markets,
        60, // candleUnit minute(단위 분)
        10, // movingAveragePeriod
        (message) => console.log(message)
    ); */

    // 슈퍼상승장(3, 5, 10, 20일 이동평균) + 변동성 조절
    const results3 = await executeMovingAverageAndVolatility(
        markets,
        initialCapital,
        2
    );
    console.log(results3);
})();
