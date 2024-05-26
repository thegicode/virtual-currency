// movingAverageAndVolatilityBacktest
import { fetchDailyCandles } from "../../services/api";
import { determineInvestmentAction } from "../strategies/movingAverageAndVolatility";
import {
    calculateAllMovingAverages,
    calculateRiskAdjustedCapital,
    calculateVolatility,
    formatPrice,
    isAboveAllMovingAverages,
} from "../utils";

export async function movingAverageAndVolatilityBacktest(
    markets: string[],
    initialCapital: number,
    targetVolatility: number = 2,
    days: number = 200
) {
    const results = await Promise.all(
        markets.map((market) =>
            backtestMarket(
                market,
                days,
                targetVolatility,
                markets,
                initialCapital
            )
        )
    );

    console.log(
        `\n🔔 3, 5, 10, 20일 이동평균 + 변동성 조절 backtest - ${days}일\n`
    );

    results.forEach((result) => {
        console.log(`📈 [${result.market}]`);
        console.log(`Trade Count: ${result.trades}`);
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
    days: number,
    targetVolatility: number,
    markets: string[],
    initialCapital: number
) {
    const candles: ICandle[] = await fetchDailyCandles(market, days.toString());
    let capital = initialCapital;
    let position = 0;
    let trades = 0;
    let wins = 0;
    let peakCapital = initialCapital;
    let maxDrawdown = 0;

    for (let i = 20; i < candles.length; i++) {
        const currentCandles = candles.slice(i - 20, i);
        const movingAverages = calculateAllMovingAverages(
            currentCandles,
            [3, 5, 10, 20]
        );
        const currentPrice = candles[i].trade_price;
        const volatility = calculateVolatility(currentCandles.slice(-5));
        const isSignal = isAboveAllMovingAverages(currentPrice, movingAverages);
        const capitalAllocation = calculateRiskAdjustedCapital(
            targetVolatility,
            volatility,
            markets.length,
            capital
        );

        const { signal, position: newPosition } = determineInvestmentAction(
            isSignal,
            currentPrice,
            capitalAllocation
        );

        if (signal === "매수" && capital >= capitalAllocation) {
            capital -= capitalAllocation;
            position += newPosition;
            trades++;
        } else if (signal === "매도" && position > 0) {
            capital += position * currentPrice;
            position = 0;
            trades++;
            if (capital > initialCapital) {
                wins++;
            }
        }

        // Update peak capital and maximum drawdown
        const currentTotal = capital + position * currentPrice;
        if (currentTotal > peakCapital) {
            peakCapital = currentTotal;
        }
        const drawdown = ((peakCapital - currentTotal) / peakCapital) * 100;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    const finalCapital =
        capital + position * candles[candles.length - 1].trade_price;
    const performance = (finalCapital / initialCapital - 1) * 100;
    const winRate = (wins / trades) * 100;

    return {
        market,
        finalCapital,
        trades,
        winRate,
        mdd: maxDrawdown,
        performance,
    };
}

// 실행 예제
/* (async () => {
    const markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE"];
    const initialCapital = 1000000;
    const targetVolatility = 2;
    const days = 60;

    const backtestResults = await movingAverageAndVolatilityBacktest(
        markets,
        initialCapital,
        targetVolatility,
        days
    );
    console.log(backtestResults);
})();
 */
