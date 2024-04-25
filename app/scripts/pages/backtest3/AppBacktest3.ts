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

    constructor() {
        super();

        this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
        this.investmentPrice = 200000;
        this.profit = [];
    }

    connectedCallback() {
        this.story();
    }

    // disconnectedCallback() {}

    private async story() {
        // for (let index = 0; index < 30; index++) {
        try {
            const toDate = this.getTestDate(0);
            const oneMonthData = await this.loadData(toDate);

            // if (!oneMonthData) {
            //     console.error("Failed to load data for date:", toDate);
            //     continue;
            // }

            const marketWithRates = this.getMarketWithRates(oneMonthData);
            const sortedMarkets = this.getSortedMarkets(marketWithRates);
            const tradeMarkets = this.getTradeMarkets(sortedMarkets);

            console.log("tradeMarkets", tradeMarkets);

            const profit = await this.trade(tradeMarkets, toDate);
            this.profit.push(profit);
            // console.log(profit);
        } catch (error) {
            console.error(
                "An error occurred during the story execution:",
                error
            );
        }
        // }
    }

    private async loadData(toDate: string) {
        const promises = this.markets.map(async (market) => {
            const candles = await this.getCandles(market, "30", toDate);
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

    private async trade(markets: string[], toDate: string) {
        const marketsData = await this.loadData2(markets, toDate);
        const result = marketsData
            .map((aMarket, index) => {
                const distance =
                    aMarket[1].trade_price - aMarket[0].trade_price;
                const rate = distance / aMarket[0].trade_price;
                const gain = this.investmentPrice * rate;

                // console.log(
                //     markets[index],
                //     distance.toLocaleString(),
                //     rate * 100,
                //     Math.round(gain).toLocaleString()
                // );

                return gain;
            })
            .reduce((acc, value) => {
                return acc + value;
            }, 0);

        return result;
    }

    private async loadData2(markets: string[], toDate: string) {
        const newToDate = this.getTradeDate(toDate);
        console.log("newToDate", newToDate);
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
