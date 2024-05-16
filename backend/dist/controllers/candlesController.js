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
exports.getCandlesMinutes = void 0;
const fetchMinutes_1 = require("../services/api/fetchMinutes");
function getCandlesMinutes(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { market, unit, count, to } = req.query;
        if (!market || !unit || !count) {
            return res
                .status(400)
                .json({ error: "Required query parameters: market, unit, count" });
        }
        try {
            const candlesData = yield (0, fetchMinutes_1.fetchMinutes)(market, unit, count, to);
            res.json(candlesData);
        }
        catch (error) {
            console.error("Error in getCandlesMinutes:", error);
            res.status(500).json({ error: "Failed to fetch candles data" });
        }
    });
}
exports.getCandlesMinutes = getCandlesMinutes;
