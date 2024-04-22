const uuidv4 = require("uuid").v4;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const queryEncode = require("querystring").encode;

const { ACCESS_KEY, SECRET_KEY } = require("../server/config/key");
const URL = require("../server/config/URL");

async function candles() {
    try {
        const response = await fetch(
            "https://api.upbit.com/v1/candles/days?market=KRW-BTC&count=34&convertingPriceUnit=KRW",
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
                // marekt: aData.market,
                candle_date_time_kst: aData.candle_date_time_kst,
                opening_price: aData.opening_price,
                trade_price: aData.trade_price,
                prev_closing_price: aData.prev_closing_price,
            };
        });
        return result.reverse();
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function fetchCandles(req, res) {
    const candled = await candles();
    res.send(candled);
}

module.exports = { fetchCandles, candles };
