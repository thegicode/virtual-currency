import { checkDailyMovingAverage } from "./strategies";
import { scheduleMovingAverageTrades } from "./strategies/scheduleMovingAverageTrades";

(() => {
    // 240분캔들 기준 5 이동평균 확인
    scheduleMovingAverageTrades(
        ["KRW-BTC", "KRW-ETH", "KRW-SBD"],
        240, // candleUnit minute
        5 // movingAveragePeriod
    );

    // 일캔들 기준 5일 이동평균 확인
    // checkDailyMovingAverage(
    //     ["KRW-BTC", "KRW-ETH", "KRW-XRP", "KRW-SBD", "KRW-DOGE"],
    //     5
    // );
})();
