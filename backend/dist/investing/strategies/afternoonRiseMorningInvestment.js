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
exports.afternoonRiseMorningInvestment = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function afternoonRiseMorningInvestment(markets, initialCapital, targetVolatility = 2) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const results = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () {
                return yield generateMarketTradeSignal(market, targetVolatility, initialCapital, markets.length);
            })));
            return createMessage(results);
        }
        catch (error) {
            console.error("Error afternoonRiseMorningInvestment: ", error);
            return "Error in executing the strategy.";
        }
    });
}
exports.afternoonRiseMorningInvestment = afternoonRiseMorningInvestment;
function generateMarketTradeSignal(market, targetVolatility, initialCapital, size) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentDate = getDate();
        const candles = yield fetchData(market, currentDate);
        const { morningCandles, afternoonCandles } = splitDayCandles(candles);
        const { afternoonReturnRate, morningVolume, afternoonVolume, volatility } = calculateDailyMetrics(afternoonCandles, morningCandles);
        const tradeSignal = generateTradeSignal(afternoonReturnRate, afternoonVolume, morningVolume, targetVolatility, volatility, initialCapital, size);
        return Object.assign({ market, date: currentDate, volatility }, tradeSignal);
    });
}
function getDate() {
    const date = new Date();
    if (date.getHours() < 24)
        date.setDate(date.getDate() - 1);
    date.setHours(9, 0, 0, 0);
    const newDate = date.toISOString().slice(0, 19);
    return `${newDate}+09:00`;
}
function fetchData(market, currentDate) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield (0, api_1.fetchMinutesCandles)(market, 60, 24, currentDate);
        }
        catch (error) {
            console.error(`Error fetching  candles market ${market}:`, error);
            throw error;
        }
    });
}
function splitDayCandles(candles) {
    const morningCandles = candles.slice(0, 12);
    const afternoonCandles = candles.slice(12, 24);
    return {
        morningCandles,
        afternoonCandles,
    };
}
function calculateDailyMetrics(afternoonCandles, morningCandles) {
    const afternoonReturnRate = (0, utils_1.calculateCandleReturnRate)(afternoonCandles);
    const morningVolume = (0, utils_1.calculateVolume)(morningCandles);
    const afternoonVolume = (0, utils_1.calculateVolume)(afternoonCandles);
    const volatility = (0, utils_1.calculateVolatility)(afternoonCandles);
    return { afternoonReturnRate, morningVolume, afternoonVolume, volatility };
}
function generateTradeSignal(afternoonReturnRate, afternoonVolume, morningVolume, targetVolatility, volatility, initialCapital, size) {
    if (afternoonReturnRate > 0 && afternoonVolume > morningVolume) {
        const investment = (0, utils_1.calculateInvestmentAmount)(targetVolatility, volatility, size, initialCapital);
        return {
            signal: "매수 또는 유지",
            investment,
        };
    }
    else {
        return {
            signal: "매도 또는 유보",
        };
    }
}
function createMessage(results) {
    const title = `\n 🔔 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절\n`;
    const memo = `- 매일 자정에 확인, 매도는 다음 날 정오\n\n`;
    const message = results
        .map((result) => {
        const investmentMessage = result.investment
            ? `매수금액 : ${(0, utils_1.formatPrice)(Math.round(result.investment))}원`
            : "";
        return `📈 [${result.market}] 
날    짜 : ${result.date.slice(0, 10)}
신    호 : ${result.signal}
volatility : ${result.volatility.toFixed(2)}
${investmentMessage}`;
    })
        .join("\n\n");
    return `${title}${memo}${message}\n`;
}
