import { afternoonRiseMorningInvestmentBacktest } from "./afternoonRiseStrategyBacktest";
import { checkDailyMovingAverageBacktest } from "./checkDailyMovingAverageBacktest";
import { checkMinutesMovingAverageBacktest } from "./checkMinutesMovingAverageBacktest";
import { movingAverageAndVolatilityBacktest } from "./movingAverageAndVolatilityBacktest";

// Run backtest

(async () => {
    try {
        const initialCapital = 100000; // 초기 자본
        const markets = [
            // "KRW-BTC",
            // "KRW-ETH",
            // "KRW-SOL",
            // "KRW-AVAX",
            "KRW-DOGE",
            // "KRW-BCH",
            // "KRW-ZRX",
            // "KRW-THETA",
            // "KRW-CTC",
            // "KRW-NEAR",
            // "KRW-BTG",
            // "KRW-AVAX",
            // "KRW-SHIB",
            // "KRW-SBD",
        ];
        const apiCounts = 30;

        console.log("-----------------------------------------");

        console.log("initialCapital : ", initialCapital);

        console.log("-----------------------------------------");

        // checkMinutesMovingAverage;
        await checkMinutesMovingAverageBacktest(
            markets,
            60, // candleUnit, 인터벌 시간 단위
            5, //  movingAveragePeriod, 이동평균 단위
            initialCapital, // 초기 자본
            apiCounts
        );

        console.log("-----------------------------------------");

        // checkMinutesMovingAverage
        /* await checkMinutesMovingAverageBacktest(
            markets,
            240, // candleUnit, 인터벌 시간 단위
            10, //  movingAveragePeriod, 이동평균 단위
            initialCapital, // 초기 자본
            apiCounts
        ); */

        // console.log("-----------------------------------------");

        // checkMinutesMovingAverage
        await checkMinutesMovingAverageBacktest(
            markets,
            240, // candleUnit, 인터벌 시간 단위
            5, //  movingAveragePeriod, 이동평균 단위
            initialCapital, // 초기 자본
            apiCounts
        );

        console.log("-----------------------------------------");

        // checkDailyMovingAverage
        // KRW-BTC, "KRW-SBD",  "KRW-CTC", "KRW-ZRX", "KRW-BTG", "KRW-THETA",
        await checkDailyMovingAverageBacktest(
            markets, // markets
            5, // period
            initialCapital,
            apiCounts
        );

        console.log("-----------------------------------------");

        // movingAverageAndVolatility
        await movingAverageAndVolatilityBacktest(
            markets,
            initialCapital,
            apiCounts
            // targetVolatility: number = 2,
        );

        console.log("-----------------------------------------");

        // afternoonRiseMorningInvestmentBacktest
        // KRW-DOGE,  "KRW-SBD",
        await afternoonRiseMorningInvestmentBacktest(
            markets,
            initialCapital,
            apiCounts
            // 2 // targetVolatility = 2
        );
    } catch (error) {
        console.error("Error during backtesting: ", error);
    }
})();

export { checkDailyMovingAverageBacktest };
