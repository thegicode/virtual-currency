import { fetchMinutes } from "../../services/api/fetchMinutes";
import { calculateMovingAverage } from "../strategies/movingAverage";

// 4시간 캔들 기준으로 5 이동평균선을 구한 다음
// 실시간 가격이 5 이동 평균선보다 높으면 매수 또는 보유
// 5 이동평균선보다 낮으면 매도 또는 유보

interface TradeDecision {
    time: string;
    trade_price: number;
    moving_average: number;
    action: "Buy" | "Sell" | "Hold" | "Reserve";
}

export async function tradeBasedOnMA(markets: string[]) {
    const promises = markets.map(async (market) => {
        const data = await fetchMinutes(market, "240", "5");
        const movingAverage = calculateMovingAverage(data);
        const aData = data[data.length - 1];

        // 정정 : 실시간 가격 가져와서 비교하기
        const action =
            aData.trade_price > movingAverage[0]
                ? "Buy | Hold"
                : "Sell | Reserve";

        return {
            market,
            time: aData.time,
            tradePrice: aData.trade_price.toLocaleString(),
            average: movingAverage[0].toLocaleString(),
            action,
        };
    });

    return await Promise.all(promises);
}

(async () => {
    try {
        const markets = ["KRW-BTC", "KRW-XRP"];
        const decisions = await tradeBasedOnMA(markets);
        console.log(decisions);
    } catch (error) {
        console.error("Error executing trading strategy:", error);
    }
})();
