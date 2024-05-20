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
const notifications_1 = require("../../notifications");
const api_1 = require("../../services/api");
function getCandles() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, api_1.fetchMinutes)("KRW-SHIB", "1", "200");
    });
}
runBacktest().catch((error) => console.error(error));
setInterval(runBacktest, 60 * 1000);
function runBacktest() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("");
        const data = yield getCandles();
        const rsiPeriod = 14;
        const overbought = 70;
        const oversold = 30;
        calculateRSI(data, rsiPeriod);
        generateRSISignals(data, overbought, oversold);
        const initialCapital = 10000;
        const { data: backtestedData, tradeCount } = backtestRSIStrategy(data, initialCapital);
        const finalCapital = backtestedData[backtestedData.length - 1].capital;
        const returnRate = (finalCapital / initialCapital - 1) * 100;
        const tradeData = backtestedData.filter((aData) => aData.signal !== 0);
        console.log("RSI Strategy Results:");
        console.log(`Final Capital: ${finalCapital}`);
        console.log(`Return Rate: ${returnRate.toFixed(2)}%`);
        console.log(`Trade Count: ${tradeCount} \n`);
        checkSignal(backtestedData);
    });
}
function checkSignal(data) {
    const latestData = data[data.length - 1];
    const latestSignal = latestData.signal;
    console.log("* Check Signal");
    console.log(latestData);
    console.log("");
    let message = `* Check Signal
 - Latest time: ${latestData.time}
 - Latest trade_price: ${latestData.trade_price}
 - Latest RSI: ${latestData.rsi}
 - Latest Signal: ${latestSignal}
    `;
    if (latestSignal === 1) {
        message += "매수 신호가 발생했습니다. 매수 고려.";
    }
    else if (latestSignal === -1) {
        message += "매도 신호가 발생했습니다. 매도 고려.";
    }
    else {
        message += "중립 신호입니다. 유지 또는 추가 관망.";
    }
    console.log(message);
    if (latestSignal !== 0)
        (0, notifications_1.sendTelegramMessageToChatId)(message);
}
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
    data.forEach((aData) => {
        if (aData.signal === 1 && capital > 0) {
            position = capital / aData.trade_price;
            capital = 0;
            tradeCount++;
        }
        else if (aData.signal === -1 && position > 0) {
            capital = position * aData.trade_price;
            position = 0;
            tradeCount++;
        }
        aData.capital = capital + position * aData.trade_price;
    });
    return { data, tradeCount };
}
