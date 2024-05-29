/**
 * checkDailyMovingAverage
 *
 * 투자전략 : 이동 평균 + 현금 비중 80% 이상
 * 투자전략 :
 *      - 여러분이 선택한 가상화폐의 5일 이동평균을 1일 1회 체크
 *      - 현재 가격이 이동평균보다 높으면 매수 또는 보유
 *      - 현재 가격이 이동평균보다 낮으면 매도 또는 투자 볼퓨
 *      - 현금 비중은 80% 유지
 * 자금관리 : 가상화폐별 투입 금액은 자산의 20%/가상화퍠 수
 *             (5개의 화폐를 포함할 경우 각 화폐에 자산의 20%/5 = 4% 투자)
 *
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

        return createMessage(validResults, period);
    } catch (error) {
        console.error(`Error checking daily moving averages:`, error);
    }
}

async function checkMovingAverage(market: string, period: number) {
    try {
        const fetchedData = await fetchDailyCandles(
            market,
            (period + 1).toString()
        );
        const movingAverages = calculateMovingAverage(fetchedData, period);

        const prevPrice = fetchedData[fetchedData.length - 2].trade_price;
        const currentPrice = (await fetchTicker(market))[0].trade_price;
        const prevMovingAverage = movingAverages[movingAverages.length - 2];
        const latestMovingAverage = movingAverages[movingAverages.length - 1];

        // const isPrevBuy = prevPrice > prevMovingAverage;
        const signal =
            currentPrice > latestMovingAverage
                ? "매수 또는 유지"
                : "매도 또는 유보";

        // let signal;
        // if (isPrevBuy) {
        //     signal = currentPrice > latestMovingAverage ? "매수 유지" : "매도";
        // } else {
        //     signal = currentPrice > latestMovingAverage ? "매수" : "유보";
        // }

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

function createMessage(data: IDailyMovingAverageResult[], period: number) {
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
