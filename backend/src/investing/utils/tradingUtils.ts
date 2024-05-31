// TradingUtils
/**
 * 트레이딩 전략과 직접적으로 관련된 함수
 * 트레이딩 시나리오에서 사용되는 구체적인 계산과 트레이딩 신호 생성 등
 * 포함될 함수들:
 * 트레이딩 신호 생성 (Trade Signal Generation)
 * 특정한 트레이딩 전략의 실행 (Execute Specific Trading Strategy)
 */

// 1day 노이즈 = 1 - abs(시가 - 종가)/(고가 - 저가)
function calculateNoise(candle: ICandle) {
    const range = candle.high_price - candle.low_price;
    const body = candle.opening_price - candle.trade_price;
    return 1 - Math.abs(body) / range;
}

// 노이즈 평균 계산하기
export function calculateAverageNoise(candles: ICandle[]) {
    const noiseValues = candles.map(calculateNoise);
    const totalNoise = noiseValues.reduce((sum, noise) => sum + noise, 0);
    return totalNoise / noiseValues.length;
}

// 돌파 확인
export function checkBreakout(candle: ICandle, range: number, k: number) {
    return candle.trade_price > candle.opening_price + range * k;
}

// candle 레인지 계산
export function calculateRange(candle: ICandle) {
    return candle.high_price - candle.low_price;
}

// 노이즈 값이 가장 작은 n개 선정
/* export function selectLowNoiseCryptos(cryptos: ICrypto[], n: number) {
    const cryptowithNoise = cryptos.map((crypto) => {
        const averageNoise = calculateAverageNoise(crypto.candles);
        return {
            ...crypto,
            averageNoise,
        };
    });

    cryptowithNoise.sort((a, b) => a.averageNoise - b.averageNoise);

    return cryptowithNoise.slice(0, n);
}
 */
