import { checkDailyMovingAverage } from "./strategies";
import { checkMinutesMovingAverage } from "./strategies/checkMinutesMovingAverage";

(() => {
    // 일캔들 기준 5일 이동평균 확인
    // checkDailyMovingAverage(
    //     ["KRW-BTC", "KRW-ETH", "KRW-XRP", "KRW-SBD", "KRW-DOGE"],
    //     5
    // );

    // 분캔들 기준 이동평균 확인
    checkMinutesMovingAverage(
        ["KRW-BTC", "KRW-ETH", "KRW-SBD"],
        240, // candleUnit minute
        5 // movingAveragePeriod
    );
})();
