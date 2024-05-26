"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMarketAll = void 0;
const config_1 = require("../../config");
const utils_1 = require("../../investing/utils");
function fetchMarketAll() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const params = new URLSearchParams({
                isDetails: "true",
            });
            const url = `${config_1.URL.market_all}?${params}`;
            const options = {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            };
            const response = yield (0, utils_1.retryFetch)(url, options);
            const markets = yield response.json();
            return markets
                .filter((aMarket) => {
                return aMarket.market_warning === "NONE";
            })
                .filter((aMarket) => aMarket.market.includes("KRW-"));
        }
        catch (error) {
            console.warn("Error fetch daily candles:", error instanceof Error ? `${error.message} ${error.name}` : error);
        }
    });
}
exports.fetchMarketAll = fetchMarketAll;
