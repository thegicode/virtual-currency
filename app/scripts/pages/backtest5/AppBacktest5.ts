/**
 * 투자전략 5 : 다자 가상화폐 + 변동성 돌파
 * 투자대상 : 아무 가상화폐 몇 개 선택
 * 거래비용  : 0.2% 적용
 * 투자전략 :
 *      - 각 화폐의 레인지 계산 (전일 고가 - 저가)
 *      - 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
 *          - 필자들은 k=0.5 추천
 *      - 돌파에 성공한가상화폐에 자산의 n분의 1 투입
 * 매도 : 다음날 시가
 * 
 * 
 ## 변동성 돌파 전략의 핵심

1. range 계산
    - 원하는 가상화폐의 전일 고가 - 전일 저가
    - 하루 안에 가상화폐가 움직인 최대폭
2. 매수 기준
    - 시가 기준으로 가격이 'range * k' 이상 상승하면 해당 가격에 매수
    - k는 0.5 ~ 1 (0.5 추천)
3. 매도 기준
    - 그 날 종가에 판다.
4. 시가, 종가, 고가, 저가의 기준
    - 시가 : 필자는 주로 오전 0시나 1시
    - 종가 : 시가에서 24시간 후의 가격
    - 고가(저가): 24시간 동안 가장 높은 가격


TODO : 
    Form
    다중 코인 적용
 */

import Control from "./Control";
import Overview from "./Overview";
import Table from "./Table";

export default class AppBacktest5 extends HTMLElement {
    public tradeData: any[];
    public markets: string[];
    public count: number;
    public totalInvestmentAmount: number;
    public investmentAmount: number;
    public k: number;

    private overviewCustomElement: Overview;
    private controlCustomElement: Control;
    private tableCustomElement: Table;

    constructor() {
        super();

        this.tradeData = [];
        this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
        // this.markets = ["KRW-NEAR", "KRW-BTC"];
        this.count = 30;
        this.totalInvestmentAmount = 1000000;
        this.investmentAmount =
            this.totalInvestmentAmount / this.markets.length;
        this.k = 0.5; // 추천 0.5

        this.overviewCustomElement = this.querySelector(
            "backtest-overview"
        ) as Overview;
        this.controlCustomElement = this.querySelector(
            "backtest-control"
        ) as Control;
        this.tableCustomElement = this.querySelector("backtest-table") as Table;
    }

    connectedCallback() {
        this.runBackTest();
    }

    public async runBackTest() {
        for (const market of this.markets) {
            console.log(market);

            try {
                const data = await this.fetchData(
                    market,
                    (this.count + 1).toString()
                );

                const realprices = await this.getRealPrices(data);

                const result = this.backtest(data, realprices);

                this.render(result);
                this.tradeData.push(result);
            } catch (error) {
                console.error("Error in runBackTest:", error);
                // 에러 처리 로직 추가 (예: 에러 발생시 재시도 또는 로그 저장 등)
            }
        }

        this.tableCustomElement.initialSet();
    }

    private backtest(fetchedData: ICandles5[], orginRealPrices: IRealPrice[]) {
        const realPrices = orginRealPrices.slice(1);
        const strategedData = this.strategy(fetchedData, realPrices);
        const calculatedData = this.calculateProfits(strategedData);
        return calculatedData;
    }

    private strategy(fetchedData: ICandles5[], realPrices: IRealPrice[]) {
        const result = fetchedData
            .slice(1)
            .map((aData: ICandles5, index: number) => {
                // 1. 전날 하루만에 움직인 최대폭
                const prevData = fetchedData[index];
                const range = prevData.high_price - prevData.low_price;

                // 2. 매수 기준
                // 실시간 가격 > 당일 시가 + (레인지 * k)
                const realPrice = realPrices[index].price;
                const standardPrice = aData.opening_price + range * this.k;
                const buyCondition = realPrice > standardPrice;

                return {
                    market: aData.market,
                    date: aData.candle_date_time_kst,
                    range,
                    standardPrice,
                    buyCondition,
                    action: buyCondition ? "Trade" : "Reserve",
                    buyPrice: realPrice,
                    sellPrice: aData.trade_price,
                };
            });

        return result;
    }

    private calculateProfits(data: IBacktest5[]) {
        let sumProfit = 0;

        const result = data.map((aData) => {
            switch (aData.action) {
                case "Trade":
                    const rate =
                        aData.sellPrice && aData.buyPrice
                            ? (aData.sellPrice - aData.buyPrice) /
                              aData.buyPrice
                            : 0;
                    const profit = rate * this.investmentAmount;
                    sumProfit += profit;

                    return {
                        ...aData,
                        rate,
                        profit,
                        sumProfit,
                    };

                default:
                    return {
                        ...aData,
                        buyPrice: null,
                        sellPrice: null,
                        sumProfit,
                    };
            }
        });
        return result;
    }

    private async getRealPrices(data: ICandles5[]) {
        const realprices = [];
        for (const aData of data) {
            const date = aData.candle_date_time_kst;
            const toDate = date.replace("T09:00:00", "T13:00:00+09:00");
            const response = await this.fetchMinutes(
                aData.market,
                "60",
                "1",
                toDate
            );
            const price = response[0].opening_price;

            realprices.push({
                date,
                price,
            });

            await this.delay(100);
        }
        return realprices;
    }

    private async fetchData(market: string, count: string) {
        const searchParams = new URLSearchParams({
            market: market,
            count,
        });

        const response = await fetch(`/fetchCandles?${searchParams}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    private async fetchMinutes(
        market: string,
        unit: string,
        fetchCount: string,
        to: string
    ) {
        const searchParams = new URLSearchParams({
            market: market,
            count: fetchCount,
            unit,
            to,
            // to: "2024-04-28T01:00:00+09:00",
        });

        const response = await fetch(`/fetchCandlesMinutes?${searchParams}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    private delay(duration: number) {
        return new Promise((resolve) => setTimeout(resolve, duration));
    }

    private render(data: IBacktest5[]) {
        this.tableCustomElement.render(data);
        this.overviewCustomElement.redner(data);
    }
}
