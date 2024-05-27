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

import { fetchMinutesCandles, fetchTicker } from "../../services/api";
import { calculateVolatility } from "../utils";

export async function multiCryptoAfternoonRiseMorningInvestmentBacktest(
    markets: string[],
    initialCapital: number,
    period: number,
    targetVolatility: number = 2 // 타깃 변동성
) {
    const transactionFee = 0.001; // 거래 비용 0.1%

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

    console.log(
        `\n🔔 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절 backtest\n`
    );

    results.forEach((result) => {
        console.log(`📈 [${result.market}]`);
        // console.log(`첫째 날: ${result.firstDate}`);
        // console.log(`마지막 날: ${result.lastDate}`);
        console.log(`Total Trades: ${result.trades}번`);
        console.log(
            `Final Capital: ${Math.round(
                result.finalCapital
            ).toLocaleString()}원`
        );
        console.log(`Performance: ${result.performance.toFixed(2)}%`);
        console.log(`MDD: ${result.maxDrawdown.toFixed(2)}%`);
        console.log(`Win Rate: ${result.winRate.toFixed(2)}%`);
        // console.log("Trade Log:", result.log.join("\n"));
        console.table(result.tradeData);
        console.log("");
    });

    return results;
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
    let trades = 0;
    let tradeData = [];
    let wins = 0;
    let peakCapital = initialCapital;
    let maxDrawdown = 0;
    let buyPrice = 0;
    let currentPrice = 0;
    let candles: ICandle[] = [];

    for (let day = 1; day <= period; day++) {
        // console.log("\n Day", day);

        const currentDate = `${getToDate(day, period)}+09:00`;
        // console.log("currentDate: ", currentDate);

        // 0. get data
        const { morningCandles, afternoonCandles, allCandles } =
            await fetchAndSplitDailyCandles(market, currentDate);
        candles = allCandles;

        // 1. 전일 수익률과 거래량, 변동성
        const {
            afternoonReturnRate,
            morningVolume,
            afternoonVolume,
            volatility,
        } = calculateDailyMetrics(afternoonCandles, morningCandles);

        // 2. 매수 판단
        const shouldBuy = shouldBuyBasedOnMetrics(
            afternoonReturnRate,
            afternoonVolume,
            morningVolume
        );

        let investment, signal;

        // 4. 매수 / 매도
        if (shouldBuy) {
            ({
                capital,
                position,
                currentPrice,
                buyPrice,
                trades,
                investment,
                signal,
            } = executeBuy(
                markets,
                afternoonCandles,
                targetVolatility,
                volatility,
                capital,
                position,
                trades,
                initialCapital
            ));
            tradeData.push({
                day,
                currentDate,
                signal,
                capital,
                position,
                currentPrice,
                buyPrice,
                trades,
                investment,
            });
        } else {
            ({ capital, position, currentPrice, trades, wins, signal } =
                await executeSell(
                    market,
                    currentDate,
                    position,
                    capital,
                    transactionFee,
                    buyPrice,
                    trades,
                    wins
                ));

            tradeData.push({
                day,
                currentDate,
                signal,
                capital,
                position,
                currentPrice,
                buyPrice,
                trades,
                wins,
            });
        }

        // 최대 낙폭 계산
        ({ peakCapital, maxDrawdown } = calculateMaxDrawdown(
            capital,
            position,
            currentPrice,
            peakCapital,
            maxDrawdown
        ));
    }

    // const finalCapital =
    //     capital + position * candles[candles.length - 1].trade_price;
    const finalCapital = tradeData[tradeData.length - 1].capital;
    const performance = (finalCapital / initialCapital - 1) * 100;
    const winRate = trades > 0 ? (wins / trades) * 100 : 0;

    return {
        market,
        finalCapital,
        performance,
        winRate,
        maxDrawdown,
        trades,
        wins,
        tradeData,
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
    const afternoonReturnRate =
        (afternoonCandles[afternoonCandles.length - 1].trade_price -
            afternoonCandles[0].trade_price) /
        afternoonCandles[0].trade_price;

    // console.log("afternoonReturnRate", afternoonReturnRate * 100);

    // 1-2. 전일 오전 (0시 ~ 12시) 거래량
    const morningVolume = morningCandles.reduce(
        (acc: number, cur: ICandle) => acc + cur.candle_acc_trade_volume,
        0
    );
    // console.log("morningVolume", morningVolume);

    // 1-3. 전일 오후 (12시 ~ 24시) 거래량
    const afternoonVolume = afternoonCandles.reduce(
        (acc: number, cur: ICandle) => acc + cur.candle_acc_trade_volume,
        0
    );
    // console.log("afternoonVolume", afternoonVolume);

    // 1-4. 전일 오후 변동성
    const volatility = calculateVolatility(afternoonCandles);

    return { afternoonReturnRate, morningVolume, afternoonVolume, volatility };
}

function shouldBuyBasedOnMetrics(
    afternoonReturnRate: number,
    afternoonVolume: number,
    morningVolume: number
) {
    // 매수 판단: 전일 오후 수익률 > 0, 전일 오후 거래량 > 오전 거래량
    return afternoonReturnRate > 0 && afternoonVolume > morningVolume;
}

function executeBuy(
    markets: string[],
    afternoonCandles: ICandle[],
    targetVolatility: number,
    volatility: number,
    capital: number,
    position: number,
    trades: number,
    initialCapital: number
) {
    // 매수 자금 : 가상화폐별 투입 금액은 (타깃 변동성 / 특정 화폐의 전일 오후 변동성) / 투자대상 화폐수
    const tradePrice =
        afternoonCandles[afternoonCandles.length - 1].trade_price;
    const buyPrice = tradePrice;
    // const investment =
    //     ((targetVolatility / volatility) * initialCapital) / markets.length;

    const rate = targetVolatility / volatility;
    const unitRate = rate / markets.length;
    const investment = unitRate * initialCapital;
    let signal = "";

    const amountToBuy = investment / tradePrice;
    if (capital >= investment) {
        capital -= investment;
        position += amountToBuy;
        trades++;
        signal = "매수";
        // console.log("Buy: ");
        // console.log("trades", trades);
        // console.log("currentPrice ", tradePrice);
        // console.log("amountToBuy ", amountToBuy);
        // console.log("investment ", investment);
        // console.log("capital ", capital);
    }
    return {
        capital,
        position,
        currentPrice: tradePrice,
        buyPrice,
        trades,
        investment,
        signal,
    };
}

async function executeSell(
    market: string,
    currentDate: string,
    position: number,
    capital: number,
    transactionFee: number,
    buyPrice: number,
    trades: number,
    wins: number
) {
    // 매도 : 정오 -> 정오 데이터 가져오기
    const atNoonTime = currentDate.slice(0, 11) + "04:00:00";
    const ticker = await fetchMinutesCandles(market, 60, 1, atNoonTime);
    const currentPrice = ticker[0].trade_price;
    let signal = "";

    if (position > 0) {
        capital += position * currentPrice * (1 - transactionFee);
        if (currentPrice > buyPrice) wins++;
        position = 0;
        trades++;
        signal = "매도";
        // console.log("Sell: ");
        // console.log("trades", trades);
        // console.log("currentPrice ", currentPrice);
        // console.log("capital ", capital);
    }

    return {
        capital,
        position,
        currentPrice,
        trades,
        wins,
        signal,
    };
}

function calculateMaxDrawdown(
    capital: number,
    position: number,
    currentPrice: number,
    peakCapital: number,
    maxDrawdown: number
) {
    // 최대 낙폭 계산
    const currentTotal = capital + position * currentPrice;
    // console.log("currentTotal: ", currentTotal);
    if (currentTotal > peakCapital) {
        peakCapital = currentTotal;
    }
    const drawdown = ((peakCapital - currentTotal) / peakCapital) * 100;
    if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
    }

    return { peakCapital, maxDrawdown };
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
