// backend/investing/backtest/movingAverageTradeBacktest.ts

import { fetchMinutes } from "../../services/api";
import { calculateMovingAverage } from "../utils";

interface BacktestResult {
    market: string;
    trades: Trade[];
    finalCapital: number;
    tradeCount: number;
    returnRate: number;
    maxDrawdown: number;
    winRate: number;
}

interface Trade {
    date: string;
    action: string;
    price: number;
    capital: number;
    position: number;
    profit?: number;
}

export async function checkMinutesMovingAverageBacktest(
    markets: string[],
    candleUnit: TCandleUnit,
    movingAveragePeriod: number,
    initialCapital: number
) {
    const results = await Promise.all(
        markets.map((market) =>
            backtestMarket(
                market,
                candleUnit,
                movingAveragePeriod,
                initialCapital
            )
        )
    );

    console.log(
        `\n 🔔 ${candleUnit}분캔들의 ${movingAveragePeriod} 이동평균 backtest 🔔\n`
    );
    results.forEach((result) => {
        console.log(`📈 [${result.market}]`);
        console.log(
            `Final Capital: ${Math.round(result.finalCapital).toLocaleString()}`
        );
        console.log(`Return Rate: ${result.returnRate.toFixed(2)}%`);
        console.log(`Trade Count: ${result.tradeCount}`);
        console.log(`Max Drawdown: ${result.maxDrawdown.toFixed(2)}%`);
        console.log(`Win Rate: ${result.winRate.toFixed(2)}%\n\n`);
    });
}

async function backtestMarket(
    market: string,
    candleUnit: TCandleUnit,
    movingAveragePeriod: number,
    initialCapital: number
): Promise<BacktestResult> {
    const candles = await fetchMinutes(market, candleUnit, 200);
    const movingAverages = calculateMovingAverage(candles);
    const trades: Trade[] = [];
    let capital = initialCapital;
    let position = 0;
    let maxCapital = initialCapital;
    let maxDrawdown = 0;
    let winCount = 0;
    let totalTrades = 0;

    candles.forEach((candle: ICandle, index: number) => {
        if (index < movingAveragePeriod) return;

        const currentPrice = candle.trade_price;
        const movingAverage = movingAverages[index - movingAveragePeriod];
        let action = "유보";
        let profit = 0;

        if (currentPrice > movingAverage && capital > 0) {
            // 매수
            position = capital / currentPrice;
            capital = 0;
            action = "매수";
        } else if (currentPrice < movingAverage && position > 0) {
            // 매도
            capital = position * currentPrice;
            profit = capital - trades[trades.length - 1]?.capital!;
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
    const returnRate = ((finalCapital - initialCapital) / initialCapital) * 100;
    const tradeCount = trades.filter((trade) => trade.action !== "유보").length;
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

    return {
        market,
        trades,
        finalCapital,
        tradeCount,
        returnRate,
        maxDrawdown,
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
