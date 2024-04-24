/**
 * 투자전략 3 : 듀얼 모멘텀 + 현금 비중 최소 90%
 * 거래비용 0.2% 적용
 * 투자 대상 : 아무 가상화폐 3, 4개 선택
 * 거래비용 : 0.2% 적용
 * 투자전략
 *  - 선택한 가상화폐의 과거 30일 수익률 체크
 *  - 최근 30일간 가장 수익률이 좋은 가상화폐에서 자산의 10% 투입
 *  - 최근 30일간 가장 수익률이 좋은 가상화폐가 바뀔 경우 기존 보유 화폐 매도, 새로운 화폐 매수
 *  - 선택한 모든 가상화폐의 30일 수익률이 마이너스로 돌아설 경우 모든 가상화폐 매도, 현금 보유
 */

import { setMovingAverage } from "@app/scripts/components/backtest/movingAverage";

export default class AppBacktest3 extends HTMLElement {
    private markets: string[];
    private data: any;
    private investmentPrice: number;

    constructor() {
        super();

        this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
        this.data = [];
        this.investmentPrice = 200000;
    }

    async connectedCallback() {
        this.data = await this.loadData();
        this.runProgram();
    }

    disconnectedCallback() {}

    private async loadData() {
        const promises = this.markets.map(async (market) => {
            const candles = await this.getCandles(market);
            return {
                market,
                candles,
            };
        });
        return await Promise.all(promises);
    }

    private async getCandles(market: string) {
        const searchParams = new URLSearchParams({
            market: market,
            count: "30",
        });

        const response = await fetch(`/fetchCandles?${searchParams}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    private runProgram() {
        this.data = this.data.map((marketData: any) => {
            let newMarkets = this.movingAverages(marketData);
            newMarkets = this.checkCondition(newMarkets);
            newMarkets = this.setTradingAction(newMarkets);
            newMarkets = this.setProfit(newMarkets);
            return { ...newMarkets };
        });

        console.log(this.data);
    }

    private movingAverages(marketData: any) {
        const newCandles = setMovingAverage(marketData.candles, 5);
        return {
            ...marketData,
            candles: newCandles,
        };
    }

    private checkCondition(marketData: any) {
        const newCandles = marketData.candles.map((aData: any) => {
            if (!aData.moving_average_5) return aData;
            return {
                ...aData,
                condition: aData.trade_price > aData.moving_average_5,
            };
        });

        return {
            ...marketData,
            candles: newCandles,
        };
    }

    private setTradingAction(marketData: any) {
        const newCandles = marketData.candles.map(
            (aData: any, index: number) => {
                let tradingAction = "";
                if (index === 0) {
                    tradingAction = aData.condition ? "Buy" : "Reserve";
                } else {
                    const prevCondition =
                        marketData.candles[index - 1].condition;
                    if (prevCondition !== aData.condition) {
                        tradingAction = aData.condition ? "Buy" : "Sell";
                    } else {
                        tradingAction = aData.condition ? "Hold" : "Reserve";
                    }
                }

                return {
                    ...aData,
                    tradingAction,
                };
            }
        );

        return {
            ...marketData,
            candles: newCandles,
        };
    }

    private setProfit(marketData: any) {
        let buyTradePrice = 0;
        let profit = 0;
        let rate = 0;

        let sumProfit = 0;
        let sumPrice = 0;

        const getRate = (aData: ICandles) =>
            (aData.trade_price - buyTradePrice) / buyTradePrice;
        const getProfit = (aData: ICandles) => getRate(aData) * getSumPrice();
        const getSumPrice = () => sumPrice || this.investmentPrice;

        const newCandles = marketData.candles.map((aData: any) => {
            switch (aData.tradingAction) {
                case "Buy":
                    buyTradePrice = aData.trade_price;
                    profit = 0;
                    rate = 0;

                    sumPrice = getSumPrice();

                    break;
                case "Sell":
                    rate = getRate(aData);
                    profit = getProfit(aData);

                    sumProfit += profit;
                    sumPrice = this.investmentPrice + sumProfit;

                    break;
                case "Hold":
                    break;
                case "Reserve":
                    profit = 0;
                    rate = 0;
                    sumPrice = getSumPrice();

                    break;
            }

            return {
                ...aData,
                rate: rate * 100,
                profit,
                sumProfit: Number(sumProfit.toFixed(2)),
                sumPrice: Number(sumPrice.toFixed(2)),
            };
        });

        return {
            ...marketData,
            candles: newCandles,
        };
    }
}
