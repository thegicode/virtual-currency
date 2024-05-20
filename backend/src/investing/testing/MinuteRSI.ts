import { sendTelegramMessageToChatId } from "../../notifications";
import { fetchMinutes } from "../../services/api";

interface DataPoint {
    market: string;
    time: string;
    trade_price: number;
    opening_price: number;
    high_price: number;
    low_price: number;
    candle_acc_trade_volume: number;
    rsi?: number;
    signal?: number;
    capital?: number;
}

async function getCandles() {
    return await fetchMinutes("KRW-SHIB", "1", "200");
}

// 초기 실행
runBacktest().catch((error) => console.error(error));

// 1분마다 실행
setInterval(runBacktest, 60 * 1000);

async function runBacktest() {
    console.log("");
    const data: DataPoint[] = await getCandles();

    // RSI 계산 및 전략 적용
    const rsiPeriod = 14; // RSI 기간
    const overbought = 70; // 과매수 기준
    const oversold = 30; // 과매도 기준
    calculateRSI(data, rsiPeriod);
    generateRSISignals(data, overbought, oversold);

    // 백테스트
    const initialCapital = 10000; // 초기 자본
    const { data: backtestedData, tradeCount } = backtestRSIStrategy(
        data,
        initialCapital
    );

    const finalCapital = backtestedData[backtestedData.length - 1].capital!;
    const returnRate = (finalCapital / initialCapital - 1) * 100;
    const tradeData = backtestedData.filter((aData) => aData.signal !== 0);

    console.log("RSI Strategy Results:");
    // console.log("Trade Data: ", tradeData.slice(-10));
    console.log(`Final Capital: ${finalCapital}`);
    console.log(`Return Rate: ${returnRate.toFixed(2)}%`);
    console.log(`Trade Count: ${tradeCount} \n`);

    // 최신 신호 확인
    checkSignal(backtestedData);
}

function checkSignal(data: DataPoint[]): void {
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
    } else if (latestSignal === -1) {
        message += "매도 신호가 발생했습니다. 매도 고려.";
    } else {
        message += "중립 신호입니다. 유지 또는 추가 관망.";
    }

    console.log(message);

    // send message
    if (latestSignal !== 0) sendTelegramMessageToChatId(message);
}

function calculateRSI(data: DataPoint[], period: number): void {
    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
        const change = data[i].trade_price - data[i - 1].trade_price;
        if (change > 0) {
            gains += change;
        } else {
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
        } else {
            gains = (gains * (period - 1)) / period;
            losses = (losses * (period - 1) - change) / period;
        }

        data[i].rsi = 100 - 100 / (1 + gains / losses);
    }
}

/* function generateRSISignals(
    data: DataPoint[],
    oversold: number,
    overbought: number
): void {
    let previousRSI: number | null = null;

    data.forEach((row) => {
        if (row.rsi !== undefined) {
            if (previousRSI !== null) {
                if (previousRSI < oversold && row.rsi > oversold) {
                    row.signal = 1; // 매수 신호
                } else if (previousRSI > overbought && row.rsi < overbought) {
                    row.signal = -1; // 매도 신호
                } else {
                    row.signal = 0; // 중립
                }
            }
            previousRSI = row.rsi;
        }
    });
} */

function generateRSISignals(
    data: DataPoint[],
    overbought: number,
    oversold: number
): void {
    data.forEach((row, index) => {
        if (row.rsi !== undefined) {
            if (row.rsi > overbought) {
                row.signal = -1; // 매도 신호
            } else if (row.rsi < oversold) {
                row.signal = 1; // 매수 신호
                // console.log(row, row.trade_price);
            } else {
                row.signal = 0; // 중립
            }
        }
    });
}

function backtestRSIStrategy(
    data: DataPoint[],
    initialCapital: number
): { data: DataPoint[]; tradeCount: number } {
    let capital = initialCapital;
    let position = 0;
    let tradeCount = 0;

    data.forEach((aData) => {
        if (aData.signal === 1 && capital > 0) {
            // 매수
            position = capital / aData.trade_price;
            capital = 0;
            tradeCount++;
        } else if (aData.signal === -1 && position > 0) {
            // 매도
            capital = position * aData.trade_price;
            position = 0;
            tradeCount++;
        }
        aData.capital = capital + position * aData.trade_price; // 현재 자본 계산
    });

    return { data, tradeCount };
}
