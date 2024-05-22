interface ICandle {
    market: string;
    date: string;
    candle_date_time_kst: string;
    opening_price: number;
    trade_price: number;
    high_price: number;
    low_price: number;
    candle_acc_trade_volume: number;
}

interface ICandleMinuteRSI extends ICandle {
    rsi?: number;
    signal?: number;
    capital?: number;
}

interface ICrypto {
    symbol: string;
    candles: ICandle[];
}

interface ITicker {
    market: string;
    trade_price: number;
    trade_timestamp: string;
}

interface IMovingAverageCheckResult {
    market: string;
    movingAverage: number;
    currentPrice: number;
    signal: string;
}

type TCandleUnit = 1 | 3 | 5 | 10 | 15 | 30 | 60 | 240;
