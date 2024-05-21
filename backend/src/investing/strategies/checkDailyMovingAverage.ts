/**
 * checkDailyMovingAverage
 * 가상화폐의 5일 이동평균을 체크하고,
 * 그 결과에 따라 매수, 보유, 매도, 또는 유보를 결정
 * 일봉 데이터는 오전 9시 기준
 */

import { sendTelegramMessageToChatId } from "../../notifications";
import { fetchDailyCandles, fetchTicker } from "../../services/api";
import { calculateMovingAverage } from "../utils";

export async function checkDailyMovingAverage(
    markets: string[],
    unit: number = 3
) {
    const data = await Promise.all(
        markets.map(async (market: string) => {
            try {
                return await checkMovingAverage(market, unit);
            } catch (error) {
                console.error(
                    `Error checking moving average for market ${market}:`,
                    error
                );
            }
        })
    );

    makeMessageAndNotify(data as ICheckMovingAverage[], unit);
}

async function checkMovingAverage(market: string, unit: number) {
    try {
        const fetchedData = await fetchDailyCandles(market, unit.toString());
        const movingAverages = calculateMovingAverage(fetchedData);
        const currentPrice = (await fetchTicker(market))[0].trade_price;
        const latestMovingAverage = movingAverages[movingAverages.length - 1];

        const signal =
            currentPrice > latestMovingAverage
                ? "매수 신호입니다."
                : "매도 신호입니다.";

        return {
            market,
            movingAverage: latestMovingAverage,
            currentPrice: currentPrice,
            signal,
        };
    } catch (error) {
        console.error(
            `Error in checkMovingAverage for market ${market}:`,
            error
        );
    }
}

function makeMessageAndNotify(data: ICheckMovingAverage[], unit: number) {
    const messages =
        `${unit}일 이동평균 신호 확인 \n\n` +
        data
            .map(
                (aData: any) =>
                    `[${aData.market}] 
이동평균값: ${aData.movingAverage.toLocaleString()}
현재가격: ${aData.currentPrice.toLocaleString()}
${aData.signal}`
            )
            .join("\n\n");

    console.log(messages);

    sendTelegramMessageToChatId(messages);
}
