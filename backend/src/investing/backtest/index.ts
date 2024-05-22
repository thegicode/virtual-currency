import { checkDailyMovingAverageBacktest } from "./checkDailyMovingAverageBacktest";
import { checkMinutesMovingAverageBacktest } from "./checkMinutesMovingAverageBacktest";

// Run backtest

(async () => {
    try {
        const markets = [
            "KRW-BTC",
            "KRW-ETH",
            "KRW-DOGE",
            "KRW-XRP",
            "KRW-SBD",
        ];
        const initialCapital = 10000; // 초기 자본

        // checkDailyMovingAverage
        /*  await checkDailyMovingAverageBacktest(
            markets, // markets
            5, // period
            initialCapital
        ); */

        console.log("-----------------------------------------\n");

        // checkMinutesMovingAverage
        await checkMinutesMovingAverageBacktest(
            markets,
            240, // candleUnit, 4시간 단위
            5, //  이동평균 단위
            initialCapital // 초기 자본
        );
    } catch (error) {
        console.error("Error during backtesting: ", error);
    }
})();

export { checkDailyMovingAverageBacktest };
