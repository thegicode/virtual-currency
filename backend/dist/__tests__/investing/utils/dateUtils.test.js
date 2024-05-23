"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const utils_1 = require("../../../investing/utils");
(0, vitest_1.describe)("formatDateString", () => {
    (0, vitest_1.it)("should format 'YYYYMMDD' to 'YYYY-MM-DD' correctly", () => {
        const dateString = "20240523";
        const expectedFormattedDate = "2024-05-23";
        const formattedDate = (0, utils_1.formatDateString)(dateString);
        (0, vitest_1.expect)(formattedDate).toBe(expectedFormattedDate);
    });
    (0, vitest_1.it)("should throw an error for invalid date string length", () => {
        const invalidDateString = "2024052";
        (0, vitest_1.expect)(() => (0, utils_1.formatDateString)(invalidDateString)).toThrow("Invalid date string format");
    });
    (0, vitest_1.it)("should format another 'YYYYMMDD' to 'YYYY-MM-DD' correctly", () => {
        const dateString = "19991231";
        const expectedFormattedDate = "1999-12-31";
        const formattedDate = (0, utils_1.formatDateString)(dateString);
        (0, vitest_1.expect)(formattedDate).toBe(expectedFormattedDate);
    });
    (0, vitest_1.it)("should throw an error for non-numeric date string", () => {
        const invalidDateString = "abcd1234";
        (0, vitest_1.expect)(() => (0, utils_1.formatDateString)(invalidDateString)).toThrow("Invalid date string format");
    });
    (0, vitest_1.it)("should handle leap year dates correctly", () => {
        const dateString = "20200229";
        const expectedFormattedDate = "2020-02-29";
        const formattedDate = (0, utils_1.formatDateString)(dateString);
        (0, vitest_1.expect)(formattedDate).toBe(expectedFormattedDate);
    });
});
(0, vitest_1.describe)("formatTimeString", () => {
    (0, vitest_1.it)("should format 'HHmmss' to 'HH:mm:ss' correctly", () => {
        const timeString = "210523";
        const expectedFormattedTime = "21:05:23";
        const formattedTime = (0, utils_1.formatTimeString)(timeString);
        (0, vitest_1.expect)(formattedTime).toBe(expectedFormattedTime);
    });
    (0, vitest_1.it)("should throw an error for invalid time string length", () => {
        const invalidTimeString = "21052";
        (0, vitest_1.expect)(() => (0, utils_1.formatTimeString)(invalidTimeString)).toThrow("Invalid time string format");
    });
    (0, vitest_1.it)("should format another 'HHmmss' to 'HH:mm:ss' correctly", () => {
        const timeString = "120000";
        const expectedFormattedTime = "12:00:00";
        const formattedTime = (0, utils_1.formatTimeString)(timeString);
        (0, vitest_1.expect)(formattedTime).toBe(expectedFormattedTime);
    });
    (0, vitest_1.it)("should throw an error for non-numeric time string", () => {
        const invalidTimeString = "ab1234";
        (0, vitest_1.expect)(() => (0, utils_1.formatTimeString)(invalidTimeString)).toThrow("Invalid time string format");
    });
    (0, vitest_1.it)("should handle edge case for midnight correctly", () => {
        const timeString = "000000";
        const expectedFormattedTime = "00:00:00";
        const formattedTime = (0, utils_1.formatTimeString)(timeString);
        (0, vitest_1.expect)(formattedTime).toBe(expectedFormattedTime);
    });
});
