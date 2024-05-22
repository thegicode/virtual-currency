import { checkDailyMovingAverageBacktest } from "./checkDailyMovingAverageBacktest";

// Run backtest

(async () => {
    await checkDailyMovingAverageBacktest(
        ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-XRP", "KRW-SBD"], // markets
        5 // period
    );
})();

export { checkDailyMovingAverageBacktest };
