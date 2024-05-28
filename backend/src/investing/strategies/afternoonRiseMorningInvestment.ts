// afternoonRiseMorningInvestment

import { fetchMinutesCandles } from "../../services/api";
import { calculateVolatility, formatPrice } from "../utils";

/**
 * 투자전략  : 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절
 * 투자전략 :
 *      - 오전 0시에 가상화폐의 전일 오후(12시 ~ 24시) 수익률과 거래량 체크
 *      - 매수: 전일 오후 수익률 > 0, 전일 오후 거래량 > 오전 거래량
 *      - 자금 관리 : 가상화폐별 투입 금액은 (타깃 변동성 / 특정 화폐의 전일 오후 변동성) / 투자대상 화폐수
 *      - 매도 : 정오
 * 하루 두 번 자정, 정오에 매수하는 전략도 ?
 * 2018년 하락장에서도 이더리움은 수익
 */

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
    }
}

async function generateMarketTradeSignal(
    market: string,
    targetVolatility: number,
    initialCapital: number,
    size: number
) {
    // console.log(`\n *** market: ${market}`);

    // 0. get data
    const currentDate = getDate();
    // console.log("currentDate: ", currentDate); // 2024-05-26T00:00:00

    const candles = await fetchData(market, currentDate);

    const { morningCandles, afternoonCandles } = splitDayCandles(
        market,
        candles
    );

    // 1. 전일 수익률과 거래량, 변동성
    const { afternoonReturnRate, morningVolume, afternoonVolume, volatility } =
        calculateDailyMetrics(afternoonCandles, morningCandles);

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

    const result = {
        market,
        date: currentDate,
        ...tradeSignal,
    };

    return result;
}

function getDate() {
    // "2024-05-26T16:00:00"
    const date = new Date();
    if (date.getHours() < 24) date.setDate(date.getDate() - 1);
    date.setHours(25, 0, 0, 0);
    return date.toISOString().slice(0, 19);
}

async function fetchData(market: string, currentDate: string) {
    try {
        return await fetchMinutesCandles(market, 60, 25, currentDate);
    } catch (error) {
        console.error(`Error fetching  candles market ${market}:`, error);
    }
}

function splitDayCandles(marekt: string, candles: ICandle[]) {
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

function calculateDailyMetrics(
    afternoonCandles: ICandle[],
    morningCandles: ICandle[]
) {
    // 1-1. 전일 오후 (12시 ~ 24시) 수익률
    const afternoonOpenPrice = afternoonCandles[0].opening_price;
    const afternoonClosePrice =
        afternoonCandles[afternoonCandles.length - 1].trade_price;
    const afternoonReturnRate =
        (afternoonClosePrice - afternoonOpenPrice) / afternoonOpenPrice;

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

    // 1-4. 전일 오후 변동성
    const volatility = calculateVolatility(afternoonCandles);

    return { afternoonReturnRate, morningVolume, afternoonVolume, volatility };
}

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
        const rate = targetVolatility / volatility / 100;
        const unitRate = rate / size;
        const investment = unitRate * initialCapital;
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

function createMessage(data: any[]) {
    const title = `\n 🔔 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절\n`;
    const memo = `- 매일 자정에 확인, 매도는 다음 날 정오\n\n`;
    const message = data
        .map(
            (aData) =>
                `📈 [${aData.market}] 
날    짜 : ${aData.date.slice(0, 10)}
신    호 : ${aData.signal}
매수금액 : ${formatPrice(Math.round(aData.investment))}원`
        )
        .join("\n\n");
    return `${title}${memo}${message}\n`;
}
/* 
(async () => {
    const markets = ["KRW-DOGE"];
    const result = await afternoonRiseMorningInvestment(
        markets,
        100000,
        2 // targetVolatility
    );
    console.log(result);
})();
 */
