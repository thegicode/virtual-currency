// fiveDayVolumeMA_VolatilityBreakout

/**
 * 투자전략 : 5일 이동평균 & 5일 거래량 상승장 + 변동성 돌파 + 변동성 조절
 * 투자대상 : 아무 가상화폐 몇 개 선택
 * 거래비용  : 0.2% 적용
 * 투자전략 :
 *      - 각 화폐의 레인지 계산 (전일 고가 - 저가)
 *      - 각 화폐의 가격이 5일 이동 평균보다 높은지 여부 파악
 *      - 각 화폐의 전일 거래량이 5일 거래량 이동평균보다 많은지 여부 파악
 *          - 둘 중 하나라도 낮을 경우 그날 투자 대상에서 제외
 *      - 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
 *          - 필자들은 k=0.7 추천
 *      - 자금관리 : 가상화폐별 투입 금액은 (타깃 변동성 / 전일 변동성)/투자 대상 가상화폐 수
 * 매도 : 다음날 시가
 */

import { fetchDailyCandles } from "../../services/api";
import {
    calculateAdjustedInvestment,
    calculateMovingAverage,
    calculateMovingAverage2,
    calculateRange,
    calculateVolumeAverage,
    checkBreakout,
    formatPrice,
} from "../utils";

interface IResult {
    market: string;
    date: string;
    signal: string;
    price: number;
    range: number;
    prevVolatilityRate: string;
    investment: number;
}

export async function fiveDayVolumeMA_VolatilityBreakout(
    markets: string[],
    initialCapital: number,
    k: number = 0.7,
    targetRate: number = 0.02
) {
    try {
        const capital = initialCapital / markets.length;
        const results = await Promise.all(
            markets.map(
                async (market: string) =>
                    await generateSignal(
                        market,
                        capital,
                        k,
                        targetRate,
                        markets.length
                    )
            )
        );

        return createMessage(results);
    } catch (error) {
        console.error("Error fiveDayVolumeMA_VolatilityBreakout: ", error);
        return "Error in executing the strategy.";
    }
}

async function generateSignal(
    market: string,
    capital: number,
    k: number,
    targetRate: number,
    size: number
) {
    const period = 5;

    // fetch data
    const candles = await fetchDailyCandles(market, (period + 1).toString());

    if (candles.length < 6) {
        console.warn(`Not enough data for ${market}`);
        // return { market, signal: "No Data" };
    }

    const prevCandle = candles[candles.length - 2];
    const currentCandle = candles[candles.length - 1];
    const last5Candles = candles.slice(-6, -1);

    // console.log("prevCandle", prevCandle); // 5
    // console.log("currentCandle", currentCandle); // 6
    // console.log("last5Candles", last5Candles); // 1-5

    // 각 화폐의 레인지 계산 (전일 고가 - 저가)
    const range = calculateRange(prevCandle);

    // 각 화폐의 가격이 5일 이동 평균보다 높은지 여부 파악
    const priceMovingAverage = calculateMovingAverage2(last5Candles, period);
    const isOverPriceAverage = currentCandle.trade_price > priceMovingAverage;

    // 각 화폐의 전일 거래량이 5일 거래량 이동평균보다 많은지 여부 파악
    const volumeAverage = calculateVolumeAverage(last5Candles);
    const isOverVolumeAverage =
        prevCandle.candle_acc_trade_volume > volumeAverage;

    // 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
    const isBreakOut = checkBreakout(currentCandle, range, k);

    // 매수 신호 확인
    const isBuySign =
        isOverPriceAverage && isOverVolumeAverage && isBreakOut ? true : false;

    // 투자 금액
    const { investment, prevVolatilityRate } = calculateAdjustedInvestment(
        range,
        prevCandle,
        targetRate,
        size,
        capital
    );

    return {
        market,
        date: currentCandle.date_time,
        range,
        price: currentCandle.trade_price,
        signal: isBuySign ? "매수 또는 유지" : "매도 또는 유보",
        prevVolatilityRate: (prevVolatilityRate * 100).toFixed(2),
        investment: isBuySign ? investment : 0,
    };
}

function createMessage(results: IResult[]) {
    const title = `\n 🔔  5일 이동평균 & 5일 거래량 상승장 + 변동성 돌파 + 변동성 조절\n`;
    const memo = `- 오전 9시 확인 \n\n`;

    const message = results
        .map((result) => {
            return `📈 [${result.market}] 
날      짜 : ${result.date}
신      호 : ${result.signal}
가      격 : ${formatPrice(result.price)}원
레  인  지 : ${formatPrice(result.range)}원
전일변동성 : ${result.prevVolatilityRate}
매  수  금 : ${formatPrice(result.investment)}원
`;
        })
        .join("\n");
    return `${title}${memo}${message}`;
}

(async () => {
    const markets = ["KRW-THETA"];
    const result = await fiveDayVolumeMA_VolatilityBreakout(markets, 100000);
    console.log(result);
})();
