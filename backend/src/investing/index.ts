import { checkDailyMovingAverage } from "./strategies";
import { schedule4HourMA5TradeExecution } from "./strategies/execute4HourMA5Trade";

(() => {
    // 240분캔들 기준 5 이동평균 확인
    schedule4HourMA5TradeExecution(["KRW-BTC", "KRW-ETH", "KRW-SBD"]);

    // 일캔들 기준 5일 이동평균 확인
    // checkDailyMovingAverage(
    //     ["KRW-BTC", "KRW-ETH", "KRW-XRP", "KRW-SBD", "KRW-DOGE"],
    //     5
    // );
})();
