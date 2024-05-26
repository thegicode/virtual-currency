// backend/investing/backtest/movingAverageTradeBacktest.ts

import { fetchMinutesCandles } from "../../services/api";
import { calculateMovingAverage } from "../utils";

export async function checkMinutesMovingAverageBacktest(
    markets: string[],
    candleUnit: TCandleUnit,
    movingAveragePeriod: number,
    initialCapital: number,
    apiCounts: number
) {
    const results = await Promise.all(
        markets.map((market) =>
            backtestMarket(
                market,
                candleUnit,
                movingAveragePeriod,
                initialCapital,
                apiCounts
            )
        )
    );

    console.log(
        `\n🔔 ${candleUnit}분캔들 ${movingAveragePeriod} 이동평균 backtest\n`
    );

    results.forEach((result) => {
        console.log(`📈 [${result.market}]`);
        console.log(`first Time: ${result.firstTime}`);
        console.log(`last Time: ${result.lastTime}`);
        console.log(`Trade Count: ${result.tradeCount}번`);
        console.log(
            `Final Capital: ${Math.round(
                result.finalCapital
            ).toLocaleString()}원`
        );
        console.log(`Performance: ${result.performance.toFixed(2)}%`);
        console.log(`MDD: ${result.mdd.toFixed(2)}%`);
        console.log(`Win Rate: ${result.winRate.toFixed(2)}%\n\n`);
    });
}

async function backtestMarket(
    market: string,
    candleUnit: TCandleUnit,
    movingAveragePeriod: number,
    initialCapital: number,
    apiCounts: number
) {
    const candles = await fetchMinutesCandles(market, candleUnit, apiCounts);
    const movingAverages = calculateMovingAverage(candles);
    const trades: IMinutesMovingAverageBacktestTrade[] = [];
    let capital = initialCapital;
    let position = 0;
    let maxCapital = initialCapital;
    let maxDrawdown = 0;
    let winCount = 0;
    let totalTrades = 0;
    let buyPrice = 0;
    let firstTime;
    let lastTime;

    candles
        .slice(movingAveragePeriod)
        .forEach((candle: ICandle, index: number) => {
            if (index === 0) firstTime = candle.date_time;
            if (index === candles.length - movingAveragePeriod - 1)
                lastTime = candle.date_time;

            const currentPrice = candle.trade_price;
            const movingAverage = movingAverages[index - movingAveragePeriod];
            let action = "유보";
            let profit = 0;

            if (currentPrice > movingAverage && capital > 0) {
                // 매수
                buyPrice = currentPrice;
                position = capital / currentPrice;
                capital = 0;
                action = "매수";
            } else if (currentPrice < movingAverage && position > 0) {
                // 매도
                capital = position * currentPrice;
                // profit = capital - trades[trades.length - 1]?.capital!;
                profit = (currentPrice - buyPrice) * position;
                position = 0;
                action = "매도";
            }

            const currentCapital = capital + position * currentPrice;

            trades.push({
                date: candle.date_time,
                action,
                price: currentPrice,
                capital: currentCapital,
                position,
                profit,
            });

            if (action === "매도") {
                totalTrades++;
                if (profit > 0) {
                    winCount++;
                }
            }

            if (currentCapital > maxCapital) {
                maxCapital = currentCapital;
            }

            const drawdown = ((maxCapital - currentCapital) / maxCapital) * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        });

    const finalCapital =
        capital + position * candles[candles.length - 1].trade_price;
    const performance = (finalCapital / initialCapital - 1) * 100;
    const tradeCount = trades.filter((trade) => trade.action !== "유보").length;
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

    return {
        market,
        firstTime,
        lastTime,
        trades,
        finalCapital,
        tradeCount,
        performance,
        mdd: maxDrawdown,
        winRate,
    };
}

// 실행 예제
// (async () => {
//     try {
//         const markets = ["KRW-BTC", "KRW-ETH"];
//         const candleUnit: TCandleUnit = 240; // 4시간 단위
//         const movingAveragePeriod = 5; // 5 이동평균
//         const initialCapital = 1000000; // 초기 자본

//         await backtestMovingAverageTrades(
//             markets,
//             candleUnit,
//             movingAveragePeriod,
//             initialCapital
//         );
//     } catch (error) {
//         console.error("Error during backtesting:", error);
//     }
// })();
