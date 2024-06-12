// bollingerBandMinutes

import { sendTelegramMessageToChatId } from "../../notifications";
import { fetchMinutesCandles } from "../../services/api";

interface ICandle {
    market: string;
    date_time: string;
    opening_price: number;
    trade_price: number;
    high_price: number;
    low_price: number;
    candle_acc_trade_volume: number;
}

interface IBollingerBands {
    middleBand: number;
    upperBand: number;
    lowerBand: number;
}

async function fetchHourlyCandleData(
    market: string,
    minutes: number
): Promise<ICandle[]> {
    return await fetchMinutesCandles(market, minutes as TCandleUnit, 60); // 60분 간격으로 60개의 캔들 데이터를 가져옵니다.
}

function computeBollingerBands(
    candles: ICandle[],
    period: number = 20,
    multiplier: number = 2
): IBollingerBands {
    const closingPrices = candles.map((candle) => candle.trade_price);
    const middleBand =
        closingPrices.slice(-period).reduce((acc, price) => acc + price, 0) /
        period;

    const variance =
        closingPrices
            .slice(-period)
            .reduce((acc, price) => acc + Math.pow(price - middleBand, 2), 0) /
        period;
    const stdDeviation = Math.sqrt(variance);

    const upperBand = middleBand + stdDeviation * multiplier;
    const lowerBand = middleBand - stdDeviation * multiplier;

    return { middleBand, upperBand, lowerBand };
}

function generateBollingerBandSignal(
    currentPrice: number,
    bollingerBands: IBollingerBands
): string {
    if (currentPrice <= bollingerBands.lowerBand) {
        return "매수 신호";
    } else if (currentPrice >= bollingerBands.upperBand) {
        return "매도 신호";
    }
    return "유지";
}

async function executeBollingerBandStrategy(market: string, minutes: number) {
    const candles = await fetchHourlyCandleData(market, minutes);
    const bollingerBands = computeBollingerBands(candles);

    const currentPrice = candles[candles.length - 1].trade_price;
    const signal = generateBollingerBandSignal(currentPrice, bollingerBands);

    const message = `📈 [${market}]\n시간: ${new Date(
        candles[candles.length - 1].date_time
    ).toLocaleString()}\n현재 가격: ${currentPrice}\n볼린저 밴드: 상단 ${
        bollingerBands.upperBand
    }, 중간 ${bollingerBands.middleBand}, 하단 ${
        bollingerBands.lowerBand
    }\n신호: ${signal}`;

    console.log(message);

    if (signal !== "유지") await sendTelegramMessageToChatId(message);

    // if (market && signal === "매도 신호")
    //     await sendTelegramMessageToChatId(message);
    // if (market !== "KRW-AERGO" && signal === "매수 신호")
    //     await sendTelegramMessageToChatId(message);
}

// 실행 예제
(async () => {
    /* const market = "KRW-AERGO";
    const minutes = 1;
    await executeBollingerBandStrategy(market, minutes);
    setInterval(
        async () => {
            await executeBollingerBandStrategy(market, minutes);
        },
        minutes * 60 * 1000
    ); // 60분 간격으로 신호 알림 제공 */

    const markets = ["KRW-AERGO"];

    markets.forEach((market) => exec(market));

    async function exec(market: string) {
        const minutes = 1;
        await executeBollingerBandStrategy(market, minutes);
        setInterval(
            async () => {
                await executeBollingerBandStrategy(market, minutes);
            },
            minutes * 60 * 1000
        ); // 60분 간격으로 신호 알림 제공
    }
})();
