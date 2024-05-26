// src/config/URL.ts

const BASE_URL = "https://api.upbit.com/v1";

const URL = {
    candles_days: `${BASE_URL}/candles/days`,
    candles_minutes: `${BASE_URL}/candles/minutes`,
    // candles_weeks: `${BASE_URL}/candles/weeks`,
    // candles_months: `${BASE_URL}/candles/months`,
    market_all: `${BASE_URL}/market/all`,
    ticker: `${BASE_URL}/ticker`,
    // trades_ticks: `${BASE_URL}/trades/ticks`,
};

export { URL };
