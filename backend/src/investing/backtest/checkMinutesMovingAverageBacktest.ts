// checkMinutesMovingAverageBacktest.ts

import { fetchMinutesCandles } from "../../services/api";
import {
    adjustApiCounts,
    calculateMDD,
    calculateMovingAverage,
} from "../utils";

export async function checkMinutesMovingAverageBacktest(
    markets: string[],
    candleUnit: TCandleUnit,
    movingAveragePeriod: number,
    initialCapital: number,
    resultCounts: number
) {
    const results = await Promise.all(
        markets.map((market) =>
            backtestMarket(
                market,
                candleUnit,
                movingAveragePeriod,
                initialCapital,
                resultCounts
            )
        )
    );

    logResults(results, candleUnit, movingAveragePeriod);
}

async function backtestMarket(
    market: string,
    candleUnit: TCandleUnit,
    movingAveragePeriod: number,
    initialCapital: number,
    resultCounts: number
) {
    const adjustedApiCounts = adjustApiCounts(
        resultCounts,
        movingAveragePeriod
    );
    const candles = await fetchMinutesCandles(
        market,
        candleUnit,
        adjustedApiCounts
    );
    const movingAverages = calculateMovingAverage(candles);

    const tradesData: any[] = [];
    let capital = initialCapital;
    let position = 0;
    // let maxCapital = initialCapital;
    // let maxDrawdown = 0;
    let winCount = 0;
    let tradeCount = 0;
    let buyPrice = 0;
    let firstTime;
    let lastTime;
    let mddPrices: number[] = [];

    candles
        .slice(movingAveragePeriod)
        .forEach((candle: ICandle, index: number) => {
            if (index === 0) firstTime = candle.date_time;
            if (index === candles.length - movingAveragePeriod - 1)
                lastTime = candle.date_time;

            const currentPrice = candle.trade_price;
            // const movingAverage = movingAverages[index - movingAveragePeriod];
            const movingAverage = movingAverages[index];
            let signal = "";
            let profit = 0;

            if (currentPrice > movingAverage && capital > 0) {
                // 매수
                buyPrice = currentPrice;
                position = capital / currentPrice;
                capital = 0;
                signal = "Buy";
            } else if (currentPrice < movingAverage && position > 0) {
                // 매도
                capital = position * currentPrice;
                profit = (currentPrice - buyPrice) * position;
                position = 0;
                tradeCount++;
                signal = "Sell";
                if (profit > 0) {
                    winCount++;
                }
            } else if (currentPrice > movingAverage && position > 0) {
                signal = "Hold";
            }

            const currentCapital = capital + position * currentPrice;

            tradesData.push({
                date: candle.date_time.slice(0, 10),
                price: currentPrice,
                movingAverage: movingAverage.toFixed(5),
                signal,
                position: position.toFixed(2),
                profit: Math.ceil(profit ?? 0).toLocaleString(),
                capital: Math.ceil(currentCapital ?? 0).toLocaleString(),
                tradeCount,
                winCount,
            });

            /* if (currentCapital > maxCapital) {
                maxCapital = currentCapital;
            }

            const drawdown = ((maxCapital - currentCapital) / maxCapital) * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            } */

            if (signal !== "") mddPrices.push(candle.trade_price);
        });

    // Final capital calculation
    const finalCapital =
        capital + position * candles[candles.length - 1].trade_price;
    const performance = (finalCapital / initialCapital - 1) * 100;
    const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;

    // maxDrawdown
    const maxDrawdown = calculateMDD(mddPrices);

    // console.table(tradesData);

    return {
        market,
        firstTime,
        lastTime,
        finalCapital,
        tradeCount,
        performance,
        mdd: maxDrawdown,
        winRate,
    };
}

function logResults(
    results: any[],
    candleUnit: number,
    movingAveragePeriod: number
) {
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
