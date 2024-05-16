interface ICandle {
    high_price: number;
    low_price: number;
    opening_price: number;
    trade_price: number;
}

interface ICrypto {
    symbol: string;
    candles: ICandle[];
}
