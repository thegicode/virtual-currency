import { URL } from "../../config";
import { retryFetch } from "../../investing/utils";

export async function fetchMinutesCandles(
    market: string,
    unit: TCandleUnit,
    count: number,
    to?: string
) {
    try {
        const params = new URLSearchParams({
            market,
            count: count.toString(),
            ...(to && { to }),
        });

        /* const response = await fetch(
            `${URL.candles_minutes}/${unit.toString()}?${params}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } */

        const url = `${URL.candles_minutes}/${unit.toString()}?${params}`;
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        };
        const response = await retryFetch(url, options);
        const data = await response.json();

        return data.reverse().map((aData: ICandle) => ({
            market: aData.market,
            date_time: aData.candle_date_time_kst,
            opening_price: Number(aData.opening_price),
            trade_price: Number(aData.trade_price),
            high_price: Number(aData.high_price),
            low_price: Number(aData.low_price),
            candle_acc_trade_volume: Number(aData.candle_acc_trade_volume), // 누적 거래량
        }));
    } catch (error) {
        console.error("Error fetching minutes:", error);
        throw error;
    }
}
