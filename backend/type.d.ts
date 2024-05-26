interface ICandle {
    market: string;
    date_time: string;
    candle_date_time_kst?: string;
    opening_price: number;
    trade_price: number;
    high_price: number;
    low_price: number;
    candle_acc_trade_volume: number;
}

interface ICrypto {
    symbol: string;
    candles: ICandle[];
}

interface IDailyMovingAverageResult {
    market: string;
    movingAverage: number;
    currentPrice: number;
    signal: string;
}

interface IMarket {
    market: string;
    korean_name: string;
    english_name: string;
    market_warning: string;
}

interface IMinutesCandleRSI extends ICandle {
    rsi?: number;
    signal?: number;
    capital?: number;
}

interface IMinutesMovingAverageBacktestTrade {
    date: string;
    action: string;
    price: number;
    capital: number;
    position: number;
    profit?: number;
}

interface IMovingAverageAndVolatilityResult {
    market: string;
    currentPrice: number;
    volatility: number;
    signal: string;
    position: number;
    capitalAllocation: number;
}

interface IMovingAverages {
    ma3: number;
    ma5: number;
    ma10: number;
    ma20: number;
}

interface ITicker {
    market: string;
    trade_price: number;
    trade_timestamp: string;
}

type TCandleUnit = 1 | 3 | 5 | 10 | 15 | 30 | 60 | 240;
