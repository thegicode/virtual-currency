import { fetchMinutes } from "../../services/api/fetchMinutes";
import { calculateMovingAverage } from "./movingAverage";

interface TradeDecision {
    time: string;
    trade_price: number;
    moving_average: number;
    action: "Buy" | "Sell" | "Hold";
}

export async function tradeBasedOnMA(markets: string[]) {
    const promises = markets.map(async (market) => {
        const data = await fetchMinutes(market, "240", "5");
        // console.log("data", data);
        const movingAverage = calculateMovingAverage(data);
        const aData = data[data.length - 1];

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
