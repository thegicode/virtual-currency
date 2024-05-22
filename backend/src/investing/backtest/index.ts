import { checkDailyMovingAverageBacktest } from "./checkDailyMovingAverageBacktest";
import { checkMinutesMovingAverageBacktest } from "./checkMinutesMovingAverageBacktest";

// Run backtest

(async () => {
    try {
        const initialCapital = 10000; // 초기 자본
        const markets = [
            "KRW-BTC",
            "KRW-ETH",
            "KRW-SOL",
            "KRW-AVAX",
            "KRW-DOGE",
        ];

        // checkDailyMovingAverage
        await checkDailyMovingAverageBacktest(
            markets, // markets
            5, // period
            initialCapital
        );

        console.log("-----------------------------------------");

        // checkMinutesMovingAverage
        await checkMinutesMovingAverageBacktest(
            markets,
            60, // candleUnit, 인터벌 시간 단위
            10, //  이동평균 단위
            initialCapital // 초기 자본
        );
    } catch (error) {
        console.error("Error during backtesting: ", error);
    }
})();

export { checkDailyMovingAverageBacktest };
