const fs = require("fs");
const path = require("path");

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

        const result = data.reverse().map((aData) => {
            const newDate = new Date(aData.candle_date_time_kst);
            const koreaTimeOffset = 9 * 60; // 한국은 UTC+9
            newDate.setMinutes(newDate.getMinutes() + koreaTimeOffset);
            const date = newDate.toLocaleDateString("ko-KR", {
                timeZone: "Asia/Seoul",
            });

            return {
                market: aData.market,
                candle_date_time_kst: aData.candle_date_time_kst,
                date,
                opening_price: Number(aData.opening_price),
                trade_price: Number(aData.trade_price),
                high_price: Number(aData.high_price),
                low_price: Number(aData.low_price),
            };
        });

        /*  const dataURL = path.resolve(
            `./data/candleDays/${reqQuery.market}.json`
        );

        // read files
        const fileList = fs.readFileSync(dataURL, "utf-8");
        const parsedReaded = JSON.parse(fileList);
        const isEqual = JSON.stringify(parsedReaded) === JSON.stringify(result);
        // console.log(isEqual, fileList);
        const candleDateList = parsedReaded.map(
            (aData) => aData.candle_date_time_kst
        );
        const dateList = parsedReaded.map((aData) => aData.date);
        // console.log(dateList);

        if (!isEqual) {
            for (const aData of result) {
                if (!candleDateList.inclues(aData.candle_date_time_kst)) {
                    const date = new Date(aData.candle_date_time_kst);
                }
            }
        }

        // save files
        fs.writeFileSync(dataURL, JSON.stringify(result, null, 2)); // 파일을 저장할 때와 읽을 때 동일한 포맷팅을 사용하도록 조정
 */
        return result;
    } catch (error) {
        console.error("Error:", error, error.message, error.name);
    }
}

async function fetchCandles(req, res) {
    const candled = await candles(req.query);
    // console.log("candled", candled);
    res.send(candled);
}

module.exports = { fetchCandles, candles };
