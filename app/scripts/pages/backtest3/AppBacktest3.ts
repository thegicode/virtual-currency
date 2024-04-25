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
 *
 * 총 수익 : -36394.87781 -> 마이너스
 * 상승장에서 좋은 방법, 하락장에서는 손실이 있다.
 *
 */

import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";

export default class AppBacktest3 extends HTMLElement {
    private markets: string[];
    private investmentPrice: number;
    private profit: number[];
    private data: IBackTestData3[];
    private sum: number;
    private template: HTMLTemplateElement;

    constructor() {
        super();

        this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
        this.investmentPrice = 200000;
        this.profit = [];
        this.data = [];
        this.sum = 0;

        this.template = document.querySelector(
            "#tp-item"
        ) as HTMLTemplateElement;
    }

    async connectedCallback() {
        const toDate = this.getToDate();
        this.data = await this.loadData(toDate, "200");

        this.runBackTest();
    }

    // disconnectedCallback() {}

    private async runBackTest() {
        for (let index = 0; index < 171; index++) {
            const testMonthData = this.getTestData(index);
            const marketWithRates = this.getMarketWithRates(testMonthData);
            const sortedMarkets = this.getSortedMarkets(marketWithRates);
            const tradeMarkets = this.getTradeMarkets(sortedMarkets);
            const tradeData = this.getTradeData(tradeMarkets, index);
            const { tradeProfits, sumProfits } =
                this.getTradeProfits(tradeData);

            this.profit.push(sumProfits);

            const tradeDate = testMonthData[0].candles[29].candle_date_time_kst;
            this.render(
                index,
                tradeDate,
                // tradeMarkets,
                tradeProfits,
                sumProfits
            );

            // console.log(index, tradeProfits, sumProfits);
        }

        this.sum = this.profit.reduce((acc: number, value: number) => {
            return acc + value;
        }, 0);

        const sumElement = this.querySelector(".sum") as HTMLElement;
        sumElement.textContent = Math.round(this.sum).toLocaleString();
    }

    private getToDate() {
        const now = new Date();
        now.setMonth(now.getMonth());
        now.setDate(now.getDate());
        now.setHours(18, 0, 0, 0);
        return now.toISOString().slice(0, 19);
    }

    private async loadData(toDate: string, count: string) {
        const promises = this.markets.map(async (market) => {
            const candles = await this.getCandles(market, count, toDate);
            return {
                market,
                candles,
            };
        });
        return await Promise.all(promises);
    }

    private getTestData(index: number) {
        const testData = this.data.map(({ market, candles }) => {
            const newCandles = candles.slice(index, 30 + index);
            return {
                market,
                candles: newCandles,
            };
        });
        return testData;
    }

    private async getCandles(market: string, count: string, to: string) {
        const searchParams = new URLSearchParams({
            market: market,
            count,
            to,
        });

        const response = await fetch(`/fetchCandles?${searchParams}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    private getMarketWithRates(oneMonthData: IBackTestData3[]) {
        return oneMonthData.map(({ market, candles }) => {
            const startPrice = candles[0].trade_price;
            const lastPrice = candles[candles.length - 1].trade_price;
            const rate = (lastPrice - startPrice) / startPrice;
            return {
                market,
                rate: rate * 100,
            };
        });
    }

    private getSortedMarkets(marketRates: IMarketWithRate[]) {
        const sortedMarkets = [...marketRates].sort((a, b) => b.rate - a.rate);

        const newMarkets = sortedMarkets.filter((aMarket) => aMarket.rate > 0);

        return newMarkets;
    }

    private getTradeMarkets(markets: IMarketWithRate[]) {
        const newMarkets = markets
            .filter((aMarket) => {
                if (aMarket.rate > 0) return aMarket;
            })
            .map((aMarket) => aMarket.market);

        return newMarkets.length > 3 ? newMarkets.slice(0, 3) : newMarkets;
    }

    private getTradeData(tradeMarkets: string[], index: number) {
        const tradeIndex = 30 + index;
        const marketNames = this.data.map((aMarketData) => aMarketData.market);
        const tradeData = tradeMarkets.map((market: string) => {
            const index = marketNames.indexOf(market);
            const candles = this.data[index].candles;
            return {
                market,
                candles: [candles[tradeIndex - 1], candles[tradeIndex]],
            };
        });

        return tradeData;
    }

    private getTradeProfits(tradeData: IBackTestData3[]) {
        const tradeProfits = tradeData.map(({ market, candles }) => {
            const distance = candles[1].trade_price - candles[0].trade_price;
            const rate = distance / candles[0].trade_price;
            const gain = this.investmentPrice * rate;
            return {
                market,
                rate,
                gain,
            };
        });

        const sumProfits = tradeProfits.reduce((acc: number, value: any) => {
            return acc + value.gain;
        }, 0);

        return {
            tradeProfits,
            sumProfits,
        };
    }

    private render(
        index: number,
        tradeDate: string,
        tradeProfits: ITradeProfits[],
        profit: number
    ) {
        const ul = document.createElement("ul") as HTMLUListElement;
        const tradeTp = document.querySelector(
            "#tp-trade"
        ) as HTMLTemplateElement;
        tradeProfits
            .map(({ market, rate, gain }) => {
                const tradeData = {
                    market,
                    rate: (rate * 100).toFixed(2),
                    gain: Math.round(gain).toLocaleString(),
                };
                const clonedTrade = cloneTemplate(tradeTp);
                updateElementsTextWithData(tradeData, clonedTrade);
                return clonedTrade;
            })
            .forEach((cloned) => ul.appendChild(cloned));

        const cloned = cloneTemplate(this.template);
        const data = {
            index,
            date: tradeDate,
            profit: Math.round(profit).toLocaleString(),
        };

        updateElementsTextWithData(data, cloned);

        cloned.querySelector(".tradeMarkets")?.appendChild(ul);

        const container = this.querySelector("tbody") as HTMLElement;
        container.appendChild(cloned);
    }
}
