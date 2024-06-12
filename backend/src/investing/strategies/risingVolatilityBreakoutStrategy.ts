// risingVolatilityBreakoutStrategy
/**
 * 투자전략 : 다자 가상화폐 + 상승장 + 변동성 돌파
 * 투자대상 : 아무 가상화폐 몇 개 선택
 * 거래비용  : 0.2% 적용
 * 투자전략 :
 *      - 각 화폐의 레인지 계산 (전일 고가 - 저가)
 *      - 각 화폐의 가격이 5일 이동 평균보다 높은지 여부 파악
 *          - 낮을 경우 투자 대상에서 제외
 *      - 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
 *          - 필자들은 k=0.5 추천
 *      - 돌파에 성공한 가상화폐에 자산의 n분의 1 투입
 *          - 이 전략에 2개 화폐를 투입한다면 자산의 2분의 1 투입
 * 매도 : 다음날 시가
 *
 *
 * 9시? 12시?
 */

import { fetchDailyCandles } from "../../services/api";
import {
    calculateMovingAverage,
    calculateRange,
    checkBreakout,
    formatPrice,
} from "../utils";

(async () => {
    const markets = ["KRW-THETA", "KRW-DOGE", "KRW-DOT", "KRW-AVAX"];
    risingVolatilityBreakoutStrategy(markets, 100000);
})();

interface IResult {
    market: string;
    date: string;
    signal: string;
    price: number;
    investment: number;
    range: number;
}

export async function risingVolatilityBreakoutStrategy(
    markets: string[],
    initialCapital: number,
    k: number = 0.5
) {
    try {
        const capital = initialCapital / markets.length;
        const results = await Promise.all(
            markets.map(
                async (market: string) =>
                    await generateSignal(market, capital, k)
            )
        );

        return createMessage(results);
    } catch (error) {
        console.error("Error risingVolatilityBreakoutStrategy: ", error);
        return "Error in executing the strategy.";
    }
}

async function generateSignal(market: string, capital: number, k: number) {
    const period = 5;

    // fetch data
    const candles = await fetchDailyCandles(market, period.toString());
    const currentCandle = candles[candles.length - 1];

    // 각 화폐의 레인지 계산 (전일 고가 - 저가)
    const range = calculateRange(candles[period - 2]);

    // 각 화폐의 가격이 5일 이동 평균보다 높은지 여부 파악
    const movingAverage = calculateMovingAverage(candles, period)[0];
    const isOverMovingAverage = currentCandle.trade_price > movingAverage;

    // 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
    const isBreakOut = checkBreakout(currentCandle, range, k);

    // 매수 신호 확인
    const isBuySign = isOverMovingAverage && isBreakOut ? true : false;

    return {
        market,
        date: currentCandle.date_time,
        range,
        price: currentCandle.trade_price,
        signal: isBuySign ? "매수 또는 유지" : "매도 또는 유보",
        investment: isBuySign ? capital : 0,
    };
}

function createMessage(results: IResult[]) {
    const title = `\n 🔔 다자 가상화폐 + 상승장 + 변동성 돌파\n`;
    const memo = `- 오전 9시 확인 \n\n`;

    const message = results
        .map((result) => {
            return `📈 [${result.market}] 
날      짜 : ${result.date}
신      호 : ${result.signal}
가      격 : ${formatPrice(result.price)}원
레  인  지 : ${formatPrice(result.range)}원
매  수  금 : ${formatPrice(result.investment)}원
`;
        })
        .join("\n");
    return `${title}${memo}${message}`;
}
