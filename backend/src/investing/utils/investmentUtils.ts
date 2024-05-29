// investmentUtils
/**
 * 포트폴리오 관리와 같은 전반적인 투자와 관련된 함수들을
 * 투자 분석과 관리 전반에 걸친 계산을 수행하는 함수
 * 포함될 함수들:
 * 포트폴리오 수익률 계산 (Portfolio Returns Calculation)
 * 투자 비율 조정 (Investment Rebalancing)
 * 모든 이동 평균 계산 (Calculate All Moving Averages)
 *
 */

export function calculateBollingerBands(
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

export function calculateMDD(prices: number[]): number {
    let peak = prices[0];
    let maxDrawdown = 0;

    for (let price of prices) {
        if (price > peak) {
            peak = price;
        } else {
            const drawdown = ((peak - price) / peak) * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
    }

    return maxDrawdown;
}

/* 
export function calculatePortfolioReturns(
    holdings: { [symbol: string]: number },
    prices: { [symbol: string]: number }
): number {
    const totalValue = Object.keys(holdings).reduce(
        (sum, symbol) => sum + holdings[symbol] * prices[symbol],
        0
    );
    return totalValue;
}

export function rebalancePortfolio(
    targetAllocations: { [symbol: string]: number },
    currentAllocations: { [symbol: string]: number },
    totalValue: number
): { [symbol: string]: number } {
    const adjustments: { [symbol: string]: number } = {};
    Object.keys(targetAllocations).forEach((symbol) => {
        adjustments[symbol] =
            targetAllocations[symbol] * totalValue -
            currentAllocations[symbol] * totalValue;
    });
    return adjustments;
}

export function calculateAllMovingAverages(
    candles: ICandle[],
    periods: number[]
) {
    const movingAverages: Record<string, number> = {};
    periods.forEach((period) => {
        movingAverages[`ma${period}`] = calculateMovingAverage(
            candles,
            period
        ).slice(-1)[0];
    });

    return movingAverages;
}
 */
