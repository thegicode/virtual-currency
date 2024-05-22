/**
 * checkDailyMovingAverage backtest
 * 가상화폐의 5일 이동평균을 체크하고,
 * 그 결과에 따라 매수, 보유, 매도, 또는 유보를 결정
 * 일봉 데이터는 받는 데이터가 오전 9시 기준
 */

import { fetchDailyCandles } from "../../services/api";
import { calculateMovingAverage } from "../utils";

const INITIAL_CAPITAL = 10000;

export async function checkDailyMovingAverageBacktest(
    markets: string[],
    period: number = 3
) {
    const results = await Promise.all(
        markets.map(
            async (market: string) => await backtestMarket(market, period)
        )
    );

    results.forEach((result) => {
        console.log(`[${result.market}]`);
        console.log(`Final Capital: ${result.capital}`);
        console.log(`Total Trades: ${result.trades}`);
        console.log(`Return Rate: ${result.returnRate.toFixed(2)}%`);
        console.log(`Maximum Drawdown (MDD): ${result.mdd.toFixed(2)}%`);
        // console.log("Trade Log:", result.log.join("\n"));
        console.log("");
    });
}

async function backtestMarket(market: string, period: number) {
    const candles: ICandle[] = await fetchDailyCandles(market, "200");
    const movingAverages = calculateMovingAverage(candles);

    let capital = INITIAL_CAPITAL;
    let position = 0;
    let trades = 0;
    let peak = INITIAL_CAPITAL;
    let mdd = 0;
    const log: string[] = [];

    candles.slice(period).forEach((candle, index) => {
        const currentPrice = candle.trade_price;
        const movingAverage = movingAverages[index];

        if (currentPrice > movingAverage && capital > 0) {
            // Buy
            position = capital / currentPrice;
            capital = 0;
            trades++;
            log.push(`[${candle.time}] Buy at ${currentPrice}`);
        } else if (currentPrice < movingAverage && position > 0) {
            // Sell
            capital = position * currentPrice;
            position = 0;
            trades++;
            log.push(`[${candle.time}] Sell at ${currentPrice}`);
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
    const returnRate = (finalCapital / INITIAL_CAPITAL - 1) * 100;

    return {
        market,
        capital: Math.round(finalCapital).toLocaleString(),
        trades,
        log,
        mdd,
        returnRate,
    };
}
