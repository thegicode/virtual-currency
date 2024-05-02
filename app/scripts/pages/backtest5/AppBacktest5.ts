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
 */

import Control from "./Control";
import Overview from "./Overview";
import Table from "./Table";

import { getDaliyVolatility } from "@app/scripts/components/backtest/volatility";
import {
    BuyStrategy,
    HoldStrategy,
    ReserveStrategy,
    SellStrategy,
} from "./TradeStrategy";

export default class AppBacktest5 extends HTMLElement {
    public tradeData: any[];
    public markets: string[];
    public market: string;
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
        // this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
        this.markets = ["KRW-NEAR"];
        this.market = this.markets[0];
        this.count = 60;
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
            } catch (error) {
                console.error("Error in runBackTest:", error);
                // 에러 처리 로직 추가 (예: 에러 발생시 재시도 또는 로그 저장 등)
            }
        }
    }

    private backtest(fetchedData: ICandles5[], orginRealPrices: any) {
        const data = fetchedData.slice(1);
        const realPrices = orginRealPrices.slice(1);
        let sumProfit = 0;
        let action = "";

        const result = data.map((aData: ICandles5, index: number) => {
            // 1. 전날 하루만에 움직인 최대폭
            const prevData = fetchedData[index];
            const range = prevData.high_price - prevData.low_price;

            // 2. 매수 기준
            // 실시간 가격 > 당일 시가 + (레인지 * k)
            const realPrice = realPrices[index].price;
            const standardPrice = aData.opening_price + range * this.k;
            const buyCondition = realPrice > standardPrice;

            // action
            if (index === 0) {
                action = buyCondition ? "Buy" : "Reserve";
            } else {
                // const prevCondition =
            }

            debugger;

            // 3. 매수, 매도 가격
            // const buyPrice = aData.opening_price; //

            //  매수 가격(시가): realPrice
            const buyPrice = realPrice;

            // 매도 가격(종가)
            const sellPrice = aData.trade_price;

            // 4. 수익
            const rate = !buyCondition ? (sellPrice - buyPrice) / buyPrice : 0;
            const profit = !buyCondition ? rate * this.investmentAmount : 0;

            // 5. 누적 수익
            sumProfit += profit;

            return {
                market: aData.market,
                date: aData.candle_date_time_kst,
                range,
                buyCondition,
                action,
                standardPrice,
                buyPrice: buyCondition ? buyPrice : 0,
                sellPrice: !buyCondition ? sellPrice : 0,
                rate,
                profit,
                sumProfit,
            };
        });
        // console.log(strategedData);

        return result;
    }

    // private strategy(
    //     index: number,
    //     aData: ICandles5,
    //     fetchData: ICandles5[],
    //     realPrices: any
    // ) {
    //     // 1. 전날 하루만에 움직인 최대폭
    //     const prevData = fetchedData[index];
    //     const range = prevData.high_price - prevData.low_price;

    //     // 2. 매수 기준
    //     // 실시간 가격 > 당일 시가 + (레인지 * k)
    //     const realPrice = realPrices[index].price;
    //     const standardPrice = aData.opening_price + range * this.k;
    //     const buyCondition = realPrice > standardPrice;
    // }

    private async getRealPrices(data: ICandles5[]) {
        const realprices = [];
        for (const aData of data) {
            const date = aData.candle_date_time_kst;
            const toDate = date.replace("T09:00:00", "T13:00:00+09:00");
            const response = await this.fetchMinutes("60", "1", toDate);
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

    private async fetchMinutes(unit: string, fetchCount: string, to: string) {
        const searchParams = new URLSearchParams({
            market: this.market,
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
    }
}
