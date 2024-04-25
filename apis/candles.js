const URL = require("../server/config/URL");

// candelsDays

async function candles(reqQuery) {
    try {
        const body = {
            market: reqQuery.market,
            count: reqQuery.count,
            to: reqQuery.to || "",
            // count: Number(reqQuery.count) + 4,
        };

        const query = new URLSearchParams(body).toString();

        const response = await fetch(`${URL.candles_days}?${query}`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const result = data.map((aData) => {
            return {
                market: aData.market,
                candle_date_time_kst: aData.candle_date_time_kst,
                opening_price: Number(aData.opening_price),
                trade_price: Number(aData.trade_price),
                high_price: Number(aData.high_price),
                low_price: Number(aData.low_price),
            };
        });
        return result.reverse();
    } catch (error) {
        console.error("Error:", error, error.message, error.name);
        // res.status(500).send("Internal Server Error");
    }
}

async function fetchCandles(req, res) {
    const candled = await candles(req.query);
    // console.log("candled", candled);
    res.send(candled);
}

module.exports = { fetchCandles, candles };
