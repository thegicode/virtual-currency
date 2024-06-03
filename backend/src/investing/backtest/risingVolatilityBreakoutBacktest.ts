// risingVolatilityBreakoutBacktest
/**
 * 투자전략 : 다자 가상화폐 + 상승장 + 변동성 돌파
 * 투자대상 : 아무 가상화폐 몇 개 선택
 * 거래비용  : 0.2% 적용
 * 투자전략 :
 *      - 각 화폐의 레인지 계산 (전일 고가 - 저가)
 *      - 각 화폐의 가격이 5일 이동 평균보다 높은지 여부 파악
 *          - 낮을 경우 투자 대상에서 제외
 *      - 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
 *          - 필자들은 k=0.5 추천
 *      - 돌파에 성공한 가상화폐에 자산의 n분의 1 투입
 *          - 이 전략에 2개 화폐를 투입한다면 자산의 2분의 1 투입
 * 매도 : 다음날 시가
 */

import { fetchDailyCandles, fetchMinutesCandles } from "../../services/api";
import {
    adjustApiCounts,
    calculateMDD,
    calculateMovingAverage,
    calculateRange,
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

export async function risingVolatilityBreakoutBacktest(
    markets: string[],
    initialCapital: number,
    period: number,
    k: number = 0.5,
    transactionFee: number = 0.002 // 0.2%
) {
    try {
        const results = await Promise.all(
            markets.map(
                async (market: string) =>
                    await backtest(
                        market,
                        initialCapital,
                        period,
                        k,
                        transactionFee,
                        markets.length
                    )
            )
        );

        // console.log(results);

        const messages = logResult(results);
    } catch (error) {
        console.error("Error volatilityBreakoutStrategy: ", error);
        return "Error in executing the strategy.";
    }
}

async function backtest(
    market: string,
    initialCapital: number,
    period: number,
    k: number,
    transactionFee: number,
    size: number
) {
    // console.log("\nmarket", market);
    const avragePeriod = 5;

    const adjustedApiCounts = adjustApiCounts(period, avragePeriod);
    const candles: ICandle[] = await fetchDailyCandles(
        market,
        adjustedApiCounts.toString()
    );

    const { tradesData, maxDrawdown } = runStrategies(
        market,
        candles,
        initialCapital,
        k,
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
            position: aData.position ? formatPrice(aData.position) : 0,
            investment: aData.investment
                ? formatPrice(Math.round(aData.investment))
                : 0,
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
    };
}

async function getRealPrices(candles: ICandle[]) {
    return await Promise.all(
        candles.map(async (candle) => {
            const date = candle.date_time;
            const toDate = date.replace("T09:00:00", "T13:00:00+09:00"); //  '2024-05-31T10:00:00',
            const response = await fetchMinutesCandles(
                candle.market,
                60,
                1,
                toDate
            );
            const price = response[0].opening_price;

            return {
                date,
                toDate,
                price,
            };
        })
    );
}

function runStrategies(
    market: string,
    candles: ICandle[],
    initialCapital: number,
    k: number,
    size: number,
    avragePeriod: number
) {
    let tradesData: ITradeData[] = [];
    let mddPrices: number[] = [];
    let realCapital = initialCapital / size;
    let tradeCount = 0;
    let winCount = 0;

    const movingAverages = calculateMovingAverage(candles, avragePeriod).slice(
        1
    );

    candles.slice(avragePeriod).forEach((candle, index) => {
        const prevCandle = candles[index + avragePeriod - 1];
        const nextCandle = candles[index + avragePeriod + 1] || candle;
        const tradePrice = candle.trade_price;

        // 각 화폐의 레인지 계산 (전일 고가 - 저가)
        const range = calculateRange(prevCandle);

        // 각 화폐의 가격이 5일 이동 평균보다 높은지 여부 파악
        const isOverMovingAverage = candle.trade_price > movingAverages[index];

        // 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
        const isBreakOut = checkBreakout(candle, range, k);

        let thisData: any = {};

        if (isOverMovingAverage && isBreakOut) {
            // 매수
            const buyPrice = tradePrice;
            const position = realCapital / tradePrice;
            const investment = tradePrice * position;
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
    console.log(`\n🔔 다자 가상화폐 + 상승장 + 변동성 돌파 Backtest\n`);

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
    await volatilityBreakoutBacktest(markets, 100000, 30);
})();
 */
