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
const api_1 = require("../../services/api");
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, api_1.fetchDailyCandles)("KRW-SBD", "100");
    const rsiPeriod = 7;
    const overbought = 60;
    const oversold = 30;
    calculateRSI(data, rsiPeriod);
    generateRSISignals(data, overbought, oversold);
    const latestDataPoint = data[data.length - 1];
    const latestRSI = latestDataPoint.rsi;
    const latestSignal = latestDataPoint.signal;
    console.log("Latest Data Point:", latestDataPoint);
    console.log("Latest RSI:", latestRSI);
    console.log("Latest Signal:", latestSignal);
    if (latestSignal === 1) {
        console.log("매수 신호가 발생했습니다. 매수 고려.");
    }
    else if (latestSignal === -1) {
        console.log("매도 신호가 발생했습니다. 매도 고려.");
    }
    else {
        console.log("중립 신호입니다. 유지 또는 추가 관망.");
    }
    const initialCapital = 10000;
    const { data: rsiResult, tradeCount } = backtestRSIStrategy(data, initialCapital);
    const finalCapitalRSI = rsiResult[rsiResult.length - 1].capital;
    const returnRateRSI = (finalCapitalRSI / initialCapital - 1) * 100;
    const results = rsiResult.map((result) => {
        return Object.assign(Object.assign({}, result), { date_time: result.date_time.slice(0, 10), candle_acc_trade_volume: result.candle_acc_trade_volume.toFixed(2), rsi: (result.rsi && result.rsi.toFixed(2)) || "", capital: result.capital && result.capital.toFixed(2) });
    });
    console.log("RSI Strategy Results:");
    console.table(results);
    console.log(`Final Capital: ${finalCapitalRSI}`);
    console.log(`Return Rate: ${returnRateRSI.toFixed(2)}%`);
    console.log(`Trade Count: ${tradeCount}`);
});
start();
function calculateRSI(data, period) {
    let gains = 0;
    let losses = 0;
    for (let i = 1; i <= period; i++) {
        const change = data[i].trade_price - data[i - 1].trade_price;
        if (change > 0) {
            gains += change;
        }
        else {
            losses -= change;
        }
    }
    gains /= period;
    losses /= period;
    data[period].rsi = 100 - 100 / (1 + gains / losses);
    for (let i = period + 1; i < data.length; i++) {
        const change = data[i].trade_price - data[i - 1].trade_price;
        if (change > 0) {
            gains = (gains * (period - 1) + change) / period;
            losses = (losses * (period - 1)) / period;
        }
        else {
            gains = (gains * (period - 1)) / period;
            losses = (losses * (period - 1) - change) / period;
        }
        data[i].rsi = 100 - 100 / (1 + gains / losses);
    }
}
function generateRSISignals(data, overbought, oversold) {
    data.forEach((row, index) => {
        if (row.rsi !== undefined) {
            if (row.rsi > overbought) {
                row.signal = -1;
            }
            else if (row.rsi < oversold) {
                row.signal = 1;
            }
            else {
                row.signal = 0;
            }
        }
    });
}
function backtestRSIStrategy(data, initialCapital) {
    let capital = initialCapital;
    let position = 0;
    let tradeCount = 0;
    data.forEach((row) => {
        if (row.signal === 1 && capital > 0) {
            position = capital / row.trade_price;
            capital = 0;
            tradeCount++;
        }
        else if (row.signal === -1 && position > 0) {
            capital = position * row.trade_price;
            position = 0;
            tradeCount++;
        }
        row.capital = capital + position * row.trade_price;
    });
    return { data, tradeCount };
}
