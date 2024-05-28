// import { sendTelegramMessageToChatId } from "../../notifications";
import { afternoonRiseMorningInvestment } from "./afternoonRiseMorningInvestment";
import { checkDailyMovingAverage } from "./checkDailyMovingAverage";
import { checkMinutesMovingAverage } from "./checkMinutesMovingAverage";
import { executeMovingAverageAndVolatility } from "./movingAverageAndVolatility";

export {
    checkDailyMovingAverage,
    checkMinutesMovingAverage,
    executeMovingAverageAndVolatility,
};

(async () => {
    const markets = [
        "KRW-BTC",
        "KRW-ETH",
        "KRW-SOL",
        "KRW-XRP",
        "KRW-DOGE",
        // "KRW-SBD",

        /*  "KRW-BCH",
        "KRW-AVAX",
        "KRW-SHIB",
        "KRW-NEAR",

        "KRW-GRS",
        "KRW-CTC",
        "KRW-ZRX",
        "KRW-BTG",
        "KRW-THETA", */
    ];

    const initialCapital = 1000000;
    console.log("---------------------------------------------------");
    console.log("*** initialCapital: ", initialCapital.toLocaleString() + "원");
    console.log("---------------------------------------------------");

    // 분캔들 기준 이동평균 확인 - interval
    await checkMinutesMovingAverage(
        markets,
        60, // candleUnit minute(단위 분)
        10, // movingAveragePeriod
        (message) => console.log(message)
    );

    await checkMinutesMovingAverage(
        markets,
        240, // candleUnit minute(단위 분)
        10, // movingAveragePeriod
        (message) => console.log(message)
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
        initialCapital
        // 2 // targetVolatility
    );
    console.log(results3);
})();
