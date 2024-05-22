import { getChatIds, sendMessagesToUsers } from "../../notifications";
import { fetchMinutes, fetchTicker } from "../../services/api";
import { calculateMovingAverage, formatTimestampToKoreanTime } from "../utils";

// 4시간 캔들 기준으로 5 이동평균선을 구한 다음
// 실시간 가격이 5 이동 평균선보다 높으면 매수 또는 보유
// 5 이동평균선보다 낮으면 매도 또는 유보
// 4시간마다 실행

export async function executeMA5Trade240(markets: string[]) {
    // 실시간 가격 가져오기
    const tickers = await fetchTicker(markets.join(", "));

    // 5 이동평균과 실시간 가격 비교
    const promises = markets.map(async (market) => {
        const fetchData = await fetchMinutes(market, "240", "5");
        const movingAverage = calculateMovingAverage(fetchData)[0];
        const aCandle = fetchData[fetchData.length - 1];
        const aTicker = tickers.find((t: ITicker) => t.market === market);

        if (!aTicker) {
            throw new Error(`Ticker data for market ${market} not found`);
        }

        const signal =
            aTicker.trade_price > movingAverage
                ? "매수 or 유지"
                : "매도 or 유보";

        return {
            market,
            averageTime: aCandle.time,
            averagePrice: movingAverage.toLocaleString(),
            tickerItme: formatTimestampToKoreanTime(aTicker.trade_timestamp),
            ticekrTradePrice: aTicker.trade_price.toLocaleString(),
            signal,
        };
    });

    return await Promise.all(promises);
}

export async function scheduleMA5Trade240Execution(markets: string[]) {
    let index = 0;
    const chatIds = (await getChatIds()) as number[];

    // 첫 번째 실행
    await generateAndSendTradeInfo(markets, chatIds, index);

    // 240분마다 실행
    setInterval(
        async () => {
            ++index;
            await generateAndSendTradeInfo(markets, chatIds, index);
        },
        1000 * 60 * 240
        // 3000
    );
}

async function generateAndSendTradeInfo(
    markets: string[],
    chatIds: number[],
    index: number
) {
    const tradeInfo = await executeMA5Trade240(markets);
    const message = tradeInfo
        .map(
            (info) =>
                `[${info.market}]
Average Time
| ${info.averageTime}
Ticker Time
| ${info.tickerItme}
평균 가격
| ${info.averagePrice}
현재 가격
| ${info.ticekrTradePrice}
신호
| ${info.signal}`
        )
        .join("\n\n");

    const resultMessage = `240분 캔들의 5이동평균 전략\n\n{index: ${index}}\n\n ${message}`;

    sendMessagesToUsers(message, chatIds); // send telegram message

    console.log(resultMessage);
}

/* (() => {
    try {
        const markets = [
            "KRW-BTC",
            // "KRW-ETH",
            // "KRW-DOGE",
            // "KRW-XRP",
            // "KRW-SBD",
            // "KRW-NEAR",
        ];
        scheduleMA5Trade240Execution(markets);
    } catch (error) {
        console.error("Error executing trading strategy:", error);
    }
})();
 */
