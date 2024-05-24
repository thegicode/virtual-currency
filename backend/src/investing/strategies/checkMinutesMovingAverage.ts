// checkMinutesMovingAverage
import {
    getChatIds,
    sendMessagesToUsers,
    sendTelegramMessageToChatId,
} from "../../notifications";
import { fetchMinutesCandles, fetchTicker } from "../../services/api";
import {
    calculateMovingAverage,
    formatDateString,
    formatPrice,
    formatTimeString,
} from "../utils";

// candleUnit분 캔들 기준으로 movingAveragePeriod 이동평균선을 구한 다음
// 실시간 가격이 movingAveragePeriod 이동 평균선보다 높으면 매수 또는 보유
// movingAveragePeriod 이동평균선보다 낮으면 매도 또는 유보
// candleUnit 분마다 실행

export async function checkMinutesMovingAverage(
    markets: string[],
    candleUnit: TCandleUnit, // interval time, candle unit
    movingAveragePeriod: number, // 이동평균선 수치
    callback: (message: string) => void
) {
    let executionCount = 0;
    const chatIds = (await getChatIds()) as number[];

    // 첫 번째 실행이후 candleUnit분 간격 실행
    await executeAndNotifyInterval();

    // candleUnit분마다 실행
    /* setInterval(
        async () => {
            await executeAndNotifyInterval();
        },
        1000 * 60 * candleUnit
        // 3000
    );
 */
    async function executeAndNotifyInterval() {
        try {
            const message = await executeAndNotify(
                movingAveragePeriod,
                executionCount,
                markets,
                candleUnit,
                chatIds
            );
            callback(message);
            executionCount++;
        } catch (error) {
            console.error(
                `Error during interval execution: ${
                    error instanceof Error ? error.message : error
                }`
            );
        } finally {
            // candleUnit분 후에 다시 실행
            setTimeout(executeAndNotifyInterval, 1000 * 60 * candleUnit);
        }
    }
}

async function executeAndNotify(
    movingAveragePeriod: number,
    executionCount: number,
    markets: string[],
    candleUnit: TCandleUnit,
    chatIds: number[]
) {
    const tradeInfos = await getTradeInfos(
        markets,
        movingAveragePeriod,
        candleUnit
    );

    const message = createMessage(
        tradeInfos,
        executionCount,
        candleUnit,
        movingAveragePeriod
    );

    // send telegram message
    // sendMessagesToUsers(message, chatIds);
    // sendTelegramMessageToChatId(message);

    return message;
}

async function getTradeInfos(
    markets: string[],
    movingAveragePeriod: number,
    candleUnit: TCandleUnit
) {
    // 5 이동평균과 실시간 가격 비교
    const promises = markets.map(async (market) => {
        const candles = await fetchMinutesCandles(
            market,
            candleUnit,
            movingAveragePeriod
        );

        const movingAverage = calculateMovingAverage(candles)[0];
        const latestCandle = candles[candles.length - 1];
        const ticker = (await fetchTicker(market))[0];

        const tickerDate =
            formatDateString(ticker.trade_date_kst) +
            "T" +
            formatTimeString(ticker.trade_time_kst);

        if (!ticker) {
            throw new Error(`Ticker data for market ${market} not found`);
        }

        const signal = ticker.trade_price > movingAverage ? "매수" : "매도";

        return {
            market,
            averageTime: latestCandle.date_time,
            averagePrice: movingAverage,
            tickerDate,
            tickerTradePrice: ticker.trade_price,
            signal,
        };
    });

    return Promise.all(promises);
}

function createMessage(
    tradeInfos: any[],
    executionCount: number,
    candleUnit: TCandleUnit,
    movingAveragePeriod: number
) {
    const title = `\n 🔔 ${candleUnit}분캔들의 ${movingAveragePeriod} 이동평균 ${
        executionCount + 1
    }번째 실행\n\n`;

    const message = tradeInfos
        .map((info) => {
            return `📈 [${info.market}]
평균 시간: ${info.averageTime}
티커 시간: ${info.tickerDate}
평균 가격: ${formatPrice(info.averagePrice)}원
현재 가격: ${formatPrice(info.tickerTradePrice)}원
신호: ${info.signal}`;
        })
        .join("\n\n");

    return `${title}${message}\n`;
}
