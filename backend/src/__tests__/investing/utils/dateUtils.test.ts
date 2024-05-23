import { describe, it, expect } from "vitest";
import { formatDateString, formatTimeString } from "../../../investing/utils";

describe("formatDateString", () => {
    it("should format 'YYYYMMDD' to 'YYYY-MM-DD' correctly", () => {
        const dateString = "20240523";
        const expectedFormattedDate = "2024-05-23";

        const formattedDate = formatDateString(dateString);

        expect(formattedDate).toBe(expectedFormattedDate);
    });

    it("should throw an error for invalid date string length", () => {
        const invalidDateString = "2024052"; // Invalid length

        expect(() => formatDateString(invalidDateString)).toThrow(
            "Invalid date string format"
        );
    });

    it("should format another 'YYYYMMDD' to 'YYYY-MM-DD' correctly", () => {
        const dateString = "19991231";
        const expectedFormattedDate = "1999-12-31";

        const formattedDate = formatDateString(dateString);

        expect(formattedDate).toBe(expectedFormattedDate);
    });

    it("should throw an error for non-numeric date string", () => {
        const invalidDateString = "abcd1234"; // Non-numeric

        expect(() => formatDateString(invalidDateString)).toThrow(
            "Invalid date string format"
        );
    });

    it("should handle leap year dates correctly", () => {
        const dateString = "20200229";
        const expectedFormattedDate = "2020-02-29";

        const formattedDate = formatDateString(dateString);

        expect(formattedDate).toBe(expectedFormattedDate);
    });
});

describe("formatTimeString", () => {
    it("should format 'HHmmss' to 'HH:mm:ss' correctly", () => {
        const timeString = "210523";
        const expectedFormattedTime = "21:05:23";

        const formattedTime = formatTimeString(timeString);

        expect(formattedTime).toBe(expectedFormattedTime);
    });

    it("should throw an error for invalid time string length", () => {
        const invalidTimeString = "21052"; // Invalid length

        expect(() => formatTimeString(invalidTimeString)).toThrow(
            "Invalid time string format"
        );
    });

    it("should format another 'HHmmss' to 'HH:mm:ss' correctly", () => {
        const timeString = "120000";
        const expectedFormattedTime = "12:00:00";

        const formattedTime = formatTimeString(timeString);

        expect(formattedTime).toBe(expectedFormattedTime);
    });

    it("should throw an error for non-numeric time string", () => {
        const invalidTimeString = "ab1234"; // Non-numeric

        expect(() => formatTimeString(invalidTimeString)).toThrow(
            "Invalid time string format"
        );
    });

    it("should handle edge case for midnight correctly", () => {
        const timeString = "000000";
        const expectedFormattedTime = "00:00:00";

        const formattedTime = formatTimeString(timeString);

        expect(formattedTime).toBe(expectedFormattedTime);
    });
});
