//  volatilityBreakoutBacktest

import { fetchDailyCandles, fetchMinutesCandles } from "../../services/api";
import {
    adjustApiCounts,
    calculateMDD,
    calculateRange,
    checkBreakout,
    formatPrice,
} from "../utils";

/**
 * 투자전략 : 다자 가상화폐 + 변동성 돌파
 * 투자대상 : 아무 가상화폐 몇 개 선택
 * 거래비용  : 0.2% 적용
 * 투자전략 :
 *      - 각 화폐의 레인지 계산 (전일 고가 - 저가)
 *      - 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
 *          - 필자들은 k=0.5 추천
 *      - 돌파에 성공한 가상화폐에 자산의 n분의 1 투입
 * 매도 : 다음날 시가
 * 
 ## 변동성 돌파 전략의 핵심

1. range 계산
    - 원하는 가상화폐의 전일 고가 - 전일 저가
    - 하루 안에 가상화폐가 움직인 최대폭
2. 매수 기준
    - 시가 기준으로 가격이 'range * k' 이상 상승하면 해당 가격에 매수
    - k는 0.5 ~ 1 (0.5 추천)
3. 매도 기준
    - 그 날 종가에 판다.
 */
// (async () => {
//     const markets = ["KRW-ETH", "KRW-DOGE"];
//     await volatilityBreakoutBacktest(markets, 100000, 200);
// })();

interface ITradeData {
    date: string;
    range: number;
    price: number;
    sellPrice: number;
    position: number;
    investment: number;
    profit: number;
    capital: number;
    tradeCount: number;
    winCount: number;
}

export async function volatilityBreakoutBacktest(
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

    const adjustedApiCounts = adjustApiCounts(period, 1);
    const candles: ICandle[] = await fetchDailyCandles(
        market,
        adjustedApiCounts.toString()
    );

    const { tradesData, maxDrawdown } = runStrategies(
        market,
        candles,
        initialCapital,
        k,
        size
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
            range: aData.range ? formatPrice(aData.range) : 0,
            buyPrice: aData.price ? formatPrice(aData.price) : 0,
            sellPrice: aData.sellPrice ? formatPrice(aData.sellPrice) : 0,
            position: aData.position ? formatPrice(aData.position) : 0,
            investment: aData.investment ? formatPrice(aData.investment) : 0,
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
    size: number
) {
    let tradesData: ITradeData[] = [];
    let mddPrices: number[] = [];
    let realCapital = initialCapital / size;
    let tradeCount = 0;
    let winCount = 0;

    candles.slice(1).forEach((candle, index) => {
        const prevCandle = candles[index];
        const nextCandle = candles[index + 2] || prevCandle;
        const tradePrice = candle.trade_price;
        const currentDate = candle.date_time;

        // 각 화폐의 레인지 계산 (전일 고가 - 저가)
        const range = calculateRange(prevCandle);

        // 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
        const isBreakOut = checkBreakout(candle, range, k);

        let thisData: any = {};

        if (isBreakOut) {
            // 매수
            const buyPrice = tradePrice;
            const position = realCapital / tradePrice;
            const investment = tradePrice * position;
            realCapital -= investment;
            // const buyCapital = realCapital;

            // 메도

            const sellPrice = nextCandle.trade_price;
            const profit = (sellPrice - buyPrice) * position;
            realCapital += position * sellPrice;

            // 통계
            tradeCount++;
            if (profit > 0) winCount++;
            mddPrices.push(tradePrice);

            thisData = {
                profit,
                position,
                investment,
                price: buyPrice,
                sellPrice,
            };
        }

        tradesData.push({
            ...thisData,
            date: currentDate,
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
    console.log(`\n🔔 다자 가상화폐 + 변동성 돌파 backtest\n`);

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
