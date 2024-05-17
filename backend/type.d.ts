interface ICandle {
    market: string;
    time: string;
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

interface ITicker {
    market: string;
    trade_price: number;
    trade_timestamp: string;
}
