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
 * 상승장에서 좋은 방법, 하락장에서는 손실이 크다.
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
    private qqqData: any;
    private template: HTMLTemplateElement;
    private tradeData: any[];
    private count: number;
    private totalGain: number;
    private totalUnrealizeGain: number;

    constructor() {
        super();

        this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
        this.investmentPrice = 200000;
        this.profit = [];
        this.data = [];
        this.qqqData = {};
        this.tradeData = [];
        this.count = 200;
        this.totalGain = this.investmentPrice * 3;
        this.totalUnrealizeGain = 0;

        this.template = document.querySelector(
            "#tp-item"
        ) as HTMLTemplateElement;
    }

    async connectedCallback() {
        const toDate = this.getToDate();
        this.data = await this.loadData(toDate, this.count.toString());
        this.qqqData = this.transformData();

        this.runBackTest();
    }

    // disconnectedCallback() {}

    private async runBackTest() {
        for (let index = 0; index < 30; index++) {
            // 한달 데이터 테스트, 수익률 계산
            const { testMonthData, qqqTestMonthData } = this.getTestData(index);
            const {
                marketTestRates,
                qqqMarketTestRates, // 이건 배열로?
            } = this.getMarketTestRates(testMonthData, qqqTestMonthData);

            // 거래 날짜
            const tradeDate = testMonthData[0].tradeDate;
            console.log(index, tradeDate);

            // 테스트 결과 수익이 난 코인 정렬
            const { sortedMarkets, qqqSortedMarkets } = this.getSortedMarkets(
                marketTestRates,
                qqqMarketTestRates // 배열 받아서 처리?
            );

            // 거래할 코인 목록 가져오기
            const { tradeMarkets, qqqTradeMarkets } = this.getTradeMarkets(
                sortedMarkets,
                qqqMarketTestRates // sortedMarkets 방식이 더 나은 ?
            );

            // 거래 데이터
            const { tradeData, newTradeData } = this.getTradeData(
                tradeMarkets,
                index
            );

            // 거래하는 데이터 정비
            const formedTradeData = this.setTradeData(
                newTradeData,
                index,
                tradeDate
            );

            this.tradeData.push(formedTradeData);

            // Hold, Sell 이윤
            const { tradeProfits, selledProfits, sumGain, SumUnrealizeGain } =
                this.getTradeProfits(
                    tradeData,
                    newTradeData,
                    index,
                    formedTradeData
                );

            this.profit.push(SumUnrealizeGain);

            this.render(
                index,
                tradeDate,
                tradeProfits,
                selledProfits,
                sumGain,
                SumUnrealizeGain
            );
        }

        // console.log(this.tradeData);

        this.renderSummary();
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
            // const qqqData = {
            //     [market]: candles,
            // };

            return {
                market,
                candles,
            };
        });
        return await Promise.all(promises);
    }

    private transformData() {
        const data = [...this.data];
        let newData: IMarketCandles = {};
        data.forEach(({ market, candles }) => {
            newData[market] = candles;
        });

        return newData;
    }

    private getTestData(index: number) {
        const testMonthData = this.data.map(({ market, candles }) => {
            const newCandles = candles.slice(index, 30 + index);
            const tradeDate = candles[index + 30].candle_date_time_kst;

            return {
                market,
                candles: newCandles,
                tradeDate,
            };
        });

        const qqqTestMonthData: any = {};
        for (const market in this.qqqData) {
            const candles = this.qqqData[market].slice(index, 30 + index);
            const tradeDate =
                this.qqqData[market][30 + index].candle_date_time_kst;
            qqqTestMonthData[market] = {
                candles,
                tradeDate,
            };
        }

        return { testMonthData, qqqTestMonthData };
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

    private getMarketTestRates(
        oneMonthData: IBackTestData3[],
        qqqTestMonthData: any
    ) {
        const marketTestRates = oneMonthData.map(({ market, candles }) => {
            const startPrice = candles[0].trade_price;
            const lastPrice = candles[candles.length - 1].trade_price;
            const rate = (lastPrice - startPrice) / startPrice;
            return {
                market,
                rate: rate * 100,
            };
        });

        const qqqMarketTestRates: any = {};
        for (const market in qqqTestMonthData) {
            const candles = qqqTestMonthData[market].candles;
            const startPrice = candles[0].trade_price;
            const lastPrice = candles[candles.length - 1].trade_price;
            const rate = (lastPrice - startPrice) / startPrice;

            qqqMarketTestRates[market] = rate * 100;
        }

        return {
            marketTestRates,
            qqqMarketTestRates,
        };
    }

    private getSortedMarkets(
        marketRates: IMarketWithRate[],
        qqqMarketTestRates: any
    ) {
        const markets = [...marketRates].sort((a, b) => b.rate - a.rate);
        const sortedMarkets = markets.filter((aMarket) => aMarket.rate > 0);

        const qqqSortedMarkets = Object.entries(qqqMarketTestRates)
            .sort((a: any, b: any) => b[1] - a[1])
            .filter((item: any) => item[1] > 0);

        return { sortedMarkets, qqqSortedMarkets };
    }

    private getTradeMarkets(
        markets: IMarketWithRate[],
        qqqMarketTestRates: any
    ) {
        const newMarkets = markets
            .filter((aMarket) => {
                if (aMarket.rate > 0) return aMarket;
            })
            .map((aMarket) => aMarket.market);
        const tradeMarkets =
            newMarkets.length > 3 ? newMarkets.slice(0, 3) : newMarkets;

        const qqqMarkets = Object.entries(qqqMarketTestRates)
            .filter(([market, rate]: any) => rate > 0)
            .map(([market, rate]) => market);

        const qqqTradeMarkets =
            qqqMarkets.length > 3 ? qqqMarkets.slice(0, 3) : qqqMarkets;

        return { tradeMarkets, qqqTradeMarkets };
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

        const newTradeData: any = {};
        tradeMarkets.forEach((market) => {
            newTradeData[market] = [
                this.qqqData[market][tradeIndex - 1],
                this.qqqData[market][tradeIndex],
            ];
        });

        return { tradeData, newTradeData };
    }

    private setTradeData(
        tradeData: IMarketCandles,
        index: number,
        date: string
    ) {
        let tradeMarkets: ITradeMarket = {};

        const prevTrades = index > 0 && this.tradeData[index - 1].tradeMarkets;
        const prevMarkets = Object.keys(prevTrades);

        if (index === 0) {
            for (const market in tradeData) {
                tradeMarkets[market] = {
                    action: "Buy",
                };
            }
        } else {
            for (const market in tradeData) {
                tradeMarkets[market] = {
                    action: prevMarkets.includes(market) ? "Hold" : "Buy",
                };
            }
        }

        const markets = Object.keys(tradeData);
        const sellMarkets = prevMarkets.filter(
            (prevMarket) => !markets.includes(prevMarket)
        );

        const result = {
            date,
            tradeMarkets,
            sellMarkets,
        };

        return result;
    }

    private getTradeProfits(
        tradeData: IBackTestData3[], //array
        newTradeData: any, // object
        index: number,
        formedTradeData: any
    ) {
        //  todo - formedTradeData clonedeep
        // set buy_price
        for (const market in formedTradeData.tradeMarkets) {
            let buyPrice = 0;
            const action = formedTradeData.tradeMarkets[market].action;

            const candles = newTradeData[market];

            switch (action) {
                case "Buy":
                    buyPrice = candles[1].trade_price;
                    break;
                case "Hold":
                    buyPrice =
                        this.tradeData[index - 1].tradeMarkets[market]
                            .buy_price;

                    break;
            }

            formedTradeData.tradeMarkets[market] = {
                ...formedTradeData.tradeMarkets[market],
                buy_price: buyPrice,
            };
        }

        // new Profits
        const tradeProfits = Object.entries(newTradeData).map(
            ([market, candles]: [string, any]) => {
                const marketTradeData = formedTradeData.tradeMarkets[market];
                switch (marketTradeData.action) {
                    case "Hold":
                        const distance =
                            candles[1].trade_price - marketTradeData.buy_price;
                        const rate = distance / marketTradeData.buy_price;
                        const gain = this.investmentPrice * rate;

                        return {
                            market,
                            rate: rate,
                            gain: gain,
                        };
                    default: // "Buy";
                        return {
                            market,
                            rate: 0,
                            gain: 0,
                        };
                }
            }
        );

        // sell Market Profits
        const selledProfits =
            formedTradeData.sellMarkets &&
            formedTradeData.sellMarkets.map((market: string) => {
                const tradeIndex = 30 + index;
                const buyPrice =
                    this.tradeData[index - 1].tradeMarkets[market].buy_price;
                const aData = this.qqqData[market][30 + index];
                const rate = (aData.trade_price - buyPrice) / buyPrice;
                const gain = this.investmentPrice * rate;

                return {
                    market,
                    rate,
                    gain,
                };
            });

        const sumGain = selledProfits.reduce((acc: number, value: any) => {
            return acc + value.gain;
        }, 0);

        const SumUnrealizeGain = [...tradeProfits].reduce(
            (acc: number, value: any) => {
                return acc + value.gain;
            },
            0
        );

        this.totalGain += sumGain;

        this.totalUnrealizeGain = this.totalGain + SumUnrealizeGain;

        return {
            tradeProfits,
            selledProfits,
            sumGain,
            SumUnrealizeGain,
        };
    }

    private render(
        index: number,
        tradeDate: string,
        tradeProfits: ITradeProfits[],
        selledProfits: any,
        sumGain: number,
        SumUnrealizeGain: number
    ) {
        const cloned = cloneTemplate(this.template);

        const buyContainer = this.renderBuySell(tradeProfits);
        const sellContainer = this.renderBuySell(selledProfits);

        cloned.querySelector(".tradeMarkets")?.appendChild(buyContainer);
        cloned.querySelector(".sellMarkets")?.appendChild(sellContainer);

        const data = {
            index,
            date: tradeDate,
            SumUnrealizeGain: Math.round(SumUnrealizeGain).toLocaleString(),
            sumGain: Math.round(sumGain).toLocaleString(),
            totalGain: Math.round(this.totalGain).toLocaleString(),
            totalUnrealizeGain: Math.round(
                this.totalUnrealizeGain
            ).toLocaleString(),
        };
        updateElementsTextWithData(data, cloned);

        const container = this.querySelector("tbody") as HTMLElement;
        container.appendChild(cloned);
    }

    private renderBuySell(data: any[]) {
        const tradeTp = document.querySelector(
            "#tp-trade"
        ) as HTMLTemplateElement;
        const container = document.createElement("ul") as HTMLUListElement;
        data.map(({ market, rate, gain }) => {
            const tradeData = {
                market,
                rate: (rate * 100).toFixed(2),
                gain: Math.round(gain).toLocaleString(),
            };
            const clonedTrade = cloneTemplate(tradeTp);
            updateElementsTextWithData(tradeData, clonedTrade);
            return clonedTrade;
        }).forEach((cloned) => container.appendChild(cloned));
        return container;
    }

    private renderSummary() {
        const priceElement = this.querySelector(
            ".summaryAllPrice"
        ) as HTMLElement;
        const rateElement = this.querySelector(
            ".summaryAllRate"
        ) as HTMLElement;
        const marketsElement = this.querySelector(".markets") as HTMLElement;
        const countElement = this.querySelector(".count") as HTMLElement;

        const sumRate =
            ((this.totalUnrealizeGain - this.investmentPrice * 3) /
                this.investmentPrice) *
            100;

        priceElement.textContent = Math.round(
            this.totalUnrealizeGain - this.investmentPrice * 3
        ).toLocaleString();
        rateElement.textContent = Math.round(sumRate).toLocaleString();
        marketsElement.textContent = this.markets.join(" | ");
        countElement.textContent = this.count.toString();
    }
}
