// 데이터 예시

import { fetchDailyCandles } from "../../services/api";

// 스팀달러 200일 : Return Rate: 28.84% Trade Count: 8
// 도지코인 200일 10%
// 솔라나 200개 : 12.63%
// 시바이누 200개 : Return Rate: 25.85%, Trade Count: 6
// 제로엑스 200개 :  Return Rate: -24.42% Trade Count: 6
// 이더리움 200개 : Return Rate: 10.41% Trade Count: 6
// 비트코인골드 200개 : Return Rate: -12.02% Trade Count: 2
// 리플 200개 : Return Rate: -17.97% Trade Count: 5

const start = async () => {
    const data = await fetchDailyCandles("KRW-SBD", "100");
    // RSI 계산 및 전략 적용
    const rsiPeriod = 7; // 14
    const overbought = 60; // 70
    const oversold = 30;
    calculateRSI(data, rsiPeriod);
    generateRSISignals(data, overbought, oversold);

    // 최신 데이터 포인트에서 신호 확인
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

    // 백테스트
    const initialCapital = 10000; // 초기 자본
    const { data: rsiResult, tradeCount } = backtestRSIStrategy(
        data,
        initialCapital
    );

    const finalCapitalRSI = rsiResult[rsiResult.length - 1].capital;
    const returnRateRSI = (finalCapitalRSI! / initialCapital - 1) * 100;

    const results = rsiResult.map((result) => {
        return {
            ...result,
            date_time: result.date_time.slice(0, 10),
            candle_acc_trade_volume: result.candle_acc_trade_volume.toFixed(2),
            rsi: (result.rsi && result.rsi.toFixed(2)) || "",
            capital: result.capital && result.capital.toFixed(2),
        };
    });

    console.log("RSI Strategy Results:");
    console.table(results);
    console.log(`Final Capital: ${finalCapitalRSI}`);
    console.log(`Return Rate: ${returnRateRSI.toFixed(2)}%`);
    console.log(`Trade Count: ${tradeCount}`);
};

start();

interface DataPoint {
    market: string;
    candle_date_time_kst: string;
    trade_price: number;
    opening_price: number;
    high_price: number;
    low_price: number;
    date_time: string;
    rsi?: number;
    signal?: number;
    capital?: number;
    candle_acc_trade_volume: number;
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
            // console.log("매수", capital);
            position = capital / row.trade_price;
            capital = 0;
            tradeCount++;
        } else if (row.signal === -1 && position > 0) {
            // 매도
            capital = position * row.trade_price;
            position = 0;
            tradeCount++;
            // console.log("매도", capital);
        }
        row.capital = capital + position * row.trade_price; // 현재 자본 계산
    });

    return { data, tradeCount };
}
