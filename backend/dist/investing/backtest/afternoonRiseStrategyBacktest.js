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
exports.afternoonRiseMorningInvestmentBacktest = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function afternoonRiseMorningInvestmentBacktest(markets, initialCapital, period, targetVolatility = 2) {
    return __awaiter(this, void 0, void 0, function* () {
        const transactionFee = 0;
        const results = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () {
            return yield backtest(markets, market, period, targetVolatility, initialCapital, transactionFee);
        })));
        const messages = createMessage(results);
        console.log(messages);
    });
}
exports.afternoonRiseMorningInvestmentBacktest = afternoonRiseMorningInvestmentBacktest;
function backtest(markets, market, period, targetVolatility, initialCapital, transactionFee) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let capital = initialCapital;
        let position = 0;
        let tradeCount = 0;
        let tradesData = [];
        let winCount = 0;
        let buyPrice = 0;
        let currentPrice = 0;
        let mddPrices = [];
        for (let day = 1; day <= period; day++) {
            const currentDate = `${getToDate(day, period)}+09:00`;
            const { morningCandles, afternoonCandles } = yield fetchAndSplitDailyCandles(market, currentDate);
            const { afternoonReturnRate, morningVolume, afternoonVolume, volatility, } = calculateDailyMetrics(afternoonCandles, morningCandles);
            let signalData = {};
            const shouldBuy = afternoonReturnRate > 0 && afternoonVolume > morningVolume;
            currentPrice =
                afternoonCandles[afternoonCandles.length - 1].trade_price;
            if (shouldBuy && buyPrice === 0) {
                let investmentAmount = (0, utils_1.calculateRiskAdjustedCapital)(targetVolatility, volatility, markets.length, capital);
                if (capital <= investmentAmount) {
                    investmentAmount = capital;
                }
                buyPrice = currentPrice;
                position += investmentAmount / currentPrice;
                capital -= investmentAmount;
                signalData = {
                    signal: "Buy",
                    volatility,
                    investment: investmentAmount,
                };
            }
            else if (!shouldBuy && position > 0) {
                const atNoonTime = currentDate.slice(0, 11) + "04:00:00";
                const ticker = yield (0, api_1.fetchMinutesCandles)(market, 60, 1, atNoonTime);
                const sellPrice = ticker[0].trade_price;
                const profit = (sellPrice - buyPrice) * position;
                capital += position * sellPrice * (1 - transactionFee);
                if (profit > 0)
                    winCount++;
                tradeCount++;
                position = 0;
                buyPrice = 0;
                signalData = {
                    signal: "Sell",
                    profit,
                };
            }
            else if (shouldBuy && buyPrice !== 0) {
                signalData = {
                    signal: "Hold",
                };
            }
            signalData = Object.assign(Object.assign({}, signalData), { date: currentDate, price: currentPrice, capital,
                position,
                tradeCount,
                winCount, investment: (_a = signalData.investment) !== null && _a !== void 0 ? _a : 0, profit: (_b = signalData.profit) !== null && _b !== void 0 ? _b : 0, volatility: volatility !== null && volatility !== void 0 ? volatility : 0 });
            tradesData.push(Object.assign({}, signalData));
            if (signalData.signal !== "")
                mddPrices.push(currentPrice);
        }
        const lastTradeData = tradesData[tradesData.length - 1];
        const finalCapital = ["Buy", "Hold"].includes(lastTradeData.signal)
            ? capital + position * lastTradeData.price
            : lastTradeData.capital;
        const performance = (finalCapital / initialCapital - 1) * 100;
        const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;
        const maxDrawdown = (0, utils_1.calculateMDD)(mddPrices);
        tradesData = tradesData.map((aData) => {
            var _a;
            return {
                date: aData.date.slice(0, 10),
                price: aData.price,
                signal: (_a = aData.signal) !== null && _a !== void 0 ? _a : "",
                volatility: aData.volatility && aData.volatility.toFixed(2),
                position: aData.position === 0 ? 0 : aData.position.toFixed(5),
                investment: Math.round(aData.investment).toLocaleString(),
                profit: Math.round(aData.profit).toLocaleString(),
                capital: Math.round(aData.capital).toLocaleString(),
                tradeCount: aData.tradeCount,
                winCount: aData.winCount,
            };
        });
        return {
            market,
            finalCapital,
            performance,
            winRate,
            maxDrawdown,
            tradeCount,
            winCount,
            tradesData,
        };
    });
}
function getToDate(day, period) {
    const now = new Date();
    now.setMonth(now.getMonth());
    now.setDate(now.getDate() - period + day - 1);
    now.setHours(9, 0, 0, 0);
    return now.toISOString().slice(0, 19);
}
function fetchAndSplitDailyCandles(market, currentDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const candles = yield (0, api_1.fetchMinutesCandles)(market, 60, 24, currentDate);
        const morningCandles = candles.slice(0, 12);
        const afternoonCandles = candles.slice(12, 24);
        return {
            morningCandles,
            afternoonCandles,
            allCandles: candles,
        };
    });
}
function calculateDailyMetrics(afternoonCandles, morningCandles) {
    const afternoonReturnRate = (0, utils_1.calculateCandleReturnRate)(afternoonCandles);
    const morningVolume = (0, utils_1.calculateVolume)(morningCandles);
    const afternoonVolume = (0, utils_1.calculateVolume)(afternoonCandles);
    const volatility = (0, utils_1.calculateVolatility)(afternoonCandles);
    return { afternoonReturnRate, morningVolume, afternoonVolume, volatility };
}
function createMessage(results) {
    const title = `\n🔔 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절 backtest\n`;
    const messages = results.map((result) => {
        return `📈 [${result.market}]
첫째 날: ${result.tradesData[0].date}
마지막 날: ${result.tradesData[result.tradesData.length - 1].date}
Total Trades: ${result.tradeCount}번
Final Capital: ${Math.round(result.finalCapital).toLocaleString()}원
Performance: ${result.performance.toFixed(2)}%
MDD: ${result.maxDrawdown.toFixed(2)}%
Win Rate: ${result.winRate.toFixed(2)}%\n\n`;
    });
    return `${title}${messages}`;
}
