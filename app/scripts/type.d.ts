interface IAccount {
    avg_buy_price: number;
    buy_price: number;
    currency: string;
    locked: number;
    unit_currency: string;
    volume: number;
}

interface IAsset {
    avg_buy_price: string;
    avg_buy_price_modified: boolean;
    balance: string;
    currency: string;
    locked: number;
    unit_currency: string;
}

interface IProcessedAccountData {
    currency: string;
    unitCurrency: string;
    buyPrice: number;
    avgBuyPrice: number;
    volume: number;
    locked: number;
    market: string;
    profit: number;
    profitRate: number;
}

interface ITicker {
    market: string;
    trade_price: number;
}
