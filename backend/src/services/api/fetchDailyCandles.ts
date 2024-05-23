import { URL } from "../../config";

export async function fetchDailyCandles(
    market: string,
    count: string,
    to?: string
) {
    try {
        const params = new URLSearchParams({
            market,
            count,
            ...(to && { to }),
        });

        const response = await fetch(`${URL.candles_days}?${params}`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return data.reverse().map((aData: ICandle) => {
            return {
                market: aData.market,
                date_time: aData.candle_date_time_kst,
                opening_price: Number(aData.opening_price),
                trade_price: Number(aData.trade_price),
                high_price: Number(aData.high_price),
                low_price: Number(aData.low_price),
                candle_acc_trade_volume: Number(aData.candle_acc_trade_volume),
            };
        });
    } catch (error) {
        console.warn(
            "Error fetch daily candles:",
            error instanceof Error ? `${error.message} ${error.name}` : error
        );
    }
}
