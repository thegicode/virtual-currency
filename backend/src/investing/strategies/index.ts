import { checkDailyMovingAverage } from "./checkDailyMovingAverage";
import { checkMinutesMovingAverage } from "./checkMinutesMovingAverage";

export { checkDailyMovingAverage, checkMinutesMovingAverage };

(() => {
    const markets = ["KRW-BTC", "KRW-ETH", "KRW-SOL", "KRW-AVAX", "KRW-DOGE"];
    // 일캔들 기준 5일 이동평균 확인
    // checkDailyMovingAverage(markets, 5);

    // 분캔들 기준 이동평균 확인
    checkMinutesMovingAverage(
        markets,
        60, // candleUnit minute
        10 // movingAveragePeriod
    );
})();
