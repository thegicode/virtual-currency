import { fetchMinutes } from "../../services/api/fetchMinutes";
import { calculateMovingAverage } from "./movingAverage";

interface TradeDecision {
    time: string;
    trade_price: number;
    moving_average: number;
    action: "Buy" | "Sell" | "Hold";
}

export async function tradeBasedOnMA() {
    const markets = ["KRW-BTC", "KRW-XRP"];
    const promises = markets.map(async (market) => {
        const data = await fetchMinutes(market, "240", "5");
        console.log("data", data);
        const movingAverage = calculateMovingAverage(data);
        const aData = data[data.length - 1];

        const action =
            aData.trade_price > movingAverage[0]
                ? "Buy | Hold"
                : "Sell | Reserve";

        return {
            market,
            time: aData.time,
            action,
        };
    });

    return await Promise.all(promises);
}

(async () => {
    try {
        const decisions = await tradeBasedOnMA();
        console.log(decisions);
    } catch (error) {
        console.error("Error executing trading strategy:", error);
    }
})();
