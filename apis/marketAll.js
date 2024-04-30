const URL = require("../server/config/URL");

async function marketAll(reqQuery) {
    try {
        const searchParams = {
            isDetails: true,
        };

        const query = new URLSearchParams(searchParams).toString();

        const response = await fetch(`${URL.market_all}?${query}`, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const result = data
            .filter((aData) => {
                return aData.market_warning === "NONE";
            })
            .filter((aData) => aData.market.includes("KRW-"));
        return result;
    } catch (error) {
        console.error("Error:", error);
    }
}

async function fetchMarketAll(req, res) {
    const result = await marketAll(req.query);
    res.send(result);
}

module.exports = { fetchMarketAll, marketAll };
