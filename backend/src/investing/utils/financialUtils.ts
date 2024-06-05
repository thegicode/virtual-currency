// financialUtils

/**
 * 금융 계산과 관련된 모든 공통적인 함수
 * 투자와 트레이딩 모두에 적용될 수 있는 기본적인 금융 계산과 관련된 함수들을 다룬다.
 * 포함될 함수들:
 * ROI 계산 (Return on Investment)
 * 평균 계산 (Average Calculation)
 * 표준 편차 계산 (Standard Deviation Calculation)
 * 이자율 계산 (Interest Rate Calculation)
 * NPV 계산 (Net Present Value)
 * */

// 모든 MovingAverage 반환
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

// candles 수익률 계산
export function calculateCandleReturnRate(candles: ICandle[]): number {
    const openPrice = candles[0].opening_price;
    const closePrice = candles[candles.length - 1].trade_price;
    return (closePrice - openPrice) / openPrice;
}

// 이동평균선을 계산하는 함수
export function calculateMovingAverage(
    data: ICandle[],
    period: number = 3
): number[] {
    const movingAverages: number[] = [];

    for (let i = 0; i <= data.length - period; i++) {
        const slice = data.slice(i, i + period);
        const sum = slice.reduce((acc, cur) => acc + cur.trade_price, 0);
        movingAverages.push(sum / period);
        // console.log(
        //     i,
        //     slice[slice.length - 1].candle_date_time_kst,
        //     sum / period
        // );
    }

    // console.log("calculateMovingAverage", data, period, movingAverages);

    return movingAverages;
}

export function calculateRiskAdjustedCapital(
    targetVolatility: number,
    volatility: number,
    size: number,
    initialCapital: number
): number {
    if (volatility === 0 || size === 0) {
        return 0;
    }

    return (targetVolatility / volatility / size) * initialCapital;
}

export function calculateVolatility(candles: ICandle[]) {
    const volatilities = candles.map(
        (candle) =>
            ((candle.high_price - candle.low_price) / candle.opening_price) *
            100
    );
    return (
        volatilities.reduce((acc, curr) => acc + curr, 0) / volatilities.length
    );
}

export function calculateVolume(candles: ICandle[]): number {
    return candles.reduce(
        (acc: number, cur: ICandle) => acc + cur.candle_acc_trade_volume,
        0
    );
}

// 모든 이동평균보다 위에 있는가
export function isAboveAllMovingAverages(
    currentPrice: number,
    movingAverages: Record<string, number>
): boolean {
    return (
        currentPrice > movingAverages.ma3 &&
        currentPrice > movingAverages.ma5 &&
        currentPrice > movingAverages.ma10 &&
        currentPrice > movingAverages.ma20
    );
}

/* export function calculateROI(
    initialInvestment: number,
    finalValue: number
): number {
    return ((finalValue - initialInvestment) / initialInvestment) * 100;
}

export function calculateNPV(rate: number, cashFlows: number[]): number {
    return cashFlows.reduce(
        (npv, cashFlow, i) => npv + cashFlow / Math.pow(1 + rate, i + 1),
        0
    );
}

export function calculateIRR(cashFlows: number[]): number {
    let rate = 0.1;
    let npv = calculateNPV(rate, cashFlows);
    while (Math.abs(npv) > 0.01) {
        rate += npv > 0 ? 0.001 : -0.001;
        npv = calculateNPV(rate, cashFlows);
    }
    return rate;
}



 */
