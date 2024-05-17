import { fetchMinutes, fetchTicker } from "../../services/api";
import { calculateMovingAverage } from "../strategies/movingAverage";
import { formatTimestampToKoreanTime } from "../utils";

// 4시간 캔들 기준으로 5 이동평균선을 구한 다음
// 실시간 가격이 5 이동 평균선보다 높으면 매수 또는 보유
// 5 이동평균선보다 낮으면 매도 또는 유보

export async function tradeBasedOnMA(markets: string[]) {
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

(async () => {
    try {
        const markets = [
            "KRW-BTC",
            "KRW-ETH",
            "KRW-DOGE",
            "KRW-XRP",
            "KRW-SBD",
            "KRW-NEAR",
        ];
        const result = await tradeBasedOnMA(markets);
        console.log(result);
    } catch (error) {
        console.error("Error executing trading strategy:", error);
    }
})();
