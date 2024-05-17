import { scheduleMA5Trade240Execution } from "./trades";

(() => {
    try {
        const markets = [
            "KRW-BTC",
            "KRW-ETH",
            "KRW-DOGE",
            "KRW-XRP",
            "KRW-SBD",
            "KRW-NEAR",
        ];
        scheduleMA5Trade240Execution(markets);
    } catch (error) {
        console.error("Error executing trading strategy:", error);
    }
})();
