/**
 * checkDailyMovingAverage
 * 가상화폐의 5일 이동평균을 체크하고,
 * 그 결과에 따라 매수, 보유, 매도, 또는 유보를 결정
 * 일봉 데이터는 받는 데이터가 오전 9시 기준
 */

import { sendTelegramMessageToChatId } from "../../notifications";
import { fetchDailyCandles, fetchTicker } from "../../services/api";
import { calculateMovingAverage, formatPrice } from "../utils";

export async function checkDailyMovingAverage(
    markets: string[],
    period: number = 3 // 이동 평균
) {
    try {
        const results = await Promise.all(
            markets.map(
                async (market: string) =>
                    await checkMovingAverage(market, period)
            )
        );

        const validResults = results.filter(
            (result): result is IDailyMovingAverageResult =>
                result !== undefined
        );

        return makeMessages(validResults, period);
    } catch (error) {
        console.error(`Error checking daily moving averages:`, error);
    }
}

async function checkMovingAverage(market: string, period: number) {
    try {
        const fetchedData = await fetchDailyCandles(market, period.toString());
        const movingAverages = calculateMovingAverage(fetchedData, period);
        const currentPrice = (await fetchTicker(market))[0].trade_price;
        const latestMovingAverage = movingAverages[movingAverages.length - 1];

        const signal = currentPrice > latestMovingAverage ? "매수" : "매도";

        return {
            market,
            movingAverage: latestMovingAverage,
            currentPrice: currentPrice,
            signal,
        };
    } catch (error) {
        console.error(
            `Error checking moving average for market ${market}:`,
            error
        );
    }
}

function makeMessages(data: IDailyMovingAverageResult[], period: number) {
    const title = `\n 🔔 일캔들 ${period}일 이동평균 신호 확인\n\n`;
    const message = data
        .map(
            (aData) =>
                `📈 [${aData.market}] 
현재 가격: ${formatPrice(aData.currentPrice)}원
평균 가격: ${formatPrice(aData.movingAverage)}원
신호: ${aData.signal}`
        )
        .join("\n\n");

    return `${title}${message}\n`;

    // sendTelegramMessageToChatId(messages);
}
