import { afternoonRiseMorningInvestmentBacktest } from "./afternoonRiseStrategyBacktest";
import { checkDailyMovingAverageBacktest } from "./checkDailyMovingAverageBacktest";
import { checkMinutesMovingAverageBacktest } from "./checkMinutesMovingAverageBacktest";
import { movingAverageAndVolatilityBacktest } from "./movingAverageAndVolatilityBacktest";

// Run backtest

(async () => {
    try {
        const initialCapital = 1000000; // 초기 자본
        const markets = [
            "KRW-BTC",
            "KRW-ETH",
            "KRW-SOL",
            "KRW-AVAX",
            "KRW-DOGE",
            //
            // "KRW-BCH",
            // "KRW-ZRX", // daily, afternoon
            // "KRW-THETA",
            // "KRW-NEAR",
            // "KRW-BTG",
            // "KRW-SHIB",
            //
            // wiil deleted
            // "KRW-SBD",
        ];
        const resultCounts = 100;

        console.log("-----------------------------------------");

        console.log("initialCapital : ", initialCapital);
        console.log("resultCounts : ", resultCounts);

        console.log("-----------------------------------------");

        // checkMinutesMovingAverage;
        /* await checkMinutesMovingAverageBacktest(
            markets,
            60, // candleUnit, 인터벌 시간 단위
            5, //  movingAveragePeriod, 이동평균 단위
            initialCapital, // 초기 자본
            resultCounts
        ); */

        await checkMinutesMovingAverageBacktest(
            markets,
            60, // candleUnit, 인터벌 시간 단위
            10, //  movingAveragePeriod, 이동평균 단위
            initialCapital, // 초기 자본
            resultCounts
        );

        // checkMinutesMovingAverage
        await checkMinutesMovingAverageBacktest(
            markets,
            240, // candleUnit, 인터벌 시간 단위
            5, //  movingAveragePeriod, 이동평균 단위
            initialCapital, // 초기 자본
            resultCounts
        );

        // checkMinutesMovingAverage
        /* await checkMinutesMovingAverageBacktest(
            markets,
            240, // candleUnit, 인터벌 시간 단위
            10, //  movingAveragePeriod, 이동평균 단위
            initialCapital, // 초기 자본
            resultCounts
        ); */

        console.log("-----------------------------------------");

        // checkDailyMovingAverage
        // "KRW-AVAX", "KRW-BCH", "KRW-ZRX", "KRW-THETA", "KRW-NEAR", "KRW-BTG",  "KRW-SHIB",
        await checkDailyMovingAverageBacktest(
            markets, // markets
            5, // period
            initialCapital,
            resultCounts
        );

        console.log("-----------------------------------------");

        // movingAverageAndVolatility
        await movingAverageAndVolatilityBacktest(
            markets,
            initialCapital,
            resultCounts
            // targetVolatility: number = 2,
        );

        console.log("-----------------------------------------");

        // afternoonRiseMorningInvestmentBacktest
        // "KRW-BTC", "KRW-ETH", "KRW-SOL", "KRW-DOGE", "KRW-SBD",
        await afternoonRiseMorningInvestmentBacktest(
            markets,
            initialCapital,
            resultCounts,
            2 // targetVolatility = 2
        );
    } catch (error) {
        console.error("Error during backtesting: ", error);
    }
})();

export { checkDailyMovingAverageBacktest };
