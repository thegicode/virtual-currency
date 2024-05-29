/**
 * checkDailyMovingAverage backtest
 * 가상화폐의  이동평균을 체크하고,
 * 그 결과에 따라 매수, 보유, 매도, 또는 유보를 결정
 * 일봉 데이터는 받는 데이터가 오전 9시 기준
 */

import { fetchDailyCandles } from "../../services/api";
import { calculateMovingAverage, calculateMDD } from "../utils";

export async function checkDailyMovingAverageBacktest(
    markets: string[],
    period: number = 3,
    initialCapital: number,
    days: number
) {
    const results = await Promise.all(
        markets.map(
            async (market: string) =>
                await backtestMarket(market, period, initialCapital, days)
        )
    );

    logResults(results, period);

    return results;
}

function logResults(results: any[], period: number) {
    console.log(`\n🔔 일 캔들 ${period}일 이동평균 backtest\n`);

    results.forEach((result) => {
        console.log(`📈 [${result.market}]`);
        console.log(`첫째 날: ${result.firstDate}`);
        console.log(`마지막 날: ${result.lastDate}`);
        console.log(`Total Trades: ${result.trades}번`);
        console.log(
            `Final Capital: ${Math.round(
                result.finalCapital
            ).toLocaleString()}원`
        );
        console.log(`Performance: ${result.performance.toFixed(2)}%`);
        console.log(`MDD: ${result.mdd.toFixed(2)}%`);
        console.log(`Win Rate: ${result.winRate.toFixed(2)}%`);
        // console.log("Trade Log:", result.log.join("\n"));
        console.log("");
    });
}

async function backtestMarket(
    market: string,
    period: number,
    initialCapital: number,
    apiCounts: number
) {
    const candles: ICandle[] = await fetchDailyCandles(
        market,
        apiCounts.toString()
    );
    const movingAverages = calculateMovingAverage(candles);

    let capital = initialCapital;
    let position = 0;
    let trades = 0;
    let wins = 0;
    let buyPrice = 0;
    let firstDate;
    let lastDate;
    let tradeData: any[] = [];
    let mddPrices: number[] = [];

    candles.slice(period).forEach((candle, index) => {
        if (index === 0) firstDate = candle.date_time;
        if (index === candles.length - period - 1) {
            lastDate = candle.date_time;
        }

        const currentPrice = candle.trade_price;
        const movingAverage = movingAverages[index];

        if (currentPrice > movingAverage && capital > 0) {
            // Buy
            buyPrice = currentPrice;
            position = capital / currentPrice;

            tradeData.push({
                capital,
                signal: "Buy",
            });
            mddPrices.push(candle.trade_price);
            capital = 0;
        } else if (currentPrice < movingAverage && position > 0) {
            // Sell
            const sellPrice = currentPrice;
            const profit = (sellPrice - buyPrice) * position;
            capital = position * sellPrice;
            position = 0;
            trades++;
            if (profit > 0) {
                wins++;
            }

            tradeData.push({
                capital,
                signal: "Sell",
                profit,
            });

            mddPrices.push(candle.trade_price);
        } else {
            tradeData.push({
                signal: "",
            });

            if (position > 0) {
                mddPrices.push(candle.trade_price);
            }
        }

        tradeData[index] = {
            date: candle.date_time.slice(0, 10),
            price: currentPrice,
            movingAverage: movingAverage.toFixed(2),
            signal: tradeData[index].signal,
            position: position.toFixed(2),
            profit: Math.ceil(tradeData[index].profit ?? 0).toLocaleString(),
            capital: Math.ceil(tradeData[index].capital ?? 0).toLocaleString(),
            trades,
            wins,
        };
    });

    // mdd
    const maxDrawdown = calculateMDD(mddPrices);

    // Final capital calculation
    const finalCapital =
        capital + position * candles[candles.length - 1].trade_price;
    const performance = (finalCapital / initialCapital - 1) * 100;
    const winRate = trades > 0 ? (wins / trades) * 100 : 0;

    // console.table(tradeData);

    return {
        market,
        firstDate,
        lastDate,
        finalCapital,
        trades,
        mdd: maxDrawdown,
        performance,
        winRate,
    };
}

// 실행 예제
// (async () => {
//     try {
//         const markets = ["KRW-BTC", "KRW-ETH"];
//         const period = 5; // 5 이동평균
//         await checkDailyMovingAverageBacktest(markets, period);
//     } catch (error) {
//         console.error("Error during backtesting:", error);
//     }
// })();
