import { getChatIds, sendMessagesToUsers } from "../../notifications";
import { fetchMinutes, fetchTicker } from "../../services/api";
import { calculateMovingAverage } from "../strategies";
import { formatTimestampToKoreanTime } from "../utils";

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

        const action =
            aTicker.trade_price > movingAverage
                ? "Buy | Hold"
                : "Sell | Reserve";

        return {
            market,
            averageTime: aCandle.time,
            averagePrice: movingAverage.toLocaleString(),
            tickerItme: formatTimestampToKoreanTime(aTicker.trade_timestamp),
            ticekrTradePrice: aTicker.trade_price.toLocaleString(),
            action,
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
                `* ${info.market}
- Average Time: 
 ${info.averageTime}
- Ticker Time:
 ${info.tickerItme}
- Average Price:
 ${info.averagePrice}
- Ticker Trade Price:
 ${info.ticekrTradePrice}
- Action:
 ${info.action}
`
        )
        .join("\n\n");

    const resultMessage = `{index: ${index}}\n\n ${message}`;

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
