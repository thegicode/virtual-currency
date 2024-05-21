import { checkDailyMovingAverage } from "./checkDailyMovingAverage";
import {
    executeMA5Trade240,
    scheduleMA5Trade240Execution,
} from "./executeMA5Trade240";

export {
    checkDailyMovingAverage,
    executeMA5Trade240,
    scheduleMA5Trade240Execution,
};

// 일봉 기준 5일 이동 평균선 확인
checkDailyMovingAverage(
    ["KRW-BTC", "KRW-ETH", "KRW-XRP", "KRW-SBD", "KRW-DOGE"],
    5
);
