// superRisingVolatilityBreakoutWithAdjustmentBacktest

/**
 * 투자전략 : 슈퍼 상승장(4개 이동평균 상승장) + 변동성 돌파 + 변동성 조절
 * 투자대상 : 아무 가상화폐 몇 개 선택
 * 거래비용  : 0.2% 적용
 * 투자전략 :
 *      - 각 화폐의 레인지 계산 (전일 고가 - 저가)
 *      - 각 화폐의 가격이 3, 5, 10, 20일 이동 평균보다 높은지 여부 파악
 *          - 낮을 경우 투자 대상에서 제외
 *      - 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
 *          - 필자들은 k=0.5 추천
 *      - 자금관리 : 가상화폐별 투입 금액은 (타깃 변동성 / 전일 변동성)/투자 대상 가상화폐 수
 * 매도 : 다음날 시가
 */

import { fetchDailyCandles } from "../../services/api";
import {
    adjustApiCounts,
    calculateAdjustedInvestment,
    calculateAllMovingAverages,
    calculateMDD,
    calculateRange,
    checkBreakout,
    formatPrice,
    isAboveAllMovingAverages,
} from "../utils";

interface ITradeData {
    date: string;
    range: number;
    price: number;
    signal: string;
    sellPrice: number;
    position: number;
    investment: number;
    profit: number;
    capital: number;
    tradeCount: number;
    winCount: number;
}

export async function superRisingVolatilityBreakoutWithAdjustmentBacktest(
    markets: string[],
    initialCapital: number,
    resultCounts: number,
    k: number = 0.5,
    targetRate: number = 0.02,
    transactionFee: number = 0.002 // 0.2%
) {
    try {
        const results = await Promise.all(
            markets.map(
                async (market: string) =>
                    await backtest(
                        market,
                        initialCapital,
                        resultCounts,
                        k,
                        targetRate,
                        transactionFee,
                        markets.length
                    )
            )
        );

        logResult(results);
    } catch (error) {
        console.error(
            "Error superRisingVolatilityBreakoutWithAdjustmentBacktest: ",
            error
        );
        return "Error in executing the strategy.";
    }
}

async function backtest(
    market: string,
    initialCapital: number,
    resultCounts: number,
    k: number,
    targetRate: number,
    transactionFee: number,
    size: number
) {
    const avragePeriod = 20;

    const adjustedApiCounts = adjustApiCounts(resultCounts, avragePeriod);
    const candles: ICandle[] = await fetchDailyCandles(
        market,
        adjustedApiCounts.toString()
    );

    const { tradesData, maxDrawdown } = runStrategies(
        market,
        candles,
        initialCapital,
        k,
        targetRate,
        size,
        avragePeriod
    );

    const {
        firstDate,
        lastDate,
        finalCapital,
        performance,
        tradeCount,
        winRate,
    } = calculateFinalMetrics(tradesData, initialCapital / size);

    const results = tradesData.map((aData) => {
        return {
            date: aData.date.slice(0, 10),
            price: formatPrice(aData.price),
            range: aData.range ? formatPrice(aData.range) : 0,
            sellPrice: aData.sellPrice ? formatPrice(aData.sellPrice) : 0,
            investment: aData.investment
                ? formatPrice(Math.round(aData.investment))
                : 0,
            position: aData.position ? formatPrice(aData.position) : 0,
            profit: aData.profit
                ? Math.round(aData.profit).toLocaleString()
                : 0,
            capital: Math.round(aData.capital).toLocaleString(),
            tradeCount: aData.tradeCount,
            winCount: aData.winCount,
        };
    });

    // console.table(results);

    return {
        market,
        firstDate,
        lastDate,
        finalCapital,
        performance,
        tradeCount,
        winRate,
        mdd: maxDrawdown,
        // tradesData: results,
    };
}

function runStrategies(
    market: string,
    candles: ICandle[],
    initialCapital: number,
    k: number,
    targetRate: number,
    size: number,
    avragePeriod: number
) {
    let tradesData: ITradeData[] = [];
    let mddPrices: number[] = [];
    let realCapital = initialCapital / size;
    let tradeCount = 0;
    let winCount = 0;

    const movingAverages = calculateAllMovingAverages(candles, [3, 5, 10, 20]);

    // console.log("candles", candles.length);

    candles.slice(avragePeriod).forEach((candle, index) => {
        const prevCandle = candles[index + avragePeriod - 1];
        const nextCandle = candles[index + avragePeriod + 1] || candle;
        const tradePrice = candle.trade_price;

        // 각 화폐의 레인지 계산 (전일 고가 - 저가)
        const range = calculateRange(prevCandle);

        // 각 화폐의 가격이 3, 5, 10, 20일 이동 평균보다 높은지 여부 파악
        const movingAverages = calculateAllMovingAverages(
            candles.slice(index, index + avragePeriod),
            [3, 5, 10, 20]
        );
        const isOverMovingAverage = isAboveAllMovingAverages(
            candle.trade_price,
            movingAverages
        );

        // 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
        const isBreakOut = checkBreakout(candle, range, k);

        let thisData: any = {};

        if (isOverMovingAverage && isBreakOut) {
            // 매수
            const buyPrice = tradePrice;
            const { investment, prevVolatilityRate } =
                calculateAdjustedInvestment(
                    range,
                    prevCandle,
                    targetRate,
                    size,
                    realCapital
                );
            const position = investment / tradePrice;
            realCapital -= investment;

            // 메도
            const sellPrice = nextCandle.trade_price;
            const profit = (sellPrice - buyPrice) * position;
            realCapital += position * sellPrice;

            // 통계
            tradeCount++;
            if (profit > 0) winCount++;

            mddPrices.push(tradePrice);

            thisData = {
                sellPrice,
                position,
                investment,
                profit,
            };
        }

        tradesData.push({
            ...thisData,
            date: candle.date_time,
            price: tradePrice,
            range: range,
            capital: realCapital,
            tradeCount,
            winCount,
        });
    });

    //  mdd
    const maxDrawdown = calculateMDD(mddPrices);

    return { tradesData, maxDrawdown };
}

function calculateFinalMetrics(
    tradesData: ITradeData[],
    initialCapital: number
) {
    const lastTrade = tradesData[tradesData.length - 1];
    const finalCapital = lastTrade.capital;
    const performance = (finalCapital / initialCapital - 1) * 100;
    const winRate =
        lastTrade.tradeCount > 0
            ? (lastTrade.winCount / lastTrade.tradeCount) * 100
            : 0;

    return {
        firstDate: tradesData[0].date,
        lastDate: tradesData[tradesData.length - 1].date,
        finalCapital,
        performance,
        tradeCount: lastTrade.tradeCount,
        winRate,
    };
}

function logResult(results: any[]) {
    console.log(
        `\n🔔 슈퍼 상승장(4개 이동평균 상승장) + 변동성 돌파 + 변동성 조절 Backtest\n`
    );

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
        console.log(`MDD: ${result.mdd.toFixed(2)}%\n`);
    });
}

/* (async () => {
    const markets = ["KRW-DOT"];
    await superRisingVolatilityBreakoutWithAdjustmentBacktest(markets, 100000, 200);
})();
 */
