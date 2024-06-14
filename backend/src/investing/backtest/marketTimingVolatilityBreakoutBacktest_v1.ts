// marketTimingVolatilityBreakoutBacktest

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
    calculateAdjustedInvestment,
    calculateMDD,
    formatPrice,
} from "../utils";

interface ICandle {
    market: string;
    date_time: string;
    opening_price: number;
    trade_price: number;
    high_price: number;
    low_price: number;
    candle_acc_trade_volume: number;
}

interface IResult {
    market: string;
    date: string;
    noiseAverage: number;
    prevRange: number;
    signal: string;
    price: number;
    investment: number;
    capital: number;
    tradeCount: number;
    winCount: number;
    maxDrawdown: number;
}

interface ISignalData {
    market: string;
    date: string;
    price: number;
    signal: string;
    investment: number;
    capital: number;
    tradeCount: number;
    winCount: number;
    mdd: number;
}

export async function marketTimingVolatilityBreakoutBacktest(
    markets: string[],
    initialCapital: number,
    days: number,
    targetRate: number = 0.02
) {
    try {
        const marketCandles = await Promise.all(
            markets.map((market) =>
                fetchDailyCandles(market, (days + 20).toString())
            )
        );

        const dateGroups: { [key: string]: { [market: string]: ICandle } } = {};

        marketCandles.forEach((candles, marketIdx) => {
            candles.forEach((candle: ICandle) => {
                const date = candle.date_time.split("T")[0];
                if (!dateGroups[date]) {
                    dateGroups[date] = {};
                }
                dateGroups[date][markets[marketIdx]] = candle;
            });
        });

        const results = await runDateBasedBacktest(
            dateGroups,
            initialCapital,
            targetRate
        );

        console.log("results", results);

        // logResult(results.finalMetrics);
    } catch (error) {
        console.error("Error marketTimingVolatilityBreakoutBacktest: ", error);
        return "Error in executing the strategy.";
    }
}

async function runDateBasedBacktest(
    dateGroups: { [key: string]: { [market: string]: ICandle } },
    initialCapital: number,
    targetRate: number
) {
    let capital = initialCapital;
    let tradeCount = 0;
    let winCount = 0;
    let peakCapital = initialCapital;
    let maxDrawdown = 0;

    const results: IResult[] = [];

    for (const date in dateGroups) {
        const marketCandles = dateGroups[date];
        const resultsForDate = await Promise.all(
            Object.keys(marketCandles).map(async (market) => {
                const currentCandle = marketCandles[market];
                const prevDate = new Date(date);
                prevDate.setDate(prevDate.getDate() - 1);
                const prevCandleDate = prevDate.toISOString().split("T")[0];

                if (
                    !dateGroups[prevCandleDate] ||
                    !dateGroups[prevCandleDate][market]
                ) {
                    return null;
                }

                const prevCandle = dateGroups[prevCandleDate][market];
                return await backtestCandle(
                    currentCandle,
                    prevCandle,
                    capital,
                    targetRate
                );
            })
        );

        resultsForDate
            .filter((result) => result !== null)
            .forEach((result) => {
                if (!result) return;

                capital = result.capital;
                tradeCount += result.tradeCount;
                winCount += result.winCount;
                peakCapital = Math.max(peakCapital, capital);
                const drawdown = ((peakCapital - capital) / peakCapital) * 100;
                maxDrawdown = Math.max(maxDrawdown, drawdown);

                results.push(result);
            });
    }

    const finalMetrics = calculateMetrics(results, initialCapital);

    return {
        results,
        finalMetrics: {
            ...finalMetrics,
            maxDrawdown,
        },
    };
}

async function backtestCandle(
    currentCandle: ICandle,
    prevCandle: ICandle,
    capital: number,
    targetRate: number
): Promise<IResult> {
    const noiseAverage = calculateAverageNoise(
        [prevCandle, currentCandle],
        currentCandle.market
    );
    const range = await calculateRange(prevCandle);
    const isBreakOut = checkBreakout(currentCandle, range, noiseAverage);

    let investment = 0;
    if (isBreakOut) {
        const movingAverages = calculateAllMovingAverages(
            [prevCandle, currentCandle],
            [3, 5, 10, 20]
        );
        const score =
            Object.values(movingAverages).reduce(
                (a, b) => a + (currentCandle.trade_price > b ? 1 : 0),
                0
            ) / 4;
        const prevVolatility = range / prevCandle.trade_price;
        investment = capital * score * (targetRate / prevVolatility);

        // 매수
        const position = investment / currentCandle.trade_price;
        capital -= investment;

        // 매도
        const nextCandle = currentCandle;
        const profit =
            (nextCandle.opening_price - currentCandle.trade_price) * position;
        capital += position * nextCandle.opening_price;

        // 통계 업데이트
        const tradeCount = 1;
        const winCount = profit > 0 ? 1 : 0;

        return {
            market: currentCandle.market,
            date: currentCandle.date_time,
            price: currentCandle.trade_price,
            prevRange: range,
            noiseAverage,
            signal: "매수 또는 보유",
            investment,
            capital,
            tradeCount,
            winCount,
            maxDrawdown: 0,
        };
    }

    return {
        market: currentCandle.market,
        date: currentCandle.date_time,
        price: currentCandle.trade_price,
        prevRange: range,
        noiseAverage,
        signal: "매도 또는 유보",
        investment,
        capital,
        tradeCount: 0,
        winCount: 0,
        maxDrawdown: 0,
    };
}

function calculateMetrics(results: IResult[], initialCapital: number) {
    const finalResult = results[results.length - 1];
    const finalCapital = finalResult.capital;
    const performance = (finalCapital / initialCapital - 1) * 100;
    const winRate =
        finalResult.tradeCount > 0
            ? (finalResult.winCount / finalResult.tradeCount) * 100
            : 0;

    return {
        firstDate: results[0].date,
        lastDate: finalResult.date,
        finalCapital,
        performance,
        tradeCount: finalResult.tradeCount,
        winRate,
        maxDrawdown: results.reduce(
            (acc, result) => Math.max(acc, result.maxDrawdown),
            0
        ),
    };
}

function logResult(results: any[]) {
    console.log(`\n🔔 평균 노이즈 비율 + 마켓 타이밍 + 변동성 돌파\n`);
    results.forEach((result) => {
        console.log(`📈 [${result.market}]`);
        console.log(`첫째 날: ${result.firstDate}`);
        console.log(`마지막 날: ${result.lastDate}`);
        console.log(`Trade Count: ${result.tradeCount}번`);
        console.log(
            `Final Capital: ${Math.round(
                result.finalCapital
            ).toLocaleString()}원`
        );
        console.log(`Performance: ${result.performance.toFixed(2)}%`);
        console.log(`Win Rate: ${result.winRate.toFixed(2)}%`);
        console.log(`maxDrawdown: ${result.maxDrawdown.toFixed(2)}%\n`);
    });
}

// 실행 예제
(async () => {
    const markets = ["KRW-ETH", "KRW-LINK"];
    const initialCapital = 1000000;
    const days = 100;

    const results = await marketTimingVolatilityBreakoutBacktest(
        markets,
        initialCapital,
        days
        // targetRate: number = 0.02
    );

    // results.forEach((result) => logBacktestResult(result, initialCapital));
})();
