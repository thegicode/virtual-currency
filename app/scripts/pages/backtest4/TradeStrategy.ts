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

// private setProfit(data: ITradeData4, index: number, sellPrice: number) {
//     const aData = JSON.parse(JSON.stringify(data));
//     const prevTradeData = index > 0 && this.tradeData[index - 1];
//     const buyData = index > 0 && this.tradeData[prevTradeData.buy_index];

//     const getOrderAmount = () => {
//         const percent = (this.target / buyData.volatility) * 100;
//         const unitPercent = percent / this.marketSize;
//         return (this.totalInvestmentPrice * unitPercent) / 100;
//     };

//     switch (aData.action) {
//         case "Buy":
//             return {
//                 ...aData,
//                 buy_index: index,
//                 sum_profit: prevTradeData.sum_profit || 0,
//                 unrealize_sum: prevTradeData.unrealize_sum || 0,
//             };
//         case "Hold":
//             const unrealize_rate =
//                 (aData.trade_price - buyData.trade_price) /
//                 buyData.trade_price;
//             const unrealize_profit = unrealize_rate * getOrderAmount();

//             return {
//                 ...aData,
//                 buy_index: prevTradeData.buy_index,
//                 sum_profit: prevTradeData.sum_profit || 0,
//                 unrealize_rate,
//                 unrealize_profit,
//                 unrealize_sum:
//                     prevTradeData.unrealize_sum + unrealize_profit,
//             };
//         case "Sell":
//             const rate =
//                 (sellPrice - buyData.trade_price) / buyData.trade_price;
//             const profit = rate * getOrderAmount();
//             const sum_profit = prevTradeData.sum_profit + profit;

//             return {
//                 ...aData,
//                 rate,
//                 profit,
//                 sum_profit: sum_profit,
//                 unrealize_sum: sum_profit,
//             };

//         case "Reserve": {
//             return {
//                 ...aData,
//                 sum_profit: prevTradeData.sum_profit || 0,
//                 unrealize_sum: prevTradeData.unrealize_sum || 0,
//             };
//         }
//     }
// }
