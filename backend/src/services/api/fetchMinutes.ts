const { URL } = require("../../config/URL");

async function fetchMinutes(
    market: string,
    unit: string,
    count: string,
    to?: string
) {
    try {
        const params = new URLSearchParams({
            market,
            count: count,
            ...(to && { to }),
        });

        const response = await fetch(
            `${URL.candles_minutes}/${unit}?${params}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.reverse().map((aData: any) => ({
            market: aData.market,
            time: aData.candle_date_time_kst,
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

export { fetchMinutes };
