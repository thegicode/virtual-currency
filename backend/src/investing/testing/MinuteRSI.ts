import { fetchMinutes } from "../../services/api";

interface DataPoint {
    market: string;
    candle_date_time_kst: string;
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
    const { data: rsiResult, tradeCount } = backtestRSIStrategy(
        data,
        initialCapital
    );

    const finalCapitalRSI = rsiResult[rsiResult.length - 1].capital!;
    const returnRateRSI = (finalCapitalRSI / initialCapital - 1) * 100;
    const tradeData = rsiResult.filter((aData) => {
        return aData.signal !== 0 && aData;
    });

    console.log("RSI Strategy Results:");
    // console.log(rsiResult.slice(-10));
    console.log("Trade Data: ", tradeData.slice(-10));
    console.log(`Final Capital: ${finalCapitalRSI}`);
    console.log(`Return Rate: ${returnRateRSI.toFixed(2)}%`);
    console.log(`Trade Count: ${tradeCount}`);

    // 최신 신호 확인
    checkTodaySignal(rsiResult);
}

function checkTodaySignal(data: DataPoint[]): void {
    const latestDataPoint = data[data.length - 1];
    const latestRSI = latestDataPoint.rsi;
    const latestSignal = latestDataPoint.signal;

    console.log("Latest Data Point:", latestDataPoint);
    console.log("Latest RSI:", latestRSI);
    console.log("Latest Signal:", latestSignal);

    if (latestSignal === 1) {
        console.log("매수 신호가 발생했습니다. 매수 고려.");
    } else if (latestSignal === -1) {
        console.log("매도 신호가 발생했습니다. 매도 고려.");
    } else {
        console.log("중립 신호입니다. 유지 또는 추가 관망.");
    }
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
                console.log(row, row.trade_price);
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

    data.forEach((row) => {
        if (row.signal === 1 && capital > 0) {
            // 매수
            position = capital / row.trade_price;
            capital = 0;
            tradeCount++;
        } else if (row.signal === -1 && position > 0) {
            // 매도
            capital = position * row.trade_price;
            position = 0;
            tradeCount++;
        }
        row.capital = capital + position * row.trade_price; // 현재 자본 계산
    });

    return { data, tradeCount };
}
