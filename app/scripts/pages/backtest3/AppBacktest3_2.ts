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

export default class AppBacktest3 extends HTMLElement {
    private markets: string[];
    private investmentPrice: number;
    private profit: number[];
    private data: any;

    constructor() {
        super();

        this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
        this.investmentPrice = 200000;
        this.profit = [];
        this.data = {};
    }

    connectedCallback() {
        this.story();
    }

    // disconnectedCallback() {}

    private async story() {
        // 1일
        console.log("1일");
        const toDate = this.getTestDate(0);
        const oneMonthData = await this.loadData(toDate, "3");
        this.data = this.setData(oneMonthData);
        const marketWithRates = this.getMarketWithRates(oneMonthData);
        const sortedMarkets = this.getSortedMarkets(marketWithRates);
        const tradeMarkets = this.getTradeMarkets(sortedMarkets);

        const marketsData = await this.loadTradeData(tradeMarkets, toDate);
        const profit = await this.calculateProfit(marketsData);

        this.profit.push(profit);
        console.log("profit", this.profit, this.data);

        // 2일부터
        {
            setTimeout(async () => {
                console.log("");
                console.log("2일");

                const toDate = this.getTestDate(1);

                const oneDayData = await this.loadData(toDate, "1");
                console.log(oneDayData);

                const oneDayDataMarkets = oneDayData.map(
                    (aData) => aData.market
                );

                // set month test data
                for (const market in this.data) {
                    const index = oneDayDataMarkets.indexOf(market);
                    this.data[market].push(oneDayData[index].candles[0]);
                    this.data[market].shift();
                }

                console.log(this.data);
            }, 1000);
        }
    }

    private setData(marketsArray: any) {
        // const result = {};
        // marketsArray.forEach((marketData: any) => {
        //     result[marketData.market] = marketData.candles;
        // });
        // console.log("setData", result);

        const result = marketsArray.reduce((obj: any, item: any) => {
            obj[item.market] = item.candles;
            return obj;
        }, {});
        return result;
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

    private getMarketWithRates(oneMonthData: any) {
        return oneMonthData.map(({ market, candles }: any) => {
            const startPrice = candles[0].trade_price;
            const lastPrice = candles[candles.length - 1].trade_price;
            const rate = (lastPrice - startPrice) / startPrice;
            return {
                market,
                rate: rate * 100,
            };
        });
    }

    private getSortedMarkets(marketRates: any) {
        const sortedMarkets = [...marketRates].sort(
            (a: any, b: any) => b.rate - a.rate
        );

        const newMarkets = sortedMarkets.filter(
            (aMarket: any) => aMarket.rate > 0
        );

        return newMarkets;
    }

    private renderSortedMarkets(markets: IMarketWithRate[]) {
        const resultElement = this.querySelector(".list") as HTMLElement;
        let markupStrings = "";

        if (markets.length === 0) {
            markupStrings =
                "모든 가상화폐의 30일 수익률이 마이너스입니다. <br>모든 코인을 매도하세요.";
        }

        markets.forEach((aMarket: any) => {
            markupStrings += `<li><dl><dt>${
                aMarket.market
            }</dt><dd>${aMarket.rate.toFixed(2)}%</dd></dl></li>`;
        });
        resultElement.innerHTML = markupStrings;
    }

    private getTradeMarkets(markets: IMarketWithRate[]) {
        const newMarkets = markets
            .filter((aMarket) => {
                if (aMarket.rate > 0) return aMarket;
            })
            .map((aMarket) => aMarket.market);

        return newMarkets.length > 3 ? newMarkets.slice(0, 3) : newMarkets;
    }

    private async calculateProfit(marketsData: any) {
        return marketsData
            .map((aMarket: any, index: number) => {
                const distance =
                    aMarket[1].trade_price - aMarket[0].trade_price;
                const rate = distance / aMarket[0].trade_price;
                return this.investmentPrice * rate;
            })
            .reduce((acc: number, value: number) => {
                return acc + value;
            }, 0);
    }

    private async loadTradeData(markets: string[], toDate: string) {
        const newToDate = this.getTradeDate(toDate);
        const promises = markets.map(async (market) => {
            return await this.getCandles(market, "2", newToDate);
        });
        return await Promise.all(promises);
    }

    private getTestDate(index: number) {
        const now = new Date();
        now.setMonth(now.getMonth() - 1);
        now.setDate(now.getDate() + index);
        now.setHours(18, 0, 0, 0);
        return now.toISOString().slice(0, 19);
    }

    private getTradeDate(toDate: string) {
        const newDate = new Date(toDate);
        newDate.setDate(newDate.getDate() + 1);
        newDate.setHours(18, 0, 0, 0);
        return newDate.toISOString().slice(0, 19);
    }
}

// const marketRates = [
//     {
//         market: "KRW-BTC",
//         rate: 20,
//     },
//     { market: "KRW-ETH", rate: 10 },
//     { market: "KRW-XRP", rate: -0.2 },
// ];
