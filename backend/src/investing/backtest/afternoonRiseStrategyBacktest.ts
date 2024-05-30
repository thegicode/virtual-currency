/**
 * 투자전략  : 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절
 * 투자대상 : 아무 가상화폐 몇 개 선택
 * 거래비용  : 0.1% 적용
 *             - 지정가 매수가 양호한 전략이라 거래 비용이 상대적으로 적게 발생
 * 투자전략 :
 *      - 오전 0시에 가상화폐의 전일 오후(12시 ~ 24시) 수익률과 거래량 체크
 *      - 매수: 전일 오후 수익률 > 0, 전일 오후 거래량 > 오전 거래량
 *      - 자금 관리 : 가상화폐별 투입 금액은 (타깃 변동성 / 특정 화폐의 전일 오후 변동성) / 투자대상 화폐수
 *      - 매도 : 정오
 *
 * 재료 : 전일 오후 (12시 ~ 24시) 수익률과
 *       전일 오전 & 오후 거래량
 *
 * 하루 두 번 자정, 정오에 매수하는 전략도 ?
 * 2018년 하락장에서도 이더리움은 수익
 */

interface ITradeData {
    date: string;
    signal: string;
    volatility: number;
    price: number;
    capital: number;
    position: number;
    investment: number;
    profit: number;
    tradeCount: number;
    winCount: number;
}

interface IResult {
    market: string;
    tradesData: ITradeData[];
    tradeCount: number;
    finalCapital: number;
    performance: number;
    maxDrawdown: number;
    winRate: number;
}

import { fetchMinutesCandles } from "../../services/api";
import {
    calculateCandleReturnRate,
    calculateMDD,
    calculateRiskAdjustedCapital,
    calculateVolatility,
    calculateVolume,
} from "../utils";

export async function afternoonRiseMorningInvestmentBacktest(
    markets: string[],
    initialCapital: number,
    period: number,
    targetVolatility: number = 2 // 타깃 변동성
) {
    // const transactionFee = 0.001; // 거래 비용 0.1%
    const transactionFee = 0;

    const results = await Promise.all(
        markets.map(
            async (market) =>
                await backtest(
                    markets,
                    market,
                    period,
                    targetVolatility,
                    initialCapital,
                    transactionFee
                )
        )
    );

    const messages = createMessage(results);
    console.log(messages);
}

async function backtest(
    markets: string[],
    market: string,
    period: number,
    targetVolatility: number,
    initialCapital: number,
    transactionFee: number
) {
    // console.log("\n *** market : ", market);

    let capital = initialCapital;
    let position = 0;
    let tradeCount = 0;
    let tradesData: any = [];
    let winCount = 0;
    let buyPrice = 0;
    let currentPrice = 0;
    let mddPrices: number[] = [];

    for (let day = 1; day <= period; day++) {
        // console.log("\n Day", day);

        const currentDate = `${getToDate(day, period)}+09:00`;
        // console.log("\n currentDate", currentDate);

        // 0. get data
        const { morningCandles, afternoonCandles } =
            await fetchAndSplitDailyCandles(market, currentDate);

        // 1. 전일 수익률과 거래량, 변동성
        const {
            afternoonReturnRate,
            morningVolume,
            afternoonVolume,
            volatility,
        } = calculateDailyMetrics(afternoonCandles, morningCandles);

        // 2. 매수 판단 : 전일 오후 수익률 > 0, 전일 오후 거래량 > 오전 거래량
        let signalData: Partial<ITradeData> = {};

        const shouldBuy =
            afternoonReturnRate > 0 && afternoonVolume > morningVolume;

        currentPrice =
            afternoonCandles[afternoonCandles.length - 1].trade_price;

        if (shouldBuy && buyPrice === 0) {
            // 매수 자금 : 가상화폐별 투입 금액은 (타깃 변동성 / 특정 화폐의 전일 오후 변동성) / 투자대상 화폐수
            let investmentAmount = calculateRiskAdjustedCapital(
                targetVolatility,
                volatility,
                markets.length,
                capital
            );

            if (capital <= investmentAmount) {
                investmentAmount = capital;
            }

            buyPrice = currentPrice;
            position += investmentAmount / currentPrice;
            capital -= investmentAmount;
            signalData = {
                signal: "Buy",
                volatility,
                investment: investmentAmount,
            };
            // console.log("shouldBuy : capital", capital);
            // console.log("shouldBuy : investmentAmount", investmentAmount);
        } else if (!shouldBuy && position > 0) {
            // 매도 : 정오 -> 정오 데이터 가져오기
            const atNoonTime = currentDate.slice(0, 11) + "04:00:00";
            const ticker = await fetchMinutesCandles(market, 60, 1, atNoonTime);
            const sellPrice = ticker[0].trade_price;
            const profit = (sellPrice - buyPrice) * position;
            capital += position * sellPrice * (1 - transactionFee);
            if (profit > 0) winCount++;

            tradeCount++;
            position = 0;
            buyPrice = 0;

            signalData = {
                signal: "Sell",
                profit,
            };
        } else if (shouldBuy && buyPrice !== 0) {
            signalData = {
                signal: "Hold",
            };
        }

        signalData = {
            ...signalData,
            date: currentDate,
            price: currentPrice,
            capital,
            position,
            tradeCount,
            winCount,
            investment: signalData.investment ?? 0,
            profit: signalData.profit ?? 0,
            volatility: volatility ?? 0,
        };

        // console.log("signalData", signalData);

        tradesData.push({
            ...signalData,
        });

        if (signalData.signal !== "") mddPrices.push(currentPrice);
    }

    const lastTradeData = tradesData[tradesData.length - 1];

    const finalCapital = ["Buy", "Hold"].includes(lastTradeData.signal)
        ? capital + position * lastTradeData.price
        : lastTradeData.capital;
    const performance = (finalCapital / initialCapital - 1) * 100;
    const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;

    // mdd
    const maxDrawdown = calculateMDD(mddPrices);

    tradesData = tradesData.map((aData: ITradeData) => {
        return {
            date: aData.date.slice(0, 10),
            price: aData.price,
            signal: aData.signal ?? "",
            volatility: aData.volatility && aData.volatility.toFixed(2),
            position: aData.position === 0 ? 0 : aData.position.toFixed(5),
            investment: Math.round(aData.investment).toLocaleString(),
            profit: Math.round(aData.profit).toLocaleString(),
            capital: Math.round(aData.capital).toLocaleString(),
            tradeCount: aData.tradeCount,
            winCount: aData.winCount,
        };
    });

    // console.table(tradesData);

    return {
        market,
        finalCapital,
        performance,
        winRate,
        maxDrawdown,
        tradeCount,
        winCount,
        tradesData,
    };
}

