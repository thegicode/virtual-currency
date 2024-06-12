// averageNoiseRatioSignalCheckBacktest

/**
 * 투자 전략 : 다자 가상화폐 + 평균 노이즈 비율
 * 거래 비용 : 0.2% 적용
 * 투자 전략 :
 *      1. 각 종목에 투자 자금 5분의 1씩 동일 비중 배분
 *      2. 매수 : 당일 실시간 가격 > 당일 시가 + (레인지 * 0.5)
 *      3. 자금 관리 : (전일 고가 - 저가) / 전일 종가 * 100 값이 투자 자금의 1%를 초과하지 않도록 투자 비중 조절
 *      4. 각 종목의 30일 평균 노이즈 값 산출
 *      5. 투자 직전의 30일 평균 노이즈 값이 가장 작은 종목 n개 선정
 *      6. 선정된 n개 종목의 돌파 전략 수익 곡선에 n분의 1 자금 투입
 *      7. 30일 평균 노이즈 값이 가장 작으면서, 노이즈 값이 특정 역치 이하인 경우만 진입
 *      8. 매도 : 다음 날 시가
 *
 * 일봉 계산으로 정확하지 않다.
 * 분캔들로 작업 수정
 */

import { fetchDailyCandles, fetchMinutesCandles } from "../../services/api";
import {
    adjustApiCounts,
    calculateAdjustedInvestment,
    calculateAverageNoise,
    calculateMDD,
    calculateMovingAverage2,
    calculateRange,
    checkBreakout,
    checkBreakout2,
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

interface INoiseAverage {
    date_time: string;
    noiseAverage: number;
}

interface IMaretksCandles {
    market: string;
    candles: ICandle[];
    // noiseAverages: INoiseAverage[];
}

interface INoiseData {
    market: string;
    value: number;
}

interface IDateNoiseData {
    date_time: string;
    noises: INoiseData[];
}

interface IBuySignalData {
    market: string;
    noiseAverage: number;
    isBuySign: boolean;
    investment: number;
    prevLastDate: string;
    currentCandle: ICandle;
}

interface ISingal {
    date_time: string;
    market: string;
    buyPrice: number;
    range: number;
    capital: number;
    tradeCount: number;
    winCount: number;
    sellPrice: number;
    position: number;
    investment: number;
    profit: number;
}

interface ISignalData {
    date_time: string;
    signals: ISingal[];
}

interface IResult {
    firstDate: string;
    lastDate: string;
    finalCapital: number;
    performance: number;
    tradeCount: number;
    winRate: number;
    maxDrawdown: number;
}

export async function averageNoiseRatioSignalCheckBacktest(
    markets: string[],
    initialCapital: number,
    resultCounts: number,
    k: number = 0.5,
    targetRate: number = 0.01,
    transactionFee: number = 0.002 // 0.2%
) {
    try {
        // get markets candles
        const marketsCandles = await Promise.all(
            markets.map((market) => getCandles(market, resultCounts))
        );

        // 날짜와 코인별 noise 데이터 만들기
        const dateNoiseData = generateDateNoiseData(
            marketsCandles,
            resultCounts
        );

        // 절대 모멘텀, 상대 모멘텀으로 filter
        const filterdData = filterAndSortMarketsByNoise(dateNoiseData);

        // backtest
        const results = await runBacktest(
            marketsCandles,
            filterdData,
            initialCapital,
            resultCounts,
            k,
            targetRate,
            transactionFee,
            markets.length
        );

        logResult(results);
    } catch (error) {
        console.error("Error averageNoiseRatioSignalCheckBacktest: ", error);
        return "Error in executing the strategy.";
    }
}

async function getCandles(market: string, resultCounts: number) {
    const adjustedApiCounts = adjustApiCounts(resultCounts, 30);

    const candles = await fetchDailyCandles(
        market,
        adjustedApiCounts.toString()
    );

    return {
        market,
        candles,
    };
}

function generateDateNoiseData(
    marketsCandles: IMaretksCandles[],
    resultCounts: number
) {
    let result = [];
    for (let day = 0; day <= resultCounts; day++) {
        let dailyNoiseData: IDateNoiseData = {
            date_time: "",
            noises: [],
        };

        marketsCandles.forEach(({ market, candles }) => {
            const newCandles = candles.slice(day, 30 + day);
            const noiseAverage = calculateAverageNoise(newCandles, market);

            if (!newCandles[newCandles.length - 1]) return;
            if (!dailyNoiseData.date_time) {
                dailyNoiseData.date_time =
                    newCandles[newCandles.length - 1].date_time;
            }

            dailyNoiseData.noises.push({
                market,
                value: noiseAverage,
            });
        });

        if (dailyNoiseData.date_time) result.push(dailyNoiseData);
    }

    return result;
}

function filterAndSortMarketsByNoise(dateNoiseData: IDateNoiseData[]) {
    const reesult = dateNoiseData.map((aNoiseData) => {
        const { date_time, noises } = aNoiseData;

        // 노이즈 0.55 이하 : 절대 모멘텀
        const filtered = noises.filter((item) => item.value < 0.55);

        // 30일 평균 노이즈 값이 가장 작은 종목 n개 선정 : 상대 모멘텀
        const sorted = filtered.sort((a, b) => a.value - b.value);

        return {
            date_time,
            noises: sorted.slice(0, 4),
        };
    });

    return reesult;
}

async function runBacktest(
    marketsCandles: IMaretksCandles[],
    dateNoiseData: IDateNoiseData[],
    initialCapital: number,
    resultCounts: number,
    k: number,
    targetRate: number,
    transactionFee: number,
    size: number
) {
    const { signalData, maxDrawdown } = await runStrategies(
        marketsCandles,
        dateNoiseData,
        initialCapital,
        resultCounts,
        k,
        targetRate,
        transactionFee,
        size
    );

    const tradeData = signalData.map((s) => s.signals);

    const tableData1: ISingal[] = [];
    tradeData.forEach((td) => {
        td.forEach((aTd: ISingal) => {
            tableData1.push(aTd);
        });
    });

    const tableData = tableData1.map((aData) => {
        const position = aData.position ?? 0;
        const profit = aData.profit ?? 0;
        const investment = aData.investment ?? 0;
        return {
            date: aData.date_time,
            market: aData.market,
            range: aData.range.toFixed(2),
            buyPrice: aData.buyPrice ?? 0,
            sellPrice: aData.sellPrice ?? 0,
            position: position.toFixed(2),
            investment: Math.round(investment).toLocaleString() ?? 0,
            capital: Math.round(aData.capital).toLocaleString(),
            profit: Math.round(profit).toLocaleString(),
            tradeCount: aData.tradeCount,
            winCount: aData.winCount,
        };
    });

    // console.table(tableData);

    const finalMetrics = calculateFinalMetrics(signalData, initialCapital);

    return {
        ...finalMetrics,
        maxDrawdown,
    };
}

async function runStrategies(
    marketsCandles: IMaretksCandles[],
    dateNoiseData: IDateNoiseData[],
    capital: number,
    resultCounts: number,
    k: number,
    targetRate: number,
    transactionFee: number,
    size: number
) {
    let mddPrices: number[] = [];
    let tradeCount = 0;
    let winCount = 0;

    const signalData = await Promise.all(
        dateNoiseData.map(async (aNoiseData, index) => {
            // nextCandle이 아닌 실시간 가격이 필요
            const date_time = aNoiseData.date_time;
            // console.log("\n\n *** aNoiseData date_time", date_time); // curent Date

            const signals = await Promise.all(
                aNoiseData.noises.map(async (aNoise, idx) => {
                    const market = aNoise.market;
                    const candles = marketsCandles.filter(
                        (mc) => mc.market === market
                    )[0].candles;

                    const currentCandle = candles[29 + index];
                    const nextCandle = candles[29 + index + 1] || currentCandle;
                    const prevCandle = candles[29 + index - 1];
                    const last5Candles = candles.slice(
                        29 + index - 4,
                        29 + index + 1
                    );

                    // 각 화폐의 가격이 5일 이동 평균보다 높은지 여부 파악
                    const priceMovingAverage = calculateMovingAverage2(
                        last5Candles,
                        5
                    );

                    const isOverPriceAverage =
                        prevCandle.trade_price > priceMovingAverage;

                    // 각 화폐의 레인지 계산 (전일 고가 - 저가)
                    const range = await calculateRange(prevCandle);

                    // 실시간 가격 가져오기, 낮 1시 데이터
                    /* const realDateP = new Date(date_time);
                    realDateP.setDate(realDateP.getDate() + 1);
                    realDateP.setHours(11, 0, 0, 0);
                    const realDate = realDateP.toISOString().slice(0, 19);

                    const realCandle = await fetchMinutesCandles(
                        market,
                        240,
                        6,
                        realDate
                    );
                    const realOpenPrice = realCandle[0].opening_price; */

                    // 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
                    /*  const isBreakOut = checkBreakout2(
                        realOpenPrice,
                        currentCandle,
                        range,
                        k
                    ); */
                    const isBreakOut = checkBreakout(currentCandle, range, k);

                    // 매수 신호 확인
                    const isBuySign =
                        isOverPriceAverage && isBreakOut ? true : false;

                    let thisData: any = {};
                    if (isBuySign) {
                        // 매수
                        // const buyPrice = realOpenPrice;
                        const buyPrice = nextCandle.opening_price;
                        const { investment, prevVolatilityRate } =
                            calculateAdjustedInvestment(
                                range,
                                prevCandle,
                                targetRate,
                                size,
                                capital
                            );
                        const position = investment / buyPrice;
                        capital -= investment;

                        // 메도
                        // const sellPrice =
                        //     realCandle[realCandle.length - 1].trade_price;
                        const sellPrice = nextCandle.trade_price;
                        const profit = (sellPrice - buyPrice) * position;
                        capital += position * sellPrice;

                        // 통계
                        tradeCount++;
                        if (profit > 0) winCount++;

                        mddPrices.push(currentCandle.trade_price);

                        thisData = {
                            buyPrice,
                            sellPrice,
                            position,
                            investment,
                            profit,
                        };
                    }

                    return {
                        ...thisData,
                        date_time: idx === 0 ? date_time : "",
                        market,
                        range: range,
                        capital,
                        tradeCount,
                        winCount,
                    };
                })
            );

            return {
                date_time,
                signals,
            };
        })
    );

    //  mdd
    const maxDrawdown = calculateMDD(mddPrices);

    return { signalData, maxDrawdown };
}

function calculateFinalMetrics(
    signalData: ISignalData[],
    initialCapital: number
) {
    const lastData = signalData[signalData.length - 1];

    const lastSignals = lastData.signals;

    const lastSinganlsLast = lastSignals[lastSignals.length - 1];
    const finalCapital = lastSinganlsLast.capital;
    const performance = (finalCapital / initialCapital - 1) * 100;
    const winRate =
        lastSinganlsLast.tradeCount > 0
            ? (lastSinganlsLast.winCount / lastSinganlsLast.tradeCount) * 100
            : 0;

    return {
        firstDate: signalData[0].date_time,
        lastDate: lastData.date_time,
        finalCapital,
        performance,
        tradeCount: lastSinganlsLast.tradeCount,
        winRate,
    };
}

function logResult(result: IResult) {
    console.log(`\n🔔  다자 가상화폐 + 평균 노이즈 비율\n`);

    console.log(`첫째 날: ${result.firstDate}`);
    console.log(`마지막 날: ${result.lastDate}`);
    console.log(`Trade Count: ${result.tradeCount}번`);
    console.log(
        `Final Capital: ${Math.round(result.finalCapital).toLocaleString()}원`
    );
    console.log(`Performance: ${result.performance.toFixed(2)}%`);
    console.log(`Win Rate: ${result.winRate.toFixed(2)}%`);
    console.log(`maxDrawdown: ${result.maxDrawdown.toFixed(2)}%\n`);
}

/* (async () => {
    const markets = ["KRW-AVAX", "KRW-BTG", "KRW-BTC", "KRW-ETH", "KRW-DOGE"];
    await averageNoiseRatioSignalCheckBacktest(markets, 100000, 100);
})(); */
