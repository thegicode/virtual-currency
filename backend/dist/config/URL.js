"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URL = void 0;
const BASE_URL = "https://api.upbit.com/v1";
const URL = {
    candles_days: `${BASE_URL}/candles/days`,
    candles_minutes: `${BASE_URL}/candles/minutes`,
};
exports.URL = URL;
