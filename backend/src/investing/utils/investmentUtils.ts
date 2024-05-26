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
