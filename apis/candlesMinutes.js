const URL = require("../server/config/URL");

async function candlesMinutes(reqQuery) {
    try {
        const searchParams = {
            market: reqQuery.market,
            to: reqQuery.to,
            count: reqQuery.count,
        };

        const query = new URLSearchParams(searchParams).toString();

        const response = await fetch(
            `${URL.candles_minutes}/${reqQuery.unit}?${query}`,
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
        const result = data.map((aData) => {
            return {
                candle_date_time_kst: aData.candle_date_time_kst,
                opening_price: Number(aData.opening_price),
                trade_price: Number(aData.trade_price),
            };
        });
        return result.reverse();
    } catch (error) {
        console.error("Error:", error);
    }
}

async function fetchCandlesMinutes(req, res) {
    const result = await candlesMinutes(req.query);
    res.send(result);
}

module.exports = { fetchCandlesMinutes, candlesMinutes };

/*  test.js
const fn = require("./candlesMinutes.js");

const searchParams = {
    market: "KRW-XRP",
    to: "2024-01-11T01:00:00+09:00",
    count: "2",
    unit: 30,
};

async function test() {
    const data = await fn.candlesMinutes(searchParams);
    console.log(data);
}

test();
 */
