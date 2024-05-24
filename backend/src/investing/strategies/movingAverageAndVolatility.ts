// movingAverageAndVolatility
/**
 * 투자전략 : 3, 5, 10, 20일 이동평균 + 변동성 조절
 * 이동평균선 1일 1회 체크
 * 현재 가격이 4개 이동평균보다 높은 경우 매수 또는 보유
 * 현재 가격이 4개 이동평균보다 낮으면 매도 또는 보류
 * 자금관리 : 가상화폐별 투입금액은 (타깃변동성/특정 화폐의 변동성)/가상화폐 수
 *  - 1일 변동성 : (고가 - 저가)/시가 * 100(백분율)
 *  - 변동성 : 최근 5일간의 1일 변동성의 평균
 */

import { fetchDailyCandles } from "../../services/api";
import {
    calculateAllMovingAverages,
    calculateVolatility,
    formatPrice,
} from "../utils";

export async function executeMovingAverageAndVolatility(
    markets: string[],
    initialCapital: number,
    targetVolatility: number = 2
) {
    const results = await Promise.all(
        markets.map(async (market) => {
            const candles: ICandle[] = await fetchDailyCandles(market, "20");

            const movingAverages = calculateAllMovingAverages(
                candles,
                [3, 5, 10, 20]
            );

            const currentPrice = candles[candles.length - 1].trade_price;

            const volatility = calculateVolatility(candles.slice(-5));

            const shouldBuy = shouldBuyBasedOnMovingAverages(
                currentPrice,
                movingAverages
            );

            const capitalAllocation = calculateCapitalAllocation(
                targetVolatility,
                volatility,
                markets.length,
                initialCapital
            );

            const investmentDecision = makeInvestmentDecision(
                shouldBuy,
                currentPrice,
                capitalAllocation
            );

            return {
                market,
                currentPrice,
                volatility,
                ...investmentDecision,
                capitalAllocation,
            };
        })
    );

    return createMessage(results);
}

function shouldBuyBasedOnMovingAverages(
    currentPrice: number,
    movingAverages: Record<string, number>
): boolean {
    return (
        currentPrice > movingAverages.ma3 &&
        currentPrice > movingAverages.ma5 &&
        currentPrice > movingAverages.ma10 &&
        currentPrice > movingAverages.ma20
    );
}

function calculateCapitalAllocation(
    targetVolatility: number,
    volatility: number,
    count: number,
    initialCapital: number
): number {
    return (targetVolatility / volatility / count) * initialCapital;
}

function makeInvestmentDecision(
    isSignal: boolean,
    currentPrice: number,
    capital: number
): { signal: string; position: number } {
    let position = 0;
    let signal = "보유";

    if (isSignal) {
        // 매수 또는 보유
        position = capital / currentPrice;
        signal = "매수";
    } else {
        // 매도 또는 보류
        position = 0;
        signal = "매도";
    }

    return { signal, position };
}

function createMessage(results: IMovingAverageAndVolatilityResult[]) {
    const title = `\n 🔔 슈퍼 상승장(3, 5, 10, 20 이동평균) + 변동성 조절\n\n`;
    const message = results
        .map(
            (result) =>
                `📈 [${result.market}] 
현재 가격: ${formatPrice(result.currentPrice)}원
변동성: ${result.volatility.toFixed(2)}%
매수 자금: ${Math.round(result.capitalAllocation).toLocaleString()}원
신호: ${result.signal}`
        )
        .join("\n\n");

    return `${title}${message}\n`;
}

// (async () => {
//     await executeMovingAverageAndVolatility(["KRW-XRP", "KRW-DOGE"], 10000, 2);
// })();
