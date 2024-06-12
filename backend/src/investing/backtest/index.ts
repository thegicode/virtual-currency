import { afternoonRiseMorningInvestmentBacktest } from "./afternoonRiseStrategyBacktest";
import { averageNoiseRatioSignalCheckBacktest } from "./averageNoiseRatioSignalCheckBacktest";
import { checkDailyMovingAverageBacktest } from "./checkDailyMovingAverageBacktest";
import { checkMinutesMovingAverageBacktest } from "./checkMinutesMovingAverageBacktest";
import { fiveDayVolumeMA_VolatilityBreakoutBactest } from "./fiveDayVolumeMA_VolatilityBreakoutBactest";
import { movingAverageAndVolatilityBacktest } from "./movingAverageAndVolatilityBacktest";
import { risingVolatilityBreakoutBacktest } from "./risingVolatilityBreakoutBacktest";
import { risingVolatilityBreakoutWithAdjustmentBacktest } from "./risingVolatilityBreakoutWithAdjustmentBacktest";
import { superRisingVolatilityBreakoutWithAdjustmentBacktest } from "./superRisingVolatilityBreakoutWithAdjustmentBacktest";
import { volatilityBreakoutBacktest } from "./volatilityBreakoutBacktest";

// Run backtest

(async () => {
    try {
        const initialCapital = 1000000; // 초기 자본
        const resultCounts = 200;
        const markets = [
            // 분캔들
            // checkMinutesMovingAverageBacktest
            // "KRW-SHIB", - 상승 시  매수신호를 일찍 감지
            // 일캔들 기준 5일 이동평균 확인
            // checkDailyMovingAverage
            // 오전 9시 확인
            // "KRW-AVAX", // 18.59%, 72.79%, 2차 volatilityBreakoutBacktest
            // "KRW-BTG", //  100.36%, 215.95%, 2차  다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절 backtest
            //
            // 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절
            // afternoonRiseMorningInvestment
            // 밤 12시에 확인
            // "KRW-BTC", // 22.85%, 63.98%
            // "KRW-ETH", // 30.44%, 60.26%
            // "KRW-DOGE", // 168.27%, 147.72%
            // "KRW-SOL",
            // "KRW-BCH", // 72.78%
            // "KRW-TFUEL", // 157.41%, 171.73%
            // "KRW-1INCH", // 32.58%, 123.41%
            // "KRW-THETA", // 49.7%
            // "KRW-NEAR", // 46.04%
            // "KRW-SHIB", // 임시 최종은 risingVolatilityBreakoutBacktest
            //
            // 다자 가상화폐 + 상승장 + 변동성 돌파
            // risingVolatilityBreakoutBacktest,
            // "KRW-DOT",
            "KRW-POLYX",
            // "KRW-STX",
            // "KRW-ZRX", // 68.53%
            // "KRW-SHIB", // 30 ->

            // "KRW-AERGO",
        ];

        console.log("-----------------------------------------");
        console.log("initialCapital : ", initialCapital);
        console.log("resultCounts : ", resultCounts);
        console.log("-----------------------------------------");

        // 분캔들 기준 이동평균 확인 - interval
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

        /* await checkMinutesMovingAverageBacktest(
            markets,
            240, // candleUnit, 인터벌 시간 단위
            5, //  movingAveragePeriod, 이동평균 단위
            initialCapital, // 초기 자본
            resultCounts
        ); */

        await checkMinutesMovingAverageBacktest(
            markets,
            240, // candleUnit, 인터벌 시간 단위
            10, //  movingAveragePeriod, 이동평균 단위
            initialCapital, // 초기 자본
            resultCounts
        );

        console.log("-----------------------------------------");

        // 일캔들 기준 5일 이동평균 확인
        await checkDailyMovingAverageBacktest(
            markets, // markets
            5, // period
            initialCapital,
            resultCounts
        );

        console.log("-----------------------------------------");

        // 슈퍼상승장(3, 5, 10, 20일 이동평균) + 변동성 조절
        //
        await movingAverageAndVolatilityBacktest(
            markets,
            initialCapital,
            resultCounts
            // targetVolatility: number = 2,
        );

        console.log("-----------------------------------------");

        // 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절
        await afternoonRiseMorningInvestmentBacktest(
            markets,
            initialCapital,
            resultCounts,
            2 // targetVolatility = 2
        );

        // 다자 가상화폐 + 변동성 돌파
        await volatilityBreakoutBacktest(
            markets,
            initialCapital,
            resultCounts
            // k: number = 0.5,
            // transactionFee: number = 0.002 // 0.2%
        );

        // 다자 가상화폐 + 상승장 + 변동성 돌파
        await risingVolatilityBreakoutBacktest(
            markets,
            initialCapital,
            resultCounts
            // k: number = 0.5,
            // transactionFee: number = 0.002 // 0.2%
        );

        // 상승장 + 변동성 돌파 + 변동성 조절
        await risingVolatilityBreakoutWithAdjustmentBacktest(
            markets,
            initialCapital,
            resultCounts
            // k: number = 0.5,
            // targetRate: number = 0.02
            // transactionFee: number = 0.002 // 0.2%
        );

        // 상승장 + 변동성 돌파 + 변동성 조절
        await superRisingVolatilityBreakoutWithAdjustmentBacktest(
            markets,
            initialCapital,
            resultCounts
            // k: number = 0.5,
            // targetRate: number = 0.02
            // transactionFee: number = 0.002 // 0.2%
        );

        // 5일 이동평균 & 5일 거래량 상승장 + 변동성 돌파 + 변동성 조절
        await fiveDayVolumeMA_VolatilityBreakoutBactest(
            markets,
            initialCapital,
            resultCounts
            // k: number = 0.7,
            // targetRate: number = 0.02
            // transactionFee: number = 0.002 // 0.2%
        );

        // 다자 가상화폐 + 평균 노이즈 비율
        await averageNoiseRatioSignalCheckBacktest(
            markets,
            initialCapital,
            resultCounts
            // k: number = 0.7,
            // targetRate: number = 0.02
            // transactionFee: number = 0.002 // 0.2%
        );
    } catch (error) {
        console.error("Error during backtesting: ", error);
    }
})();

export { checkDailyMovingAverageBacktest };
