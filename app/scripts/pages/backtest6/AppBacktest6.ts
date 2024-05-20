/**
 * 투자전략 6 : 다자 가상화폐 + 상승장 + 변동성 돌파
 * 투자대상 : 아무 가상화폐 몇 개 선택
 * 거래비용  : 0.2% 적용
 * 투자전략 :
 *      - 각 화폐의 레인지 계산 (전일 고가 - 저가)
 *      - 각 화폐의 가격이 5일 이동 평균보다 높은지 여부 파악
 *          - 낮을 경우 투자 대상에서 제외
 *      - 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
 *          - 필자들은 k=0.5 추천
 *      - 돌파에 성공한 가상화폐에 자산의 n분의 1 투입
 *          - 이 전략에 2개 화폐를 투입한다면 자산의 2분의 1 투입
 * 매도 : 다음날 시가
 *
 * 여기서는 날짜 기준이 아닌 코인 별로 적용
 */

import { setMovingAverage } from "@app/scripts/components/backtest/movingAverage";
import { volatilityBreakout } from "@app/scripts/components/backtest/volatility";
import Control from "./Control";
import Overview from "./Overview";
import Table from "./Table";

export default class AppBacktest6 extends HTMLElement {
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

        // this.markets = ["KRW-BTC", "KRW-ETH", "KRW-DOGE", "KRW-SBD", "KRW-XRP"];
        this.markets = ["KRW-NEAR", "KRW-LOOM", "KRW-TRX", "KRW-EOS"];

        this.count = 30;
        this.totalInvestmentAmount = 1000000;
        this.investmentAmount =
            this.totalInvestmentAmount / this.markets.length;
        this.k = 0.3; // 추천 0.5

        this.overviewCustomElement = this.querySelector(
            "backtest-overview"
        ) as Overview;
        this.controlCustomElement = this.querySelector(
            "backtest-control"
        ) as Control;
        this.tableCustomElement = this.querySelector("backtest-table") as Table;
    }

    async connectedCallback() {
        // 각 화폐의 가격이 5일 이동 평균보다 높은 코인
        // const markets = await this.checkMovingAverage();
        // if (markets.length === 0) return;
        this.runBackTest();
    }

    // private async checkMovingAverage() {
    //     let obj: any = {};

    //     const promises = this.markets.map(async (aMarket) => {
    //         // market 별로 현재 기준 5개의 데이터 받아오기
    //         const data = await this.fetchData(aMarket, "5");

    //         // 각 화폐의 가격이 5일 이동 평균보다 높은지 여부 파악
    //         const avergaeData = setMovingAverage(data);
    //         const isOver = avergaeData
    //             .slice(4)
    //             .map((aData) => aData.trade_price > aData.moving_average_5)[0];
    //         obj[aMarket] = isOver;
    //     });
    //     await Promise.all(promises);

    //     return Object.keys(obj).filter((key) => obj[key] === true);
    // }

    public async runBackTest() {
        for (const market of this.markets) {
            console.log(market);

            try {
                const data = await this.fetchData(
                    market,
                    (this.count + 4).toString()
                );

                const realprices = await this.getRealPrices(data);

                const result = this.backtest(data, realprices);

                this.render(result, this.markets.indexOf(market));
            } catch (error) {
                console.error("Error in runBackTest:", error);
                // 에러 처리 로직 추가 (예: 에러 발생시 재시도 또는 로그 저장 등)
            }
        }
    }

    private backtest(fetchedData: ICandles5[], orginRealPrices: IRealPrice[]) {
        const realPrices = orginRealPrices.slice(4);
        const avereagedData = setMovingAverage(fetchedData);
        const strategedData = this.strategy(avereagedData, realPrices);
        const calculatedData = this.calculateProfits(strategedData);
        return calculatedData;
    }

    private strategy(fetchedData: ICandles5[], realPrices: IRealPrice[]) {
        const result = fetchedData
            .slice(4)
            .map((aData: ICandles5, index: number) => {
                // 5일 이동 평균선보다 높은지
                const isAverageOver = aData.moving_average_5
                    ? aData.trade_price > aData.moving_average_5
                    : null;

                // 실시간 가격 > 당일 시가 + (레인지 * k)
                const prevData = fetchedData[index + 3];
                const realPrice = realPrices[index].price;

                const { range, standardPrice, buyCondition } =
                    volatilityBreakout(
                        prevData,
                        realPrice,
                        aData.opening_price,
                        this.k
                    );

                return {
                    market: aData.market,
                    date: aData.candle_date_time_kst,
                    range,
                    standardPrice,
                    buyCondition: Boolean(isAverageOver && buyCondition),
                    action: isAverageOver && buyCondition ? "Trade" : "Reserve",
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

    private render(data: IBacktest5[], index: number) {
        this.controlCustomElement.render();
        this.overviewCustomElement.redner(data);
        this.tableCustomElement.render(data, index);
    }

    public initialize() {
        this.controlCustomElement.initialize();
        this.overviewCustomElement.initialize();
        this.tableCustomElement.initialize();
    }
}
