import { URL } from "../../config";
import { retryFetch } from "../../investing/utils";

export async function fetchMarketAll() {
    try {
        const params = new URLSearchParams({
            isDetails: "true",
        });

        const url = `${URL.market_all}?${params}`;
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        };
        const response = await retryFetch(url, options);
        const markets = await response.json();

        return markets
            .filter((aMarket: IMarket) => {
                return aMarket.market_warning === "NONE";
            })
            .filter((aMarket: IMarket) => aMarket.market.includes("KRW-"));
    } catch (error) {
        console.warn(
            "Error fetch daily candles:",
            error instanceof Error ? `${error.message} ${error.name}` : error
        );
    }
}
