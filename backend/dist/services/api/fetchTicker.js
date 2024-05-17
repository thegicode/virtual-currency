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
exports.fetchTicker = void 0;
const { URL } = require("../../config");
function fetchTicker(markets) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const params = new URLSearchParams({
                markets,
            });
            const response = yield fetch(`${URL.ticker}?${params}`, {
                method: "GET",
                headers: { accept: "application/json" },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = yield response.json();
            return data;
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.fetchTicker = fetchTicker;
