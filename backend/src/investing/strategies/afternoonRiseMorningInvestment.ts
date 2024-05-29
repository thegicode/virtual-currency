// afternoonRiseMorningInvestment

/**
 * 투자전략  : 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절
 * 오전 천국, 오후 지옥 전략
 * 투자전략 :
 *      - 오전 0시에 가상화폐의 전일 오후(12시 ~ 24시) 수익률과 거래량 체크
 *      - 매수: 전일 오후 수익률 > 0, 전일 오후 거래량 > 오전 거래량
 *      - 자금 관리 : 가상화폐별 투입 금액은 (타깃 변동성 / 특정 화폐의 전일 오후 변동성) / 투자대상 화폐수
 *      - 매도 : 정오
 * 하루 두 번 자정, 정오에 매수하는 전략도 ?
 * 2018년 하락장에서도 이더리움은 수익
 */

import { fetchMinutesCandles } from "../../services/api";
import {
    calculateCandleReturnRate,
    calculateInvestmentAmount,
    calculateVolatility,
    calculateVolume,
    formatPrice,
} from "../utils";

export async function afternoonRiseMorningInvestment(
    markets: string[],
    initialCapital: number,
    targetVolatility: number = 2
) {
    try {
        const results = await Promise.all(
            markets.map(
                async (market: string) =>
                    await generateMarketTradeSignal(
                        market,
                        targetVolatility,
                        initialCapital,
                        markets.length
                    )
            )
        );

        return createMessage(results);
    } catch (error) {
        console.error("Error afternoonRiseMorningInvestment: ", error);
        return "Error in executing the strategy.";
    }
}

/**
 * 특정 시장에 대한 거래 신호를 생성
 */
async function generateMarketTradeSignal(
    market: string,
    targetVolatility: number,
    initialCapital: number,
    size: number
) {
    // 0. get data
    const currentDate = getDate();
    // console.log("currentDate: ", currentDate);

    const candles = await fetchData(market, currentDate);

    const { morningCandles, afternoonCandles } = splitDayCandles(candles);
    // console.log("morningCandles: ", morningCandles);
    // console.log("afternoonCandles: ", afternoonCandles);

    // 1. 전일 수익률과 거래량, 변동성
    const { afternoonReturnRate, morningVolume, afternoonVolume, volatility } =
        calculateDailyMetrics(afternoonCandles, morningCandles);

    // console.log("\nmarket: ", market);
    // console.log("afternoonReturnRate", (afternoonReturnRate * 100).toFixed(2));
    // console.log("morningVolume", morningVolume.toLocaleString());
    // console.log("afternoonVolume", afternoonVolume.toLocaleString());
    // console.log("volatility", market, volatility.toFixed(2));

    // 2. 매수 판단: 전일 오후 수익률 > 0, 전일 오후 거래량 > 오전 거래량
    const tradeSignal = generateTradeSignal(
        afternoonReturnRate,
        afternoonVolume,
        morningVolume,
        targetVolatility,
        volatility,
        initialCapital,
        size
    );

    return {
        market,
        date: currentDate,
        volatility,
        ...tradeSignal,
    };
}

/**
 * 현재 날짜와 시간을 "yyyy-MM-ddTHH:mm:ss" 형식으로 반환
 */
function getDate() {
    // 2024-05-27T00:00:00+09:00
    const date = new Date();
    if (date.getHours() < 24) date.setDate(date.getDate() - 1);
    date.setHours(9, 0, 0, 0);
    const newDate = date.toISOString().slice(0, 19);
    return `${newDate}+09:00`;
}

/**
 * 특정 시장에 대한 데이터를 가져옴
 */
async function fetchData(market: string, currentDate: string) {
    try {
        return await fetchMinutesCandles(market, 60, 24, currentDate);
    } catch (error) {
        console.error(`Error fetching  candles market ${market}:`, error);
        throw error;
    }
}

/**
 * 주어진 분봉 데이터를 오전과 오후로 분할
 */
function splitDayCandles(candles: ICandle[]) {
    const morningCandles = candles.slice(0, 12); // 전날 오전 0시 ~ 12시
    const afternoonCandles = candles.slice(12, 24); // 전날 오후 12시 ~ 24시

    // 전일 오전
    // '2024-05-26T00:00:00'  ~ '2024-05-26T11:00:00'

    // 전일 오후
    //  '2024-05-26T12:00:00' ~ '2024-05-26T23:00:00'

    return {
        morningCandles,
        afternoonCandles,
    };
}

/**
 * 전일 오후 수익률, 전일 오전 및 오후 거래량, 전일 오후 변동성 계산
 */
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

/**
 * 매수 또는 매도 신호를 생성
 */
function generateTradeSignal(
    afternoonReturnRate: number,
    afternoonVolume: number,
    morningVolume: number,
    targetVolatility: number,
    volatility: number,
    initialCapital: number,
    size: number
) {
    if (afternoonReturnRate > 0 && afternoonVolume > morningVolume) {
        const investment = calculateInvestmentAmount(
            targetVolatility,
            volatility,
            size,
            initialCapital
        );

        return {
            signal: "매수 또는 유지",
            investment,
        };
    } else {
        return {
            signal: "매도 또는 유보",
        };
    }
}

interface IResult {
    market: string;
    date: string;
    signal: string;
    volatility: number;
    investment?: number;
}
function createMessage(results: IResult[]) {
    const title = `\n 🔔 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절\n`;
    const memo = `- 매일 자정에 확인, 매도는 다음 날 정오\n\n`;

    const message = results
        .map((result) => {
            const investmentMessage = result.investment
                ? `매수금액 : ${formatPrice(Math.round(result.investment))}원`
                : "";

            return `📈 [${result.market}] 
날    짜 : ${result.date.slice(0, 10)}
신    호 : ${result.signal}
volatility : ${result.volatility.toFixed(2)}
${investmentMessage}`;
        })
        .join("\n\n");
    return `${title}${memo}${message}\n`;
}

/* (async () => {
    const markets = ["KRW-DOGE"];
    const result = await afternoonRiseMorningInvestment(
        markets,
        100000,
        2 // targetVolatility
    );
    console.log(result);
})();
 */
