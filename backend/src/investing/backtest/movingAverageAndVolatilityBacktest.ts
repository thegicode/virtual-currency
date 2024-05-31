// movingAverageAndVolatilityBacktest

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
    adjustApiCounts,
    calculateAllMovingAverages,
    calculateMDD,
    calculateRiskAdjustedCapital,
    calculateVolatility,
    isAboveAllMovingAverages,
} from "../utils";

export async function movingAverageAndVolatilityBacktest(
    markets: string[],
    initialCapital: number,
    resultCounts: number = 200,
    targetVolatility: number = 2
) {
    const adjustedApiCounts = adjustApiCounts(resultCounts, 20);

    const results = await Promise.all(
        markets.map((market) =>
            backtestMarket(
                market,
                adjustedApiCounts,
                targetVolatility,
                markets,
                initialCapital
            )
        )
    );

    logResults(results);
}

function logResults(results: any[]) {
    console.log(`\n🔔 3, 5, 10, 20일 이동평균 + 변동성 조절 backtest\n`);

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
        console.log(`MDD: ${result.mdd.toFixed(2)}%\n\n`);
    });
}

async function backtestMarket(
    market: string,
    apiCounts: number,
    targetVolatility: number,
    markets: string[],
    initialCapital: number
) {
    const candles: ICandle[] = await fetchDailyCandles(
        market,
        apiCounts.toString()
    );

    let capital = initialCapital;
    let position = 0;
    let tradeCount = 0;
    let winCount = 0;
    let firstDate;
    let lastDate;
    let buyPrice = 0;
    let tradesData: any[] = [];
    let mddPrices: number[] = [];

    candles.slice(20).forEach((candle, index) => {
        // console.log("\nindex", index);

        if (index === 0) firstDate = candle.date_time;
        if (index === candles.length - 20 - 1) lastDate = candle.date_time;

        const currentCandles = candles.slice(index, index + 20);

        // console.log("currentCandles", currentCandles);

        const movingAverages = calculateAllMovingAverages(
            currentCandles,
            [3, 5, 10, 20]
        );

        // console.log("movingAverages", movingAverages);

        const currentPrice = candle.trade_price;
        const volatility = calculateVolatility(currentCandles.slice(-5));
        const isSignal = isAboveAllMovingAverages(currentPrice, movingAverages);
        const capitalAllocation = calculateRiskAdjustedCapital(
            targetVolatility,
            volatility,
            markets.length,
            capital
        );
        let profit = 0;
        let signal = "";

        // console.log("capitalAllocation", capitalAllocation);

        if (isSignal && buyPrice === 0) {
            // Buy
            signal = "Buy";
            buyPrice = currentPrice;
            position = capitalAllocation / currentPrice;
            capital -= capitalAllocation;
        } else if (!isSignal && position > 0) {
            signal = "Sell";
            profit = (currentPrice - buyPrice) * position;
            capital += position * currentPrice;

            position = 0;
            buyPrice = 0;

            tradeCount++;
            if (profit > 0) {
                winCount++;
            }
        } else if (isSignal && buyPrice > 0) {
            signal = "Hold";
        }

        const capitalAllocation2 = signal === "Buy" ? capitalAllocation : 0;
        tradesData.push({
            date: candle.date_time.slice(0, 10),
            price: currentPrice,
            signal,
            position: position.toFixed(2),
            profit: Math.ceil(profit ?? 0).toLocaleString(),
            capitalAllocation: Math.ceil(capitalAllocation2).toLocaleString(),
            capital: Math.ceil(capital),
            volatility: volatility.toFixed(2),
            tradeCount,
            winCount,
        });

        if (signal !== "") mddPrices.push(candle.trade_price);
    });

    // mdd
    const maxDrawdown = calculateMDD(mddPrices);

    // lastTradeData
    const lastTradeData = tradesData[tradesData.length - 1];
    const finalCapital = ["Buy", "Hold"].includes(lastTradeData.signal)
        ? capital + position * lastTradeData.price
        : lastTradeData.capital;

    const performance = (finalCapital / initialCapital - 1) * 100;
    const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;

    // console.table(tradesData);

    return {
        market,
        firstDate,
        lastDate,
        finalCapital,
        tradeCount,
        performance,
        mdd: maxDrawdown,
        winRate,
    };
}

// 실행 예제
/* (async () => {
    const markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE"];
    const initialCapital = 1000000;
    const targetVolatility = 2;
    const apiCounts = 60;

    const backtestResults = await movingAverageAndVolatilityBacktest(
        markets,
        initialCapital,
        targetVolatility,
        apiCounts
    );
    console.log(backtestResults);
})();
 */
