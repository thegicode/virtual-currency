"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const utils_1 = require("../../../investing/utils");
(0, vitest_1.describe)("movingAverageUtils", () => {
    (0, vitest_1.it)("should calculate the moving average correctly for a given period", () => {
        const data = [
            {
                market: "KRW-XRP",
                date_time: "2024-05-14T09:00:00",
                opening_price: 705.8,
                trade_price: 700,
                high_price: 719,
                low_price: 697.6,
                candle_acc_trade_volume: 112331857.18313108,
            },
            {
                market: "KRW-XRP",
                date_time: "2024-05-15T09:00:00",
                opening_price: 703.4,
                trade_price: 710,
                high_price: 723.3,
                low_price: 699,
                candle_acc_trade_volume: 149875795.27671877,
            },
            {
                market: "KRW-XRP",
                date_time: "2024-05-16T09:00:00",
                opening_price: 721.3,
                trade_price: 720,
                high_price: 726,
                low_price: 714.1,
                candle_acc_trade_volume: 113982848.58127575,
            },
            {
                market: "KRW-XRP",
                date_time: "2024-05-17T09:00:00",
                opening_price: 721.3,
                trade_price: 730,
                high_price: 726,
                low_price: 714.1,
                candle_acc_trade_volume: 113982848.58127575,
            },
            {
                market: "KRW-XRP",
                date_time: "2024-05-18T09:00:00",
                opening_price: 721.3,
                trade_price: 740,
                high_price: 726,
                low_price: 714.1,
                candle_acc_trade_volume: 113982848.58127575,
            },
        ];
        const period = 3;
        const result = (0, utils_1.calculateMovingAverage)(data, period);
        (0, vitest_1.expect)(result).toEqual([
            (700 + 710 + 720) / 3,
            (710 + 720 + 730) / 3,
            (720 + 730 + 740) / 3,
        ]);
    });
    (0, vitest_1.it)("should return an empty array if the data length is less than the period", () => {
        const data = [
            {
                market: "KRW-XRP",
                date_time: "2024-05-14T09:00:00",
                opening_price: 705.8,
                trade_price: 700,
                high_price: 719,
                low_price: 697.6,
                candle_acc_trade_volume: 112331857.18313108,
            },
            {
                market: "KRW-XRP",
                date_time: "2024-05-15T09:00:00",
                opening_price: 703.4,
                trade_price: 710,
                high_price: 723.3,
                low_price: 699,
                candle_acc_trade_volume: 149875795.27671877,
            },
        ];
        const period = 3;
        const result = (0, utils_1.calculateMovingAverage)(data, period);
        (0, vitest_1.expect)(result).toEqual([]);
    });
    (0, vitest_1.it)("should handle an empty data array", () => {
        const data = [];
        const period = 3;
        const result = (0, utils_1.calculateMovingAverage)(data, period);
        (0, vitest_1.expect)(result).toEqual([]);
    });
    (0, vitest_1.it)("should handle a period of 1", () => {
        const data = [
            {
                market: "KRW-XRP",
                date_time: "2024-05-14T09:00:00",
                opening_price: 705.8,
                trade_price: 700,
                high_price: 719,
                low_price: 697.6,
                candle_acc_trade_volume: 112331857.18313108,
            },
            {
                market: "KRW-XRP",
                date_time: "2024-05-15T09:00:00",
                opening_price: 703.4,
                trade_price: 710,
                high_price: 723.3,
                low_price: 699,
                candle_acc_trade_volume: 149875795.27671877,
            },
            {
                market: "KRW-XRP",
                date_time: "2024-05-16T09:00:00",
                opening_price: 721.3,
                trade_price: 720,
                high_price: 726,
                low_price: 714.1,
                candle_acc_trade_volume: 113982848.58127575,
            },
        ];
        const period = 1;
        const result = (0, utils_1.calculateMovingAverage)(data, period);
        (0, vitest_1.expect)(result).toEqual([700, 710, 720]);
    });
    (0, vitest_1.it)("should handle a period equal to the length of the data array", () => {
        const data = [
            {
                market: "KRW-XRP",
                date_time: "2024-05-14T09:00:00",
                opening_price: 705.8,
                trade_price: 700,
                high_price: 719,
                low_price: 697.6,
                candle_acc_trade_volume: 112331857.18313108,
            },
            {
                market: "KRW-XRP",
                date_time: "2024-05-15T09:00:00",
                opening_price: 703.4,
                trade_price: 710,
                high_price: 723.3,
                low_price: 699,
                candle_acc_trade_volume: 149875795.27671877,
            },
            {
                market: "KRW-XRP",
                date_time: "2024-05-16T09:00:00",
                opening_price: 721.3,
                trade_price: 720,
                high_price: 726,
                low_price: 714.1,
                candle_acc_trade_volume: 113982848.58127575,
            },
        ];
        const period = 3;
        const result = (0, utils_1.calculateMovingAverage)(data, period);
        (0, vitest_1.expect)(result).toEqual([(700 + 710 + 720) / 3]);
    });
});
