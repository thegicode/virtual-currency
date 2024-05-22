import { checkDailyMovingAverage } from "./strategies";
import { scheduleMA5Trade240Execution } from "./strategies/executeMA5Trade240";

(() => {
    // 240분캔들 기준 5 이동평균 확인
    scheduleMA5Trade240Execution(["KRW-BTC", "KRW-ETH", "KRW-SBD"]);

    // 일캔들 기준 5일 이동평균 확인
    // checkDailyMovingAverage(
    //     ["KRW-BTC", "KRW-ETH", "KRW-XRP", "KRW-SBD", "KRW-DOGE"],
    //     5
    // );
})();
