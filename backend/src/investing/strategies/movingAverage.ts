// 5 이동평균선을 계산하는 함수
export function calculateMovingAverage(
    data: ICandle[],
    period: number = 5
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
