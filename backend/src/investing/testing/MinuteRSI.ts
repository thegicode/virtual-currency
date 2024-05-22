import { sendTelegramMessageToChatId } from "../../notifications";
import { fetchMinutes } from "../../services/api";

const RSI_PERIOD = 14; // RSI 기간
const OVERBOUGHT_THRESHOLD = 70; // 과매수 기준
const OVERSOLD_THRESHOLD = 30; //  과매도 기준
const INITIAL_CAPITAL = 10000; // 초기 자본
const MARKETS = ["KRW-AVAX", "KRW-CTC", "KRW-THETA", "KRW-TFUEL"]; // 대상 코인 목록

// 초기 실행
runBacktests().catch((error) => console.error(error));

// 1분마다 실행
setInterval(runBacktests, 60 * 1000);

async function runBacktests() {
    for (const market of MARKETS) {
        try {
            await runBacktest(market);
        } catch (error) {
            console.error(
                `Error running backtest for market ${market}:`,
                error
            );
        }
    }
}

async function runBacktest(market: string) {
    try {
        const data: ICandleMinuteRSI[] = await fetchCandleData(market);

        // RSI 계산 및 전략 적용
        calculateRSI(data);
        generateRSISignals(data);

        // 백테스트
        const { data: backtestedData, tradeCount } = executeBacktest(data);
        const finalCapital = backtestedData[backtestedData.length - 1].capital!;
        const returnRate = (finalCapital / INITIAL_CAPITAL - 1) * 100;

        logResults(market, finalCapital, returnRate, tradeCount);

        // 최신 신호 확인
        checkAndNotifyLatestSignal(backtestedData, market);
    } catch (error) {
        console.error(`Error in runBacktest for market ${market}:`, error);
    }
}

async function fetchCandleData(market: string) {
    try {
        return await fetchMinutes(market, 1, 200);
    } catch (error) {
        console.warn(
            `Failed to fetch candle data for market ${market} : `,
            error instanceof Error ? error.message : error
        );
    }
}

function calculateRSI(data: ICandleMinuteRSI[]) {
    const period = RSI_PERIOD;
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

function generateRSISignals(data: ICandleMinuteRSI[]) {
    data.forEach((aData) => {
        if (aData.rsi !== undefined) {
            if (aData.rsi > OVERBOUGHT_THRESHOLD) {
                aData.signal = -1; // 매도 신호
            } else if (aData.rsi < OVERSOLD_THRESHOLD) {
                aData.signal = 1; // 매수 신호
            } else {
                aData.signal = 0; // 중립
            }
        }
    });
}

/* function generateRSISignals(
    data: ICandleMinuteRSI[],
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

function executeBacktest(data: ICandleMinuteRSI[]): {
    data: ICandleMinuteRSI[];
    tradeCount: number;
} {
    let capital = INITIAL_CAPITAL;
    let holdingAmount = 0;
    let tradeCount = 0;

    data.forEach((aData) => {
        if (aData.signal === 1 && capital > 0) {
            // 매수
            holdingAmount = capital / aData.trade_price;
            capital = 0;
            tradeCount++;
        } else if (aData.signal === -1 && holdingAmount > 0) {
            // 매도
            capital = holdingAmount * aData.trade_price;
            holdingAmount = 0;
            tradeCount++;
        }
        aData.capital = capital + holdingAmount * aData.trade_price; // 현재 자본 계산
    });

    return { data, tradeCount };
}

function logResults(
    market: string,
    finalCapital: number,
    returnRate: number,
    tradeCount: number
) {
    console.log(`\n[${market}]`);
    console.log("1 Minute RSI Strategy Backtest Results:");
    console.log(`Final Capital: ${finalCapital}`);
    console.log(`Return Rate: ${returnRate.toFixed(2)}%`);
    console.log(`Trade Count: ${tradeCount} \n`);
}

function checkAndNotifyLatestSignal(data: ICandleMinuteRSI[], market: string) {
    const latestData = data[data.length - 1];
    const latestSignal = latestData.signal;

    let message = `${market} Check Signal 
 - time: ${latestData.date_time}
 - trade_price: ${latestData.trade_price}
 - RSI: ${latestData.rsi}
 - Signal: ${latestSignal}
    `;

    let tradeMessage;
    if (latestSignal === 1) {
        tradeMessage = "매수 신호가 발생했습니다. 매수 고려.";
    } else if (latestSignal === -1) {
        tradeMessage = "매도 신호가 발생했습니다. 매도 고려.";
    } else {
        tradeMessage = "중립 신호입니다. 유지 또는 추가 관망.";
    }

    message += tradeMessage;

    console.log("Check Signal");
    console.log(latestData);
    console.log(tradeMessage);

    // send message
    if (latestSignal !== 0) sendTelegramMessageToChatId(message);
}
