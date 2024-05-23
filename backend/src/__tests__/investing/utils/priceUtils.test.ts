import { describe, it, expect } from "vitest";
import { formatPrice } from "../../../investing/utils";

describe("formatPrice", () => {
    it("should format price greater than 1 with locale string", () => {
        const price = 1234.56;
        const expectedFormattedPrice = "1,234.56";

        const formattedPrice = formatPrice(price);

        expect(formattedPrice).toBe(expectedFormattedPrice);
    });

    it("should format price equal to 1 with five decimal places", () => {
        const price = 1;
        const expectedFormattedPrice = "1.00000";

        const formattedPrice = formatPrice(price);

        expect(formattedPrice).toBe(expectedFormattedPrice);
    });

    it("should format large price with locale string", () => {
        const price = 1000000;
        const expectedFormattedPrice = "1,000,000";

        const formattedPrice = formatPrice(price);

        expect(formattedPrice).toBe(expectedFormattedPrice);
    });
});
