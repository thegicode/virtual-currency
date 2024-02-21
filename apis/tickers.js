const URL = require("../server/config/URL");

async function tickers(req, res) {
    const markets = req.query.markets.replace(/,/g, "%2C%20");

    try {
        const response = await fetch(`${URL.ticker}?markets=${markets}`, {
            method: "GET",
            headers: { accept: "application/json" },
        });
        res.send(await response.json());
    } catch (error) {
        console.error(error);
    }
}

module.exports = tickers;
