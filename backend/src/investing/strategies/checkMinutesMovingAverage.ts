import { getChatIds, sendMessagesToUsers } from "../../notifications";
import { fetchMinutes, fetchTicker } from "../../services/api";
import { calculateMovingAverage, formatTimestampToKoreanTime } from "../utils";

// candleUnit분 캔들 기준으로 movingAveragePeriod 이동평균선을 구한 다음
// 실시간 가격이 movingAveragePeriod 이동 평균선보다 높으면 매수 또는 보유
// movingAveragePeriod 이동평균선보다 낮으면 매도 또는 유보
// candleUnit 분마다 실행

export async function checkMinutesMovingAverage(
    markets: string[],
    candleUnit: TCandleUnit, // interval time, candle unit
    movingAveragePeriod: number // 이동평균선 수치
) {
    let executionCount = 0;
    const chatIds = (await getChatIds()) as number[];

    // 첫 번째 실행
    await executeAndNotifyInterval();

    // candleUnit분마다 실행
    setInterval(
        executeAndNotifyInterval,
        1000 * 60 * candleUnit
        // 3000
    );

    async function executeAndNotifyInterval() {
        try {
            await executeAndNotify(
                movingAveragePeriod,
                executionCount,
                markets,
                candleUnit,
                chatIds
            );
            executionCount++;
        } catch (error) {
            console.error(
                `Error during interval execution: ${
                    error instanceof Error ? error.message : error
                }`
            );
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
    const message = formatTradeInfosMessage(
        tradeInfos,
        executionCount,
        candleUnit,
        movingAveragePeriod
    );
    console.log(message);
    // send telegram message
    // sendMessagesToUsers(message, chatIds);
}

async function getTradeInfos(
    markets: string[],
    movingAveragePeriod: number,
    candleUnit: TCandleUnit
) {
    // 5 이동평균과 실시간 가격 비교
    const promises = markets.map(async (market) => {
        const candles = await fetchMinutes(
            market,
            candleUnit,
            movingAveragePeriod
        );

        const movingAverage = calculateMovingAverage(candles)[0];
        const latestCandle = candles[candles.length - 1];
        const ticker = (await fetchTicker(market))[0];

        if (!ticker) {
            throw new Error(`Ticker data for market ${market} not found`);
        }

        const signal = ticker.trade_price > movingAverage ? "매수" : "매도";

        return {
            market,
            averageTime: latestCandle.time,
            averagePrice: movingAverage,
            tickerTime: ticker.trade_timestamp,
            tickerTradePrice: ticker.trade_price,
            signal,
        };
    });

    return Promise.all(promises);
}

function formatTradeInfosMessage(
    tradeInfos: any[],
    executionCount: number,
    candleUnit: TCandleUnit,
    movingAveragePeriod: number
) {
    const title = `\n 🔔 ${candleUnit}분캔들의 ${movingAveragePeriod}이동평균 ${
        executionCount + 1
    }번째 실행 🔔\n\n`;

    const message = tradeInfos
        .map(
            (info) =>
                `📈 [${info.market}]
평균 시간: ${info.averageTime}
티커 시간: ${formatTimestampToKoreanTime(info.tickerTime)}
평균 가격: ${info.averagePrice.toLocaleString()}원
현재 가격: ${info.tickerTradePrice.toLocaleString()}원
신호: ${info.signal}`
        )
        .join("\n\n");

    return `${title}${message}\n`;
}
