// fiveDayVolumeMA_VolatilityBreakoutBactest

/**
 * 투자전략 : 5일 이동평균 & 5일 거래량 상승장 + 변동성 돌파 + 변동성 조절
 * 투자대상 : 아무 가상화폐 몇 개 선택
 * 거래비용  : 0.2% 적용
 * 투자전략 :
 *      - 각 화폐의 레인지 계산 (전일 고가 - 저가)
 *      - 각 화폐의 가격이 5일 이동 평균보다 높은지 여부 파악
 *      - 각 화폐의 전일 거래량이 5일 거래량 이동평균보다 많은지 여부 파악
 *          - 둘 중 하나라도 낮을 경우 그날 투자 대상에서 제외
 *      - 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
 *          - 필자들은 k=0.7 추천
 *      - 자금관리 : 가상화폐별 투입 금액은 (타깃 변동성 / 전일 변동성)/투자 대상 가상화폐 수
 * 매도 : 다음날 시가
 *
 * 맞는 건지 확신이 안든다.
 */

import { fetchDailyCandles } from "../../services/api";
import {
    adjustApiCounts,
    calculateAdjustedInvestment,
    calculateMDD,
    calculateMovingAverages,
    calculateRange,
    calculateVolumeAverage,
    checkBreakout,
    formatPrice,
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

export async function fiveDayVolumeMA_VolatilityBreakoutBactest(
    markets: string[],
    initialCapital: number,
    resultCounts: number,
    k: number = 0.7,
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
            "Error fiveDayVolumeMA_VolatilityBreakoutBactest: ",
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
    const averagePeriod = 5;

    const adjustedApiCounts = adjustApiCounts(resultCounts, averagePeriod);
    const candles: ICandle[] = await fetchDailyCandles(
        market,
        adjustedApiCounts.toString()
    );

    // console.log("candles", candles);

    if (candles.length < resultCounts) {
        throw new Error(`Not enough data for ${market}`);
    }

    const { tradesData, maxDrawdown } = runStrategies(
        market,
        candles,
        initialCapital,
        k,
        targetRate,
        size,
        averagePeriod
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
    averagePeriod: number
) {
    let tradesData: ITradeData[] = [];
    let mddPrices: number[] = [];
    let realCapital = initialCapital / size;
    let tradeCount = 0;
    let winCount = 0;

    const movingAverages = calculateMovingAverages(candles, averagePeriod);

    // console.log("movingAverages", movingAverages);

    candles.slice(averagePeriod).forEach((candle, index) => {
        const prevCandle = candles[index + averagePeriod - 1];
        const nextCandle = candles[index + averagePeriod + 1] || candle;
        const last5Candles = candles.slice(index, index + averagePeriod);

        // console.log("prevCandle", prevCandle.date_time);
        // console.log("last5Candles", last5Candles);

        // 각 화폐의 레인지 계산 (전일 고가 - 저가)
        const range = calculateRange(prevCandle);

        // 각 화폐의 가격이 5일 이동 평균보다 높은지 여부 파악
        const isOverMovingAverage =
            prevCandle.trade_price > movingAverages[index].price;
        // console.log(
        //     "check",
        //     prevCandle.date_time === movingAverages[index].date_time
        // );

        // 각 화폐의 전일 거래량이 5일 거래량 이동평균보다 많은지 여부 파악
        const volumeAverage = calculateVolumeAverage(last5Candles);
        const isOverVolumeAverage =
            prevCandle.candle_acc_trade_volume > volumeAverage;

        // 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
        const isBreakOut = checkBreakout(candle, range, k);

        let thisData: any = {};

        // console.log("isOverMovingAverage", isOverMovingAverage);
        // console.log("isOverVolumeAverage", isOverVolumeAverage);
        // console.log("isBreakOut", isBreakOut);

        if (isOverMovingAverage && isOverVolumeAverage && isBreakOut) {
            // 매수
            const buyPrice = nextCandle.opening_price;
            const { investment, prevVolatilityRate } =
                calculateAdjustedInvestment(
                    range,
                    prevCandle,
                    targetRate,
                    size,
                    realCapital
                );
            const position = investment / buyPrice;
            realCapital -= investment;

            // 메도
            const sellPrice = nextCandle.trade_price;
            const profit = (sellPrice - buyPrice) * position;
            realCapital += position * sellPrice;

            // 통계
            tradeCount++;
            if (profit > 0) winCount++;

            mddPrices.push(candle.trade_price);

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
            price: candle.trade_price,
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
        `\n🔔 5일 이동평균 & 5일 거래량 상승장 + 변동성 돌파 + 변동성 조절\n`
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
    const markets = ["KRW-NEAR"];
    await fiveDayVolumeMA_VolatilityBreakoutBactest(markets, 100000, 200);
})();
 */
