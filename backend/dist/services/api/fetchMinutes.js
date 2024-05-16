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
exports.fetchMinutes = void 0;
const { URL } = require("../../config/URL");
function fetchMinutes(market, unit, count, to) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const params = new URLSearchParams(Object.assign({ market, count: count }, (to && { to })));
            const response = yield fetch(`${URL.candles_minutes}/${unit}?${params}`, {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = yield response.json();
            return data.reverse().map((aData) => ({
                market: aData.market,
                time: aData.candle_date_time_kst,
                opening_price: Number(aData.opening_price),
                trade_price: Number(aData.trade_price),
                high_price: Number(aData.high_price),
                low_price: Number(aData.low_price),
                candle_acc_trade_volume: Number(aData.candle_acc_trade_volume),
            }));
        }
        catch (error) {
            console.error("Error fetching minutes:", error);
            throw error;
        }
    });
}
exports.fetchMinutes = fetchMinutes;
