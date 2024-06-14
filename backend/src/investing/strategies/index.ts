// strategies
import { sendTelegramMessageToChatId } from "../../notifications";
import { afternoonRiseMorningInvestment } from "./afternoonRiseMorningInvestment";
import { averageNoiseRatioSignalCheck } from "./averageNoiseRatioSignalCheck";
import { checkDailyMovingAverage } from "./checkDailyMovingAverage";
import { checkMinutesMovingAverage } from "./checkMinutesMovingAverage";
import { fiveDayVolumeMA_VolatilityBreakout } from "./fiveDayVolumeMA_VolatilityBreakout";
import { marketTimingVolatilityBreakout } from "./marketTimingVolatilityBreakout";
import { executeMovingAverageAndVolatility } from "./movingAverageAndVolatility";
import { risingVolatilityBreakoutStrategy } from "./risingVolatilityBreakoutStrategy";
import { risingVolatilityBreakoutWithAdjustment } from "./risingVolatilityBreakoutWithAdjustment";
import { superRisingVolatilityBreakoutWithAdjustment } from "./superRisingVolatilityBreakoutWithAdjustment";
import { volatilityBreakoutStrategy } from "./volatilityBreakoutStrategy";

export {
    checkDailyMovingAverage,
    checkMinutesMovingAverage,
    executeMovingAverageAndVolatility,
};

(async () => {
    const markets = [
        // checkDailyMovingAverage
        // 일캔들 기준 5일 이동평균 확인
        // 오전 9시 확인
        // "KRW-AVAX",
        // "KRW-BTG",
        //
        // afternoonRiseMorningInvestment
        // 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절
        // // 밤 12시에 확인
        // "KRW-BTC",
        // "KRW-ETH",
        // "KRW-DOGE",
        // "KRW-SOL",
        // "KRW-BCH",
        // "KRW-THETA",
        // "KRW-NEAR",
        // "KRW-TFUEL", // 정리
        // "KRW-1INCH", // 정리
        //
        // 다자 가상화폐 + 상승장 + 변동성 돌파
        // risingVolatilityBreakoutStrategy
        // 낮 12시 확인?
        "KRW-DOT",
        "KRW-POLYX",
        "KRW-STX",
        "KRW-ZRX",
        "KRW-SHIB",
    ];

    const initialCapital = 100000;
    console.log("---------------------------------------------------");
    console.log("*** initialCapital: ", initialCapital.toLocaleString() + "원");
    console.log("---------------------------------------------------");

    // 분캔들 기준 이동평균 확인 - interval
    await checkMinutesMovingAverage(
        markets,
        60, // candleUnit minute(단위 분)
        10, // movingAveragePeriod
        (message) => {
            console.log(message);
            // sendTelegramMessageToChatId(message);
        }
    );

    await checkMinutesMovingAverage(
        markets,
        240, // candleUnit minute(단위 분)
        5, // movingAveragePeriod
        (message) => {
            console.log(message);
            // sendTelegramMessageToChatId(message);
        }
    );

    console.log("---------------------------------------------------");

    // 일캔들 기준 5일 이동평균 확인
    const result1 = await checkDailyMovingAverage(markets, 5);
    console.log(result1);
    // sendTelegramMessageToChatId(result1 as string);

    console.log("---------------------------------------------------");

    // 슈퍼상승장(3, 5, 10, 20일 이동평균) + 변동성 조절
    const results2 = await executeMovingAverageAndVolatility(
        markets,
        initialCapital,
        2
    );
    console.log(results2);

    console.log("---------------------------------------------------");

    // 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절
    const results3 = await afternoonRiseMorningInvestment(
        markets,
        initialCapital,
        2 // targetVolatility
    );
    console.log(results3);

    console.log("---------------------------------------------------");

    // 다자 가상화폐 + 변동성 돌파
    const results4 = await volatilityBreakoutStrategy(
        markets,
        initialCapital
        // k = 0.5
    );
    console.log(results4);

    console.log("---------------------------------------------------");

    // 다자 가상화폐 + 상승장 + 변동성 돌파
    const results5 = await risingVolatilityBreakoutStrategy(
        markets,
        initialCapital
        // k = 0.5
    );
    console.log(results5);

    console.log("---------------------------------------------------");

    // *** 상승장 + 변동성 돌파 + 변동성 조절
    const results6 = await risingVolatilityBreakoutWithAdjustment(
        markets,
        initialCapital
        // k = 0.5
        // targetRate = 0.02
    );
    console.log(results6);

    console.log("---------------------------------------------------");

    // 수퍼상승장 + 변동성 돌파 + 변동성 조절
    const results7 = await superRisingVolatilityBreakoutWithAdjustment(
        markets,
        initialCapital
        // k = 0.5
        // targetRate = 0.02
    );
    console.log(results7);

    // 5일 이동평균 & 5일 거래량 상승장 + 변동성 돌파 + 변동성 조절
    const results8 = await fiveDayVolumeMA_VolatilityBreakout(
        markets,
        initialCapital
        // k = 0.7
        // targetRate = 0.02
    );
    console.log(results8);

    // 다자 가상화폐 + 평균 노이즈 비율 : 변동성 돌파에 유리한 종목을 노이즈 비율로 걸러낸다.
    const results9 = await averageNoiseRatioSignalCheck(
        markets,
        initialCapital
        // k = 0.5
        // targetRate = 0.01
    );
    console.log(results9);

    // 평균 노이즈 비율 + 마켓 타이밍 + 변동성 돌파

    const results10 = await marketTimingVolatilityBreakout(
        markets,
        initialCapital,
        0.03 // targetRate = 0.02
    );
    console.log(results10);
})();
