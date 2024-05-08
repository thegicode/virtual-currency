import AppBacktest4 from "./AppBacktest4";

class TradeStrategy {
    protected app: AppBacktest4;
    protected index: number;
    // protected buyData: number;
    protected data: ITradeData4;

    constructor(app: AppBacktest4, data: ITradeData4, index: number) {
        this.app = app;
        this.data = data;
        this.index = index;

        // this.buyData =
        //     this.index > 0 && this.prevData && this.prevData.buy_index
        //         ? this.app.tradeData[this.prevData.buy_index]
        //         : null;
    }

    get buy_index() {
        return this.index > 0 ? this.prevData.buy_index : null;
    }

    get prevData() {
        return this.index > 0 ? this.app.tradeData[this.index - 1] : null;
    }

    get buyData() {
        return this.index > 0 &&
            this.prevData &&
            typeof this.prevData.buy_index === "number"
            ? this.app.tradeData[this.prevData.buy_index]
            : null;
    }

    get orderAmount() {
        if (!this.buyData.volatility) return 0;
        const percent = (this.app.target / this.buyData.volatility) * 100;
        const unitPercent = percent / this.app.marketSize;
        return (this.app.totalInvestmentPrice * unitPercent) / 100;
    }

    get rate() {
        return 0;
    }

    get profit() {
        return 0;
    }

    get sum_profit() {
        return this.prevData ? this.prevData.sum_profit : 0;
    }

    get unrealize_rate() {
        return 0;
    }

    get unrealize_profit() {
        return 0;
    }

    get unrealize_sum() {
        return this.prevData ? this.prevData.unrealize_sum : 0;
    }
}

class BuyStrategy extends TradeStrategy {
    constructor(app: AppBacktest4, data: ITradeData4, index: number) {
        super(app, data, index);
    }

    get buy_index() {
        return this.index;
    }

    get unrealize_sum() {
        if (!this.prevData) return 0;
        return this.prevData.unrealize_sum ? this.prevData.unrealize_sum : 0;
    }

    get orderAmount() {
        // 데이터의 volatility 값이 없거나 0인 경우, 0을 반환
        if (!this.data.volatility || this.data.volatility === 0) return 0;

        const percent = (this.app.target / this.data.volatility) * 100;
        const unitPercent = percent / this.app.marketSize;
        return (this.app.totalInvestmentPrice * unitPercent) / 100;
    }
}

class HoldStrategy extends TradeStrategy {
    constructor(app: AppBacktest4, data: ITradeData4, index: number) {
        super(app, data, index);
    }

    get unrealize_rate() {
        return (
            (this.data.trade_price - this.buyData.trade_price) /
            this.buyData.trade_price
        );
    }

    get unrealize_profit() {
        return this.unrealize_rate * this.orderAmount;
    }

    get unrealize_sum() {
        return this.prevData.unrealize_sum
            ? this.prevData.unrealize_sum + this.unrealize_profit
            : 0;
    }
}

class SellStrategy extends TradeStrategy {
    private sellPrice: number;

    constructor(
        app: AppBacktest4,
        data: ITradeData4,
        index: number,
        sellPrice: number
    ) {
        super(app, data, index);
        this.sellPrice = sellPrice;
    }

    get rate() {
        return (
            (this.sellPrice - this.buyData.trade_price) /
            this.buyData.trade_price
        );
    }

    get profit() {
        return this.rate * this.orderAmount;
    }

    get sum_profit() {
        return (this.prevData.sum_profit || 0) + this.profit;
    }

    get unrealize_sum() {
        return this.sum_profit;
    }
}

class ReserveStrategy extends TradeStrategy {
    constructor(app: AppBacktest4, data: ITradeData4, index: number) {
        super(app, data, index);
    }
}

export { BuyStrategy, HoldStrategy, SellStrategy, ReserveStrategy };
