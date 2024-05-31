// volatilityBreakoutStrategy
/**
 * 투자전략 : 다자 가상화폐 + 변동성 돌파
 * 투자대상 : 아무 가상화폐 몇 개 선택
 * 거래비용  : 0.2% 적용
 * 투자전략 :
 *      - 각 화폐의 레인지 계산 (전일 고가 - 저가)
 *      - 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
 *          - 필자들은 k=0.5 추천
 *      - 돌파에 성공한 가상화폐에 자산의 n분의 1 투입
 * 매도 : 다음날 시가
 * 
 ## 변동성 돌파 전략의 핵심

1. range 계산
    - 원하는 가상화폐의 전일 고가 - 전일 저가
    - 하루 안에 가상화폐가 움직인 최대폭
2. 매수 기준
    - 시가 기준으로 가격이 'range * k' 이상 상승하면 해당 가격에 매수
    - k는 0.5 ~ 1 (0.5 추천)
3. 매도 기준
    - 그 날 종가에 판다.
 */

import { fetchDailyCandles } from "../../services/api";
import { formatPrice } from "../utils";

interface IResult {
    market: string;
    date: string;
    signal: string;
    price: number;
    investment: number;
    range: number;
}

export async function volatilityBreakoutStrategy(
    markets: string[],
    initialCapital: number,
    k: number = 0.5
) {
    try {
        const results = await Promise.all(
            markets.map(
                async (market: string) =>
                    await generateSignal(
                        market,
                        initialCapital,
                        k,
                        markets.length
                    )
            )
        );

        return createMessage(results);
    } catch (error) {
        console.error("Error volatilityBreakoutStrategy: ", error);
        return "Error in executing the strategy.";
    }
}

async function generateSignal(
    market: string,
    initialCapital: number,
    k: number,
    size: number
) {
    const candles = await fetchDailyCandles(market, "2");

    // 각 화폐의 레인지 계산 (전일 고가 - 저가)
    const range = await calculateRange(candles[0]);

    // 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
    const isBreakOut = checkBreakout(candles, range, k);

    const signal = isBreakOut ? "Buy" : "Sell";

    return {
        market,
        date: candles[1].date_time,
        signal,
        price: candles[1].trade_price,
        investment: initialCapital / size,
        range,
    };
}

async function calculateRange(candle: ICandle): Promise<number> {
    return candle.high_price - candle.low_price;
}

function checkBreakout(candles: ICandle[], range: number, k: number) {
    return candles[1].trade_price > candles[1].opening_price + range * k;
}

function createMessage(results: IResult[]) {
    const title = `\n 🔔 다자 가상화폐 + 변동성 돌파\n`;
    const memo = `- 데이터 시가 시간 9시 \n\n`;

    const message = results
        .map((result) => {
            const isBuy = result.signal === "Buy";
            const investment = isBuy ? result.investment : null;
            return `📈 [${result.market}] 
날      짜 : ${result.date}
신      호 : ${isBuy ? "매수 또는 유지" : "매도 또는 유보"}
가      격 : ${formatPrice(result.price)}원
매  수  금 : ${formatPrice(result.investment)}원
레  인  지 : ${formatPrice(result.range)}원
`;
        })
        .join("\n");
    return `${title}${memo}${message}`;
}

/* 
(async () => {
    const markets = ["KRW-DOGE", "KRW-ETH", "KRW-AUCTION"];
    const result = await volatilityBreakoutStrategy(markets, 100000);
    console.log(result);
})(); */
