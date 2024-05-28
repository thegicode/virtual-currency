import { fetchDailyCandles } from "../../services/api";
import { calculateBollingerBands } from "../utils";

interface ICandle {
    trade_price: number;
    // other properties can be added if needed
}

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
    days: number = 200, // 200일
    period: number = 20 // 20기간
): Promise<IBacktestResult> {
    const candles: any[] = await fetchDailyCandles(market, days.toString());
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
            // 2차 매수 신호
            const investment = capital * 0.4; // 20% 자본 사용
            position += investment / currentPrice;
            capital -= investment;
            trades++;
        } else if (currentPrice < middleBand[i]) {
            // 1차 매수 신호
            const investment = capital * 0.5; // 10% 자본 사용
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

// 실행 예제
(async () => {
    const market = "KRW-SBD";
    const initialCapital = 1000000;
    const days = 100;

    const backtestResult = await bollingerBandsBacktest(
        market,
        initialCapital,
        days
    );
    console.log(backtestResult);
})();
