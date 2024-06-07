// averageNoiseRatioSignalCheck

/**
 * 투자 전략 : 다자 가상화폐 + 평균 노이즈 비율
 * 거래 비용 : 0.2% 적용
 * 투자 전략 :
 *      1. 각 종목에 투자 자금 5분의 1씩 동일 비중 배분
 *      2. 매수 : 당일 실시간 가격 > 당일 시가 + (레인지 * 0.5)
 *      3. 자금 관리 : (전일 고가 - 저가) / 전일 종가 * 100 값이 투자 자금의 1%를 초과하지 않도록 투자 비중 조절
 *      4. 각 종목의 30일 평균 노이즈 값 산출
 *      5. 투자 직전의 30일 평균 노이즈 값이 가장 작은 종목 n개 선정
 *      6. 선정된 n개 종목의 돌파 전략 수익 곡선에 n분의 1 자금 투입
 *      7. 30일 평균 노이즈 값이 가장 작으면서, 노이즈 값이 특정 역치 이하인 경우만 진입
 *      8. 매도 : 다음 날 시가
 */

import { fetchDailyCandles } from "../../services/api";
import {
    calculateAdjustedInvestment,
    calculateAverageNoise,
    calculateMovingAverage2,
    calculateRange,
    checkBreakout,
    formatPrice,
} from "../utils";

interface INoiseAveragedData {
    market: string;
    candles: ICandle[];
    noiseAverage: number;
}

interface IResult {
    market: string;
    date: string;
    noiseAverage: number;
    signal: string;
    price: number;
    investment: number;
}
export async function averageNoiseRatioSignalCheck(
    markets: string[],
    initialCapital: number,
    k: number = 0.5,
    targetRate: number = 0.01
) {
    try {
        const noiseAveragedData = await Promise.all(
            markets.map(
                async (market: string) => await getNoiseAverages(market)
            )
        );

        const selectedData = selectMarkets(noiseAveragedData);

        const results = await gerateSignal(
            selectedData,
            initialCapital,
            k,
            targetRate,
            markets.length
        );

        return createMessage(results);
    } catch (error) {
        console.error("Error averageNoiseRatioSignalCheck: ", error);
        return "Error in executing the strategy.";
    }
}

async function getNoiseAverages(market: string) {
    const candles = await fetchDailyCandles(market, (31).toString());

    // 각 종목의 30일 평균 노이즈 값 산출
    const noiseAverage = calculateAverageNoise(candles, market) ?? 0;

    return {
        market,
        candles,
        noiseAverage,
    };
}

function selectMarkets(noiseAveraged: INoiseAveragedData[]) {
    // 노이즈 0.55 이하 : 절대 모멘텀
    const filterdData = noiseAveraged.filter(
        (aData) => aData.noiseAverage < 0.55
    );

    // 30일 평균 노이즈 값이 가장 작은 종목 n개 선정 : 상대 모멘텀
    const sorted = filterdData.sort((a, b) => a.noiseAverage - b.noiseAverage);
    return sorted.slice(0, 4);
}

async function gerateSignal(
    noiseAveragedData: INoiseAveragedData[],
    initialCapital: number,
    k: number,
    targetRate: number,
    size: number
) {
    // 선정된 n개 종목의 돌파 전략 수익 곡선에 n분의 1 자금 투입
    return await Promise.all(
        noiseAveragedData.map(async ({ market, candles, noiseAverage }) => {
            const currentCandle = candles[candles.length - 1];
            const prevCandle = candles[candles.length - 2];
            const last5Candles = candles.slice(-6, -1);

            // 각 화폐의 레인지 계산 (전일 고가 - 저가)
            const range = await calculateRange(prevCandle);

            // 각 화폐의 가격이 5일 이동 평균보다 높은지 여부 파악
            const priceMovingAverage = calculateMovingAverage2(last5Candles, 5);
            const isOverPriceAverage =
                currentCandle.trade_price > priceMovingAverage;

            // 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
            const isBreakOut = checkBreakout(currentCandle, range, k);

            // 매수 신호 확인
            const isBuySign = isOverPriceAverage && isBreakOut ? true : false;

            // 투자 금액
            const { investment } = calculateAdjustedInvestment(
                range,
                prevCandle,
                targetRate,
                size,
                initialCapital
            );

            return {
                market,
                date: currentCandle.date_time,
                noiseAverage,
                signal: isBuySign ? "매수 또는 보유" : "매도 또는 유보",
                price: currentCandle.trade_price,
                investment: isBuySign ? investment : 0,
            };
        })
    );
}

function createMessage(results: IResult[]) {
    const title = `\n 🔔 다자 가상화폐 + 평균 노이즈 비율\n`;
    const memo = `- 오전 9시 확인 \n\n`;

    const message = results
        .map((result) => {
            return `📈 [${result.market}] 
날      짜 : ${result.date}
평균노이즈 : ${result.noiseAverage.toFixed(3)}
신      호 : ${result.signal}
가      격 : ${formatPrice(result.price)}원
매  수  금 : ${formatPrice(Math.round(result.investment))}원
`;
        })
        .join("\n");
    return `${title}${memo}${message}`;
}

// (async () => {
//     const markets = [
//         "KRW-BTC",
//         "KRW-ETH",
//         "KRW-DOGE",
//         "KRW-TFUEL",
//         "KRW-1INCH",
//         "KRW-SBD",
//     ];
//     const result = await averageNoiseRatioSignalCheck(markets, 100000);
//     console.log(result);
// })();
