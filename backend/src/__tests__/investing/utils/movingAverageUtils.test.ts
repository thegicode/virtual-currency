import { describe, it, expect } from "vitest";
import {
    calculateAllMovingAverages,
    calculateMovingAverage,
    shouldBuyBasedOnMovingAverages,
} from "../../../investing/utils";

describe("calculateMovingAverage", () => {
    it("should calculate the moving average correctly for a given period", () => {
        const data: Partial<ICandle>[] = [
            {
                trade_price: 700,
            },
            {
                trade_price: 710,
            },
            {
                trade_price: 720,
            },
            {
                trade_price: 730,
            },
            {
                trade_price: 740,
            },
        ];

        const period = 3;

        const result = calculateMovingAverage(data as ICandle[], period);

        expect(result).toEqual([
            (700 + 710 + 720) / 3,
            (710 + 720 + 730) / 3,
            (720 + 730 + 740) / 3,
        ]);
    });

    it("should return an empty array if the data length is less than the period", () => {
        const data: Partial<ICandle>[] = [
            {
                trade_price: 700,
            },
            {
                trade_price: 710,
            },
        ];

        const period = 3;

        const result = calculateMovingAverage(data as ICandle[], period);

        expect(result).toEqual([]);
    });

    it("should handle an empty data array", () => {
        const data: ICandle[] = [];
        const period = 3;
        const result = calculateMovingAverage(data, period);

        expect(result).toEqual([]);
    });

    it("should handle a period of 1", () => {
        const data: Partial<ICandle>[] = [
            {
                trade_price: 700,
            },
            {
                trade_price: 710,
            },
            {
                trade_price: 720,
            },
        ];

        const period = 1;
        const result = calculateMovingAverage(data as ICandle[], period);

        expect(result).toEqual([700, 710, 720]);
    });

    it("should handle a period equal to the length of the data array", () => {
        const data: Partial<ICandle>[] = [
            {
                trade_price: 700,
            },
            {
                trade_price: 710,
            },
            {
                trade_price: 720,
            },
        ];

        const period = 3;
        const result = calculateMovingAverage(data as ICandle[], period);

        expect(result).toEqual([(700 + 710 + 720) / 3]);
    });
});

describe("calculateAllMovingAverages", () => {
    it("should return correct moving averages for given periods ", () => {
        const mockCandles: Partial<ICandle>[] = [
            {
                trade_price: 100,
            },
            {
                trade_price: 105,
            },
            {
                trade_price: 110,
            },
            {
                trade_price: 115,
            },
            {
                trade_price: 120,
            },
            {
                trade_price: 100,
            },
            {
                trade_price: 105,
            },
            {
                trade_price: 110,
            },
            {
                trade_price: 115,
            },
            {
                trade_price: 120,
            },
        ];
        const periods = [3, 5, 10];
        const expected = {
            ma3: (120 + 115 + 110) / 3,
            ma5: (120 + 115 + 110 + 105 + 100) / 5,
            ma10:
                (120 + 115 + 110 + 105 + 100 + 120 + 115 + 110 + 105 + 100) /
                10,
        };

        const result = calculateAllMovingAverages(
            mockCandles as ICandle[],
            periods
        );

        expect(result).toEqual(expected);
    });

    it("should handle an empty candles array", () => {
        const mockCandles: ICandle[] = [];
        const periods = [3, 5, 10];

        const expected = {
            ma3: undefined,
            ma5: undefined,
            ma10: undefined,
        };

        const result = calculateAllMovingAverages(mockCandles, periods);

        expect(result).toEqual(expected);
    });

    it("should handle a single period", () => {
        const mockCandles: Partial<ICandle>[] = [
            {
                trade_price: 100,
            },
            {
                trade_price: 105,
            },
            {
                trade_price: 110,
            },
        ];

        const periods = [3];
        const expected = {
            ma3: (100 + 105 + 110) / 3,
        };

        const result = calculateAllMovingAverages(
            mockCandles as ICandle[],
            periods
        );

        expect(result).toEqual(expected);
    });
});

describe("shouldBuyBasedOnMovingAverages", () => {
    it("should return true if the current price is above all moving averages", () => {
        const currentPrice = 150;
        const movingAverages = {
            ma3: 140,
            ma5: 130,
            ma10: 120,
            ma20: 110,
        };

        const result = shouldBuyBasedOnMovingAverages(
            currentPrice,
            movingAverages
        );
        expect(result).toBe(true);
    });

    it("should return false if the current price is below any of the moving averages", () => {
        const currentPrice = 115;
        const movingAverages = {
            ma3: 140,
            ma5: 130,
            ma10: 120,
            ma20: 110,
        };

        const result = shouldBuyBasedOnMovingAverages(
            currentPrice,
            movingAverages
        );
        expect(result).toBe(false);
    });

    it("should return false if the current price is equal to any of the moving averages", () => {
        const currentPrice = 120;
        const movingAverages = {
            ma3: 140,
            ma5: 130,
            ma10: 120,
            ma20: 110,
        };

        const result = shouldBuyBasedOnMovingAverages(
            currentPrice,
            movingAverages
        );
        expect(result).toBe(false);
    });
});
