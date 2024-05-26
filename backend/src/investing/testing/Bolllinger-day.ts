import { fetchDailyCandles } from "../../services/api";

interface IBacktestResult {
    market: string;
    initialCapital: number;
    finalCapital: number;
    trades: number;
    winRate: number;
    performance: string;
    mdd: number;
}

export async function bollingerBandsBacktest(
    market: string,
    initialCapital: number,
    days: number = 200,
    period: number = 20
): Promise<IBacktestResult> {
    const candles: ICandle[] = await fetchDailyCandles(market, days.toString());
    const { middleBand, upperBand, lowerBand } = calculateBollingerBands(
        candles,
        period
    );

    let capital = initialCapital;
    let position = 0;
    let trades = 0;
    let wins = 0;
    let peakCapital = initialCapital;
    let maxDrawdown = 0;

    for (let i = 0; i < upperBand.length; i++) {
        const currentPrice = candles[period - 1 + i].trade_price;

        if (currentPrice < lowerBand[i]) {
            // 매수 신호
            const investment = capital; // 10% 자본 사용
            position += investment / currentPrice;
            capital -= investment;
            trades++;
        } else if (currentPrice > upperBand[i] && position > 0) {
            // 매도 신호
            capital += position * currentPrice;
            position = 0;
            trades++;
            if (capital > initialCapital) {
                wins++;
            }
        }

        // 최대 낙폭 계산
        const currentTotal = capital + position * currentPrice;
        if (currentTotal > peakCapital) {
            peakCapital = currentTotal;
        }
        const drawdown = ((peakCapital - currentTotal) / peakCapital) * 100;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    const finalCapital =
        capital + position * candles[candles.length - 1].trade_price;
    const performance = (finalCapital / initialCapital - 1) * 100;
    const winRate = (wins / trades) * 100;

    return {
        market,
        initialCapital,
        finalCapital,
        trades,
        winRate,
        performance: performance.toFixed(2) + "%",
        mdd: maxDrawdown,
    };
}

interface ICandle {
    trade_price: number;
    // other properties can be added if needed
}

function calculateBollingerBands(
    candles: ICandle[],
    period: number = 20
): { middleBand: number[]; upperBand: number[]; lowerBand: number[] } {
    const middleBand: number[] = [];
    const upperBand: number[] = [];
    const lowerBand: number[] = [];

    for (let i = period - 1; i < candles.length; i++) {
        const slice = candles.slice(i - period + 1, i + 1);
        const prices = slice.map((candle) => candle.trade_price);

        const mean = prices.reduce((sum, price) => sum + price, 0) / period;
        const variance =
            prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
            period;
        const stdDev = Math.sqrt(variance);

        middleBand.push(mean);
        upperBand.push(mean + 2 * stdDev);
        lowerBand.push(mean - 2 * stdDev);
    }

    return { middleBand, upperBand, lowerBand };
}

// 실행 예제
(async () => {
    const market = "KRW-DOGE";
    const initialCapital = 1000000;
    const days = 200;

    const backtestResult = await bollingerBandsBacktest(
        market,
        initialCapital,
        days
    );
    console.log(backtestResult);
})();
