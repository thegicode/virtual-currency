import { executeMA5Trade } from "./trades";

(async () => {
    try {
        const markets = [
            "KRW-BTC",
            "KRW-ETH",
            "KRW-DOGE",
            "KRW-XRP",
            "KRW-SBD",
            "KRW-NEAR",
        ];
        const result = await executeMA5Trade(markets);
        console.log(result);
    } catch (error) {
        console.error("Error executing trading strategy:", error);
    }
})();
