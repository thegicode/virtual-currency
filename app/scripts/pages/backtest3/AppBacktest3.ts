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
        this.getGoodMarkets();
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

    private getGoodMarkets() {
        const marketRates = this.data.map((marketData: any) =>
            this.getRates(marketData)
        );

        // const marketRates = [
        //     {
        //         market: "KRW-BTC",
        //         rate: 20,
        //     },
        //     { market: "KRW-ETH", rate: 10 },
        //     { market: "KRW-XRP", rate: -0.2 },
        // ];

        const markets = this.getMarkets(marketRates);

        this.renderMarkets(markets);
    }

    private getRates({ market, candles }: any) {
        const startPrice = candles[0].trade_price;
        const lastPrice = candles[candles.length - 1].trade_price;
        const rate = (lastPrice - startPrice) / startPrice;
        return {
            market,
            rate: rate * 100,
        };
    }

    private getMarkets(marketRates: any) {
        const sortedMarkets = marketRates.sort(
            (a: any, b: any) => b.rate - a.rate
        );
        const newMarkets = sortedMarkets.filter(
            (aMarket: any) => aMarket.rate > 0
        );

        return newMarkets;
    }

    private renderMarkets(markets: any) {
        const resultElement = this.querySelector(".reulst") as HTMLElement;
        let markupStrings = "";

        if (markets.length === 0) {
            markupStrings =
                "모든 가상화폐의 30일 수익률이 마이너스입니다. <br>모든 코인을 매도하세요.";
        }

        markets.forEach((aMarket: any) => {
            markupStrings += `<li><span>${
                aMarket.market
            }</span> | <span>${aMarket.rate.toFixed(2)}</span></li>`;
        });
        resultElement.innerHTML = markupStrings;
    }
}
