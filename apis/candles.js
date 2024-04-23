const uuidv4 = require("uuid").v4;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const queryEncode = require("querystring").encode;

const { ACCESS_KEY, SECRET_KEY } = require("../server/config/key");
const URL = require("../server/config/URL");

async function candles(querys) {
    try {
        const body = {
            market: querys.market,
            count: querys.count,
        };

        const query = new URLSearchParams(body).toString();

        const response = await fetch(
            `https://api.upbit.com/v1/candles/days?${query}`,
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
        res.status(500).send("Internal Server Error");
    }
}

async function fetchCandles(req, res) {
    const candled = await candles(req.query);
    res.send(candled);
}

module.exports = { fetchCandles, candles };
