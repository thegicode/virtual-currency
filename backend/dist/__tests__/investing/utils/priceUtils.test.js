"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const utils_1 = require("../../../investing/utils");
(0, vitest_1.describe)("formatPrice", () => {
    (0, vitest_1.it)("should format price greater than 1 with locale string", () => {
        const price = 1234.56;
        const expectedFormattedPrice = "1,234.56";
        const formattedPrice = (0, utils_1.formatPrice)(price);
        (0, vitest_1.expect)(formattedPrice).toBe(expectedFormattedPrice);
    });
    (0, vitest_1.it)("should format price equal to 1 with five decimal places", () => {
        const price = 1;
        const expectedFormattedPrice = "1.00000";
        const formattedPrice = (0, utils_1.formatPrice)(price);
        (0, vitest_1.expect)(formattedPrice).toBe(expectedFormattedPrice);
    });
    (0, vitest_1.it)("should format large price with locale string", () => {
        const price = 1000000;
        const expectedFormattedPrice = "1,000,000";
        const formattedPrice = (0, utils_1.formatPrice)(price);
        (0, vitest_1.expect)(formattedPrice).toBe(expectedFormattedPrice);
    });
});