function getToDate(day: number, period: number) {
    const now = new Date();
    now.setMonth(now.getMonth());
    now.setDate(now.getDate() - period + day - 1);
    now.setHours(9, 0, 0, 0);
    return now.toISOString().slice(0, 19);
}

async function fetchAndSplitDailyCandles(market: string, currentDate: string) {
    const candles = await fetchMinutesCandles(market, 60, 24, currentDate);

    // console.log("candles", candles);

    const morningCandles = candles.slice(0, 12); // 전날 오전 0시 ~ 12시
    const afternoonCandles = candles.slice(12, 24); // 전날 오후 12시 ~ 24시

    // console.log("morningCandles", morningCandles);
    // console.log("afternoonCandles", afternoonCandles);

    return {
        morningCandles,
        afternoonCandles,
        allCandles: candles,
    };
}

function calculateDailyMetrics(
    afternoonCandles: ICandle[],
    morningCandles: ICandle[]
) {
    // 1-1. 전일 오후 (12시 ~ 24시) 수익률
    const afternoonReturnRate = calculateCandleReturnRate(afternoonCandles);

    // 1-2. 전일 오전 (0시 ~ 12시) 거래량
    const morningVolume = calculateVolume(morningCandles);

    // 1-3. 전일 오후 (12시 ~ 24시) 거래량
    const afternoonVolume = calculateVolume(afternoonCandles);

    // 1-4. 전일 오후 변동성
    const volatility = calculateVolatility(afternoonCandles);

    return { afternoonReturnRate, morningVolume, afternoonVolume, volatility };
}

function createMessage(results: IResult[]) {
    const title = `\n🔔 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절 backtest\n`;
    const messages = results.map((result) => {
        // console.table(result.tradesData);

        return `📈 [${result.market}]
첫째 날: ${result.tradesData[0].date}
마지막 날: ${result.tradesData[result.tradesData.length - 1].date}
Total Trades: ${result.tradeCount}번
Final Capital: ${Math.round(result.finalCapital).toLocaleString()}원
Performance: ${result.performance.toFixed(2)}%
MDD: ${result.maxDrawdown.toFixed(2)}%
Win Rate: ${result.winRate.toFixed(2)}%\n\n`;
    });

    return `${title}${messages}`;
}

// 실행 예제
/* (async () => {
    const initialCapital = 10000;
    const markets = ["KRW-DOGE"];
    const apiCounts = 200;
    const targetVolatility = 2; // 타깃 변동성

    const backtestResults =
        await multiCryptoAfternoonRiseMorningInvestmentBacktest(
            markets,
            initialCapital,
            apiCounts,
            targetVolatility
        );

    console.log(backtestResults);
})();
 */
