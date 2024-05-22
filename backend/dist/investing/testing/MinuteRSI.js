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
const RSI_PERIOD = 14;
const OVERBOUGHT_THRESHOLD = 70;
const OVERSOLD_THRESHOLD = 30;
const INITIAL_CAPITAL = 10000;
const MARKETS = ["KRW-AVAX", "KRW-CTC", "KRW-THETA", "KRW-TFUEL"];
runBacktests().catch((error) => console.error(error));
setInterval(runBacktests, 60 * 1000);
function runBacktests() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const market of MARKETS) {
            try {
                yield runBacktest(market);
            }
            catch (error) {
                console.error(`Error running backtest for market ${market}:`, error);
            }
        }
    });
}
function runBacktest(market) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield fetchCandleData(market);
            calculateRSI(data);
            generateRSISignals(data);
            const { data: backtestedData, tradeCount } = executeBacktest(data);
            const finalCapital = backtestedData[backtestedData.length - 1].capital;
            const returnRate = (finalCapital / INITIAL_CAPITAL - 1) * 100;
            logResults(market, finalCapital, returnRate, tradeCount);
            checkAndNotifyLatestSignal(backtestedData, market);
        }
        catch (error) {
            console.error(`Error in runBacktest for market ${market}:`, error);
        }
    });
}
function fetchCandleData(market) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield (0, api_1.fetchMinutes)(market, "1", "200");
        }
        catch (error) {
            console.warn(`Failed to fetch candle data for market ${market} : `, error instanceof Error ? error.message : error);
        }
    });
}
function calculateRSI(data) {
    const period = RSI_PERIOD;
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
function generateRSISignals(data) {
    data.forEach((aData) => {
        if (aData.rsi !== undefined) {
            if (aData.rsi > OVERBOUGHT_THRESHOLD) {
                aData.signal = -1;
            }
            else if (aData.rsi < OVERSOLD_THRESHOLD) {
                aData.signal = 1;
            }
            else {
                aData.signal = 0;
            }
        }
    });
}
function executeBacktest(data) {
    let capital = INITIAL_CAPITAL;
    let holdingAmount = 0;
    let tradeCount = 0;
    data.forEach((aData) => {
        if (aData.signal === 1 && capital > 0) {
            holdingAmount = capital / aData.trade_price;
            capital = 0;
            tradeCount++;
        }
        else if (aData.signal === -1 && holdingAmount > 0) {
            capital = holdingAmount * aData.trade_price;
            holdingAmount = 0;
            tradeCount++;
        }
        aData.capital = capital + holdingAmount * aData.trade_price;
    });
    return { data, tradeCount };
}
function logResults(market, finalCapital, returnRate, tradeCount) {
    console.log(`\n[${market}]`);
    console.log("1 Minute RSI Strategy Backtest Results:");
    console.log(`Final Capital: ${finalCapital}`);
    console.log(`Return Rate: ${returnRate.toFixed(2)}%`);
    console.log(`Trade Count: ${tradeCount} \n`);
}
function checkAndNotifyLatestSignal(data, market) {
    const latestData = data[data.length - 1];
    const latestSignal = latestData.signal;
    let message = `${market} Check Signal 
 - time: ${latestData.time}
 - trade_price: ${latestData.trade_price}
 - RSI: ${latestData.rsi}
 - Signal: ${latestSignal}
    `;
    let tradeMessage;
    if (latestSignal === 1) {
        tradeMessage = "매수 신호가 발생했습니다. 매수 고려.";
    }
    else if (latestSignal === -1) {
        tradeMessage = "매도 신호가 발생했습니다. 매도 고려.";
    }
    else {
        tradeMessage = "중립 신호입니다. 유지 또는 추가 관망.";
    }
    message += tradeMessage;
    console.log("Check Signal");
    console.log(latestData);
    console.log(tradeMessage);
    if (latestSignal !== 0)
        (0, notifications_1.sendTelegramMessageToChatId)(message);
}
