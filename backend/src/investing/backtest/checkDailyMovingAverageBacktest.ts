/**
 * checkDailyMovingAverage backtest
 * 가상화폐의  이동평균을 체크하고,
 * 그 결과에 따라 매수, 보유, 매도, 또는 유보를 결정
 * 일봉 데이터는 받는 데이터가 오전 9시 기준
 */

import { fetchDailyCandles } from "../../services/api";
import { calculateMovingAverage } from "../utils";

export async function checkDailyMovingAverageBacktest(
    markets: string[],
    period: number = 3,
    initialCapital: number
) {
    const results = await Promise.all(
        markets.map(
            async (market: string) =>
                await backtestMarket(market, period, initialCapital)
        )
    );

    console.log(`\n🔔 일 캔들 ${period}일 이동평균 backtest\n`);

    results.forEach((result) => {
        console.log(`📈 [${result.market}]`);
        console.log(`Total Trades: ${result.trades}`);
        console.log(`Final Capital: ${result.capital}원`);
        console.log(`Return Rate: ${result.returnRate.toFixed(2)}%`);
        console.log(`Maximum Drawdown (MDD): ${result.mdd.toFixed(2)}%`);
        console.log(`Win Rate: ${result.winRate.toFixed(2)}%`);
        // console.log("Trade Log:", result.log.join("\n"));
        console.log("");
    });

    // return results;
}

async function backtestMarket(
    market: string,
    period: number,
    initialCapital: number
) {
    const candles: ICandle[] = await fetchDailyCandles(market, "200");
    const movingAverages = calculateMovingAverage(candles);

    let capital = initialCapital;
    let position = 0;
    let trades = 0;
    let wins = 0;
    let peak = initialCapital;
    let mdd = 0;
    let buyPrice = 0;
    const log: string[] = [];

    candles.slice(period).forEach((candle, index) => {
        // console.log("\nindex", index);
        const currentPrice = candle.trade_price;
        const movingAverage = movingAverages[index];

        if (currentPrice > movingAverage && capital > 0) {
            // Buy
            buyPrice = currentPrice;
            position = capital / currentPrice;
            capital = 0;
            trades++;
            log.push(
                `${index} [${
                    candle.date_time
                }] Buy Price  ${currentPrice} | position ${position.toFixed(2)}`
            );
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
            log.push(
                `${index} [${candle.date_time}] Sell Price ${currentPrice}`
            );
        }

        // Calculate current total value
        const currentValue = capital + position * currentPrice;

        // Update peak and MDD
        if (currentValue > peak) {
            peak = currentValue;
        }
        const drawdown = ((peak - currentValue) / peak) * 100;
        if (drawdown > mdd) {
            mdd = drawdown;
        }
    });

    // Final capital calculation
    const finalCapital =
        capital + position * candles[candles.length - 1].trade_price;
    const returnRate = (finalCapital / initialCapital - 1) * 100;
    const winRate = trades > 0 ? (wins / trades) * 100 : 0;

    return {
        market,
        capital: Math.round(finalCapital).toLocaleString(),
        trades,
        log,
        mdd,
        returnRate,
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
