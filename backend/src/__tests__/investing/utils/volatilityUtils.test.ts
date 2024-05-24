import { describe, it, expect } from "vitest";
import { calculateVolatility } from "../../../investing/utils";

describe("calculateVolatility", () => {
    it("should return the correct average volatility for given candles", () => {
        const mockCandles: Partial<ICandle>[] = [
            {
                opening_price: 95,
                trade_price: 100,
                high_price: 110,
                low_price: 90,
            },
            {
                opening_price: 100,
                trade_price: 105,
                high_price: 115,
                low_price: 95,
            },
            {
                opening_price: 105,
                trade_price: 110,
                high_price: 120,
                low_price: 100,
            },
            {
                opening_price: 110,
                trade_price: 115,
                high_price: 125,
                low_price: 105,
            },
            {
                opening_price: 115,
                trade_price: 120,
                high_price: 130,
                low_price: 110,
            },
        ];

        const expectedVolatility =
            (((110 - 90) / 95) * 100 +
                ((115 - 95) / 100) * 100 +
                ((120 - 100) / 105) * 100 +
                ((125 - 105) / 110) * 100 +
                ((130 - 110) / 115) * 100) /
            5;

        const result = calculateVolatility(mockCandles as ICandle[]);
        expect(result).toBeCloseTo(expectedVolatility, 5);
    });

    it("should handle empty array by returing NaN", () => {
        const mockCandles: ICandle[] = [];
        const result = calculateVolatility(mockCandles);
        expect(result).toBeNaN();
    });

    it("should handle an array with one element correctly", () => {
        const mockCandles: ICandle[] = [
            {
                opening_price: 95,
                trade_price: 100,
                high_price: 110,
                low_price: 90,
            } as ICandle,
        ];

        const expectedVolatility = ((110 - 90) / 95) * 100;

        const result = calculateVolatility(mockCandles);
        expect(result).toBeCloseTo(expectedVolatility, 5);
    });
});
