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
        const transactionFee = 0.001;
        const results = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () {
            return yield backtest(markets, market, period, targetVolatility, initialCapital, transactionFee);
        })));
        const messages = createMessage(results);
        console.log(messages);
    });
}
exports.afternoonRiseMorningInvestmentBacktest = afternoonRiseMorningInvestmentBacktest;
function backtest(markets, market, period, targetVolatility, initialCapital, transactionFee) {
    return __awaiter(this, void 0, void 0, function* () {
        let capital = initialCapital;
        let position = 0;
        let trades = 0;
        let tradeData = [];
        let wins = 0;
        let peakCapital = initialCapital;
        let maxDrawdown = 0;
        let buyPrice = 0;
        let currentPrice = 0;
        let candles = [];
        for (let day = 1; day <= period; day++) {
            const currentDate = `${getToDate(day, period)}+09:00`;
            const { morningCandles, afternoonCandles, allCandles } = yield fetchAndSplitDailyCandles(market, currentDate);
            candles = allCandles;
            const { afternoonReturnRate, morningVolume, afternoonVolume, volatility, } = calculateDailyMetrics(afternoonCandles, morningCandles);
            const shouldBuy = shouldBuyBasedOnMetrics(afternoonReturnRate, afternoonVolume, morningVolume);
            let investment, signal;
            if (shouldBuy) {
                ({
                    capital,
                    position,
                    currentPrice,
                    buyPrice,
                    trades,
                    investment,
                    signal,
                } = executeBuy(markets, afternoonCandles, targetVolatility, volatility, capital, position, trades, initialCapital));
                tradeData.push({
                    day,
                    currentDate,
                    signal,
                    capital,
                    position,
                    currentPrice,
                    buyPrice,
                    volatility,
                    trades,
                    investment,
                });
            }
            else {
                ({ capital, position, currentPrice, trades, wins, signal } =
                    yield executeSell(market, currentDate, position, capital, transactionFee, buyPrice, trades, wins));
                tradeData.push({
                    day,
                    currentDate,
                    signal,
                    capital,
                    position,
                    currentPrice,
                    volatility,
                    trades,
                    wins,
                });
            }
            ({ peakCapital, maxDrawdown } = calculateMaxDrawdown(capital, position, currentPrice, peakCapital, maxDrawdown));
        }
        const finalCapital = tradeData[tradeData.length - 1].capital;
        const performance = (finalCapital / initialCapital - 1) * 100;
        const winRate = trades > 0 ? (wins / trades) * 100 : 0;
        tradeData = tradeData.map((aData) => {
            return Object.assign(Object.assign({}, aData), { currentDate: aData.currentDate.slice(0, 10), capital: Math.round(aData.capital).toLocaleString(), position: aData.position > 0 ? aData.position.toFixed(2) : "", volatility: aData.volatility.toFixed(2), investment: aData.investment
                    ? Math.round(aData.investment).toLocaleString()
                    : "" });
        });
        return {
            market,
            finalCapital,
            performance,
            winRate,
            maxDrawdown,
            trades,
            wins,
            tradeData,
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
function shouldBuyBasedOnMetrics(afternoonReturnRate, afternoonVolume, morningVolume) {
    return afternoonReturnRate > 0 && afternoonVolume > morningVolume;
}
function executeBuy(markets, afternoonCandles, targetVolatility, volatility, capital, position, trades, initialCapital) {
    const tradePrice = afternoonCandles[afternoonCandles.length - 1].trade_price;
    const buyPrice = tradePrice;
    const investment = (0, utils_1.calculateInvestmentAmount)(targetVolatility, volatility, markets.length, initialCapital);
    let signal = "";
    const amountToBuy = investment / tradePrice;
    if (capital >= investment) {
        capital -= investment;
        position += amountToBuy;
        trades++;
        signal = "매수";
    }
    return {
        capital,
        position,
        currentPrice: tradePrice,
        buyPrice,
        trades,
        investment,
        signal,
    };
}
function executeSell(market, currentDate, position, capital, transactionFee, buyPrice, trades, wins) {
    return __awaiter(this, void 0, void 0, function* () {
        const atNoonTime = currentDate.slice(0, 11) + "04:00:00";
        const ticker = yield (0, api_1.fetchMinutesCandles)(market, 60, 1, atNoonTime);
        const currentPrice = ticker[0].trade_price;
        let signal = "";
        if (position > 0) {
            capital += position * currentPrice * (1 - transactionFee);
            if (currentPrice > buyPrice)
                wins++;
            position = 0;
            trades++;
            signal = "매도";
        }
        return {
            capital,
            position,
            currentPrice,
            trades,
            wins,
            signal,
        };
    });
}
function calculateMaxDrawdown(capital, position, currentPrice, peakCapital, maxDrawdown) {
    const currentTotal = capital + position * currentPrice;
    if (currentTotal > peakCapital) {
        peakCapital = currentTotal;
    }
    const drawdown = ((peakCapital - currentTotal) / peakCapital) * 100;
    if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
    }
    return { peakCapital, maxDrawdown };
}
function createMessage(results) {
    const title = `\n🔔 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절 backtest\n`;
    const messages = results.map((result) => {
        return `📈 [${result.market}]
첫째 날: ${result.tradeData[0].currentDate}
마지막 날: ${result.tradeData[result.tradeData.length - 1].currentDate}
Total Trades: ${result.trades}번
Final Capital: ${Math.round(result.finalCapital).toLocaleString()}원
Performance: ${result.performance.toFixed(2)}%
MDD: ${result.maxDrawdown.toFixed(2)}%
Win Rate: ${result.winRate.toFixed(2)}%\n\n`;
    });
    return `${title}${messages}`;
}
