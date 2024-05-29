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
exports.retryFetch = exports.adjustApiCounts = void 0;
function adjustApiCounts(apiCounts, increment, maxLimit = 200) {
    return apiCounts + increment > maxLimit ? maxLimit : apiCounts + increment;
}
exports.adjustApiCounts = adjustApiCounts;
function retryFetch(url, options, retries = 5, delay = 1000) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < retries; i++) {
            try {
                const response = yield fetch(url, options);
                if (!response.ok) {
                    if (response.status === 429 && i < retries - 1) {
                        console.warn(`Rate limit exceeded, retrying in ${delay}ms...`);
                        yield new Promise((res) => setTimeout(res, delay));
                        continue;
                    }
                    else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                }
                return response;
            }
            catch (error) {
                if (i === retries - 1)
                    throw error;
                yield new Promise((res) => setTimeout(res, delay));
            }
        }
        throw new Error("Maximum retries reached");
    });
}
exports.retryFetch = retryFetch;
