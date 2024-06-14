// marketTimingVolatilityBreakout

/**
 * 전략: 평균 노이즈 비율 + 마켓 타이밍 + 변동성 돌파
 * 거래 비용: 0.2% 적용
 * 투자 전략:
 * - 1. 종목당 기본 투자 비중: 1/5 (동일 비중) × 전일 기준 3, 5, 10, 20일 평균 이동평균선 스코어 
 * - 2. 매수: 실시간 가격 > 당일 시가 + (전일 레인지 × 20일 평균 노이즈 비율)
 *       최근의 경향성을 좀더 민감하게 반영하기 위해 20일 평균노이즈비율을 돌파계수로 이용
 * - 3. 자금 관리: (전일 고가 - 저가) / 전일 종가 × 100. 값이 투자 자금의 k%를 초과하지 않도록 투자 비중 조절
 *  - 예) 자금 관리룰 2% / 전일 변동폭 4% * 1번
 * - 4.매도: 다음 날 시가

1. 평균 노이즈 비율을 돌파계수로 이용
2. 평균이동선 스코어를 이용한 마켓타이밍 결합 방법
3. 평균 노이즈 비율과 평균 이동평균선 스코어를 이용한 변동성돌파 전략 포트폴리오

 */

import { fetchDailyCandles } from "../../services/api";
import {
    calculateAllMovingAverages,
    calculateAverageNoise,
    calculateRange,
    checkBreakout,
    formatPrice,
} from "../utils";

interface IResult {
    market: string;
    date: string;
    noiseAverage: number;
    prevRange: number;
    signal: string;
    price: number;
    investment: number;
}
export async function marketTimingVolatilityBreakout(
    markets: string[],
    initialCapital: number,
    targetRate: number = 0.02
) {
    try {
        const capital = initialCapital / markets.length;
        const results = await Promise.all(
            markets.map((market: string) =>
                generateSignal(market, capital, targetRate)
            )
        );

        // console.log("results", results);
        return createMessage(results);
    } catch (error) {
        console.error("Error averageNoiseRatioSignalCheck: ", error);
        return "Error in executing the strategy.";
    }
}

async function generateSignal(
    market: string,
    capital: number,
    targetRate: number
) {
    const candles = await fetchDailyCandles(market, (21).toString());
    const currentCandleIndex = 20;
    const currentCandle = candles[currentCandleIndex];
    const prevCandle = candles[currentCandleIndex - 1];

    const noiseAverage = calculateAverageNoise(
        candles.slice(0, currentCandleIndex),
        market
    );
    const range = await calculateRange(prevCandle);
    const isBreakOut = checkBreakout(currentCandle, range, noiseAverage);

    let investment = 0;
    if (isBreakOut) {
        const movingAverages = calculateAllMovingAverages(
            candles.slice(0, currentCandleIndex),
            [3, 5, 10, 20]
        );
        const score =
            Object.values(movingAverages).reduce(
                (a, b) => a + (currentCandle.trade_price > b ? 1 : 0),
                0
            ) / 4;
        const prevVolatility = range / prevCandle.trade_price;
        investment = capital * score * (targetRate / prevVolatility);
    }

    return {
        market,
        date: currentCandle.date_time,
        price: currentCandle.trade_price,
        prevRange: range,
        noiseAverage,
        signal: isBreakOut ? "매수 또는 보유" : "매도 또는 유보",
        investment,
    };
}

function createMessage(results: IResult[]) {
    const title = `\n 🔔 평균 노이즈 비율 + 마켓 타이밍 + 변동성 돌파\n\n`;

    const message = results
        .map((result) => {
            return `📈 [${result.market}] 
날      짜 : ${result.date}
가      격 : ${formatPrice(result.price)}원
평균노이즈 : ${result.noiseAverage.toFixed(3)}
신      호 : ${result.signal}
매  수  금 : ${formatPrice(Math.round(result.investment))}원
`;
        })
        .join("\n");
    return `${title}${message}`;
}

(async () => {
    const markets = [
        "KRW-HPO",
        // "KRW-AVAX",
        // "KRW-BTG",
        // "KRW-BTC",
        // "KRW-ETH",
        // "KRW-DOGE",
        // "KRW-SOL",
        // "KRW-BCH",
        // "KRW-TFUEL",
        // "KRW-1INCH",
        // "KRW-THETA",
        // "KRW-NEAR",
        // "KRW-SHIB",
        // "KRW-SBD",
        // "KRW-DOT",
        // "KRW-POLYX",
        // "KRW-STX",
        // "KRW-ZRX",
        // "KRW-SHIB",
    ];

    const result = await marketTimingVolatilityBreakout(markets, 100000);
    console.log(result);
})();
