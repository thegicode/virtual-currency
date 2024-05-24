// 5 이동평균선을 계산하는 함수
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

    return movingAverages;
}

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
