import { fetchDailyCandles } from "../../services/api";

(async () => {
    // 이동 평균 교차 전략

    const data = await fetchDailyCandles("KRW-SOL", "100");

    interface DataPoint {
        market: string;
        candle_date_time_kst: string;
        trade_price: number;
        short_avg_price?: number;
        long_avg_price?: number;
        signal?: number;
        capital?: number;
    }

    // 이동 평균 계산 함수
    function calculateMovingAverages(
        data: DataPoint[],
        shortPeriod: number,
        longPeriod: number
    ): void {
        data.forEach((row, index) => {
            if (index >= shortPeriod - 1) {
                const shortPrices = data
                    .slice(index - shortPeriod + 1, index + 1)
                    .map((d) => d.trade_price);
                row.short_avg_price =
                    shortPrices.reduce((acc, price) => acc + price, 0) /
                    shortPeriod;
            }
            if (index >= longPeriod - 1) {
                const longPrices = data
                    .slice(index - longPeriod + 1, index + 1)
                    .map((d) => d.trade_price);
                row.long_avg_price =
                    longPrices.reduce((acc, price) => acc + price, 0) /
                    longPeriod;
            }
        });
    }

    // 이동 평균 교차 전략을 적용하기 위한 함수
    function calculateMovingAverageCrossover(
        data: DataPoint[],
        shortPeriod: number,
        longPeriod: number
    ): void {
        calculateMovingAverages(data, shortPeriod, longPeriod);

        data.forEach((row, index) => {
            if (index >= longPeriod - 1) {
                if (row.short_avg_price && row.long_avg_price) {
                    if (row.short_avg_price > row.long_avg_price) {
                        row.signal = 1; // 매수 신호
                    } else if (row.short_avg_price < row.long_avg_price) {
                        row.signal = -1; // 매도 신호
                    } else {
                        row.signal = 0;
                    }
                }
            } else {
                row.signal = 0;
            }
        });
    }

    // 백테스트 함수
    function backtestMovingAverageCrossover(
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

    // 이동 평균 교차 전략 백테스트
    const initialCapital = 10000; // 초기 자본
    const shortPeriod = 12; // 단기 이동 평균 기간
    const longPeriod = 26; // 장기 이동 평균 기간

    calculateMovingAverageCrossover(data, shortPeriod, longPeriod);
    const { data: movingAverageCrossoverResult, tradeCount } =
        backtestMovingAverageCrossover(data, initialCapital);

    const finalCapitalMovingAverageCrossover =
        movingAverageCrossoverResult[movingAverageCrossoverResult.length - 1]
            .capital;
    const returnRateMovingAverageCrossover =
        (finalCapitalMovingAverageCrossover! / initialCapital - 1) * 100;

    console.log("Moving Average Crossover Strategy Results:");
    console.log(movingAverageCrossoverResult.slice(-10));
    console.log(`Final Capital: ${finalCapitalMovingAverageCrossover}`);
    console.log(`Return Rate: ${returnRateMovingAverageCrossover.toFixed(2)}%`);
    console.log(`Trade Count: ${tradeCount}`);

    //     Final Capital: 9490.243533504765
    // Return Rate: -5.10%
    // Trade Count: 2
})();
