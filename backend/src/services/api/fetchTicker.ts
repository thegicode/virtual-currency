import { URL } from "../../config";

async function fetchTicker(markets: string) {
    try {
        const params = new URLSearchParams({
            markets,
        });

        const response = await fetch(`${URL.ticker}?${params}`, {
            method: "GET",
            headers: { accept: "application/json" },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // console.log("fetchTicker", data);

        return data;
    } catch (error) {
        console.error(error);
    }
}

// fetchTicker("KRW-BTC, KRW-ETH");

export { fetchTicker };
