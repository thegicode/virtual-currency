// financialUtils

export function calculateRiskAdjustedCapital(
    targetVolatility: number,
    volatility: number,
    count: number,
    initialCapital: number
): number {
    if (volatility === 0 || count === 0) {
        return 0;
    }
    return (targetVolatility / volatility / count) * initialCapital;
}
