import { fetchDailyCandles } from "../../services/api";

const start = async () => {
    //  볼린저 밴드와 RSI 결합 전략

    async function fetchData() {
        return await fetchDailyCandles("KRW-SBD", "200");
    }

    const data = await fetchData();

    interface DataPoint {
        market: string;
        candle_date_time_kst: string;
        trade_price: number;
        avg_price?: number; // Optional as it will be calculated
        upper_band?: number; // Optional for Bollinger Bands
        lower_band?: number; // Optional for Bollinger Bands
        rsi?: number; // Optional for RSI
        signal?: number; // Optional as it will be calculated
        capital?: number; // Optional as it will be calculated during backtest
    }

    // RSI 계산 함수
    function calculateRSI(data: DataPoint[], n: number): void {
        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= n; i++) {
            const change = data[i].trade_price - data[i - 1].trade_price;
            if (change > 0) {
                gains += change;
            } else {
                losses -= change;
            }
        }

        let avgGain = gains / n;
        let avgLoss = losses / n;
        data[n].rsi = 100 - 100 / (1 + avgGain / avgLoss);

        for (let i = n + 1; i < data.length; i++) {
            const change = data[i].trade_price - data[i - 1].trade_price;
            if (change > 0) {
                avgGain = (avgGain * (n - 1) + change) / n;
                avgLoss = (avgLoss * (n - 1)) / n;
            } else {
                avgGain = (avgGain * (n - 1)) / n;
                avgLoss = (avgLoss * (n - 1) - change) / n;
            }
            data[i].rsi = 100 - 100 / (1 + avgGain / avgLoss);
        }
    }

    // 볼린저 밴드와 RSI 결합 전략을 적용하기 위한 함수
    function calculateBollingerBandsAndRSI(
        data: DataPoint[],
        n: number,
        k: number,
        rsiPeriod: number
    ): void {
        calculateRSI(data, rsiPeriod);

        data.forEach((row, index) => {
            if (index >= n) {
                const prices = data
                    .slice(index - n, index)
                    .map((d) => d.trade_price);
                const avgPrice =
                    prices.reduce((acc, price) => acc + price, 0) / n;
                const stdDev = Math.sqrt(
                    prices
                        .map((price) => Math.pow(price - avgPrice, 2))
                        .reduce((acc, diff) => acc + diff, 0) / n
                );
                const upperBand = avgPrice + k * stdDev;
                const lowerBand = avgPrice - k * stdDev;
                row.avg_price = avgPrice;
                row.upper_band = upperBand;
                row.lower_band = lowerBand;

                if (row.rsi && row.rsi < 30 && row.trade_price < lowerBand) {
                    row.signal = 1; // 매수 신호
                } else if (
                    row.rsi &&
                    row.rsi > 70 &&
                    row.trade_price > upperBand
                ) {
                    row.signal = -1; // 매도 신호
                } else {
                    row.signal = 0;
                }
            } else {
                row.signal = 0;
            }
        });
    }

    // 백테스트 함수
    function backtestBollingerBandsAndRSI(
        data: DataPoint[],
        initialCapital: number
    ): DataPoint[] {
        let capital = initialCapital;
        let position = 0;

        data.forEach((row) => {
            if (row.signal === 1 && capital > 0) {
                // 매수
                position = capital / row.trade_price;
                capital = 0;
            } else if (row.signal === -1 && position > 0) {
                // 매도
                capital = position * row.trade_price;
                position = 0;
            }
            row.capital = capital + position * row.trade_price; // 현재 자본 계산
        });

        return data;
    }

    // 볼린저 밴드와 RSI 결합 전략 계산 및 백테스트
    const initialCapital = 10000; // 초기 자본
    const n = 20; // 볼린저 밴드 이동 평균 기간
    const k = 2; // 볼린저 밴드 표준 편차 계수
    const rsiPeriod = 14; // RSI 기간

    calculateBollingerBandsAndRSI(data, n, k, rsiPeriod);
    const bollingerBandsAndRSIResult = backtestBollingerBandsAndRSI(
        data,
        initialCapital
    );

    const finalCapitalBollingerBandsAndRSI =
        bollingerBandsAndRSIResult[bollingerBandsAndRSIResult.length - 1]
            .capital;
    const returnRateBollingerBandsAndRSI =
        (finalCapitalBollingerBandsAndRSI! / initialCapital - 1) * 100;

    console.log("Bollinger Bands and RSI Strategy Results:");
    console.log(bollingerBandsAndRSIResult.slice(-10));
    console.log(`Final Capital: ${finalCapitalBollingerBandsAndRSI}`);
    console.log(`Return Rate: ${returnRateBollingerBandsAndRSI.toFixed(2)}%`);
};

start();
