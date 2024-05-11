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
 *      - 자금관리 : 가상화폐별 투입 금액은 (타깃 변동성 / 전일 변동성)/투자 대상 가상화폐 수
 *      - 전일 병동성 : 전일 고점  - 전일 저점 / 햔제가격)
 * 매도 : 다음날 시가
 *
 *
 * 책에서는 자정에 거래하였으나 업비트는 일봉이 9시 기준으로 온다.
 * 그래서 9시 기준으로 작업
 * 데이터 사용 시간
 * 일봉 : 오전 9시 데이터
 * 실시간 가격 : 분봉 오전 10시
 * 매도 : 다음날 분봉 오전 10시
 */

import { setMovingAverage } from "@app/scripts/components/backtest/movingAverage";
import { volatilityBreakout } from "@app/scripts/components/backtest/volatility";
import Control from "./Control";
import Overview from "./Overview";
import Table from "./Table";

export default class AppBacktest7 extends HTMLElement {
    public markets: string[];
    public count: number;
    public totalInvestmentAmount: number;
    public investmentAmount: number;
    public k: number;
    private targetRate: number;
    public tradeCount: number;

    private overviewCustomElement: Overview;
    private controlCustomElement: Control;
    private tableCustomElement: Table;

    constructor() {
        super();

        this.markets = [
            "KRW-BTC",
            "KRW-ETH",
            "KRW-DOGE",
            "KRW-SBD",
            "KRW-XRP",
            "KRW-CTC",
            "KRW-GRS",
            "KRW-SOL",
            "KRW-BCH",
            "KRW-NEAR",
        ];
        this.count = 60;
        this.totalInvestmentAmount = 10000000;
        this.investmentAmount =
            this.totalInvestmentAmount / this.markets.length;
        this.k = 0.5; // 추천 0.5
        this.targetRate = 2; // 목표 변동성
        this.tradeCount = 0; // 목표 변동성

        this.overviewCustomElement = this.querySelector(
            "backtest-overview"
        ) as Overview;
        this.controlCustomElement = this.querySelector(
            "backtest-control"
        ) as Control;
        this.tableCustomElement = this.querySelector("backtest-table") as Table;
    }

    async connectedCallback() {
        this.runBackTest();
    }

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
        const avereagedData = setMovingAverage(fetchedData);
        const strategedData = this.strategy(avereagedData, orginRealPrices);
        const calculatedData = this.calculateProfits(strategedData);
        return calculatedData;
    }

    private strategy(fetchedData: ICandles5[], realPrices: IRealPrice[]) {
        const dataList = fetchedData.slice(4);
        // const realPriceList = realPrices.slice(4);
        const result = dataList.map((aData: ICandles5, index: number) => {
            // 5일 이동 평균선보다 높은지 체크
            const isAverageOver = aData.moving_average_5
                ? aData.trade_price > aData.moving_average_5
                : null;

            // 돌파 가격 선정 (당일 시가 + (레인지 * k)), standardPrice
            // 실시간 가격 >  돌파가격(당일 시가 + (레인지 * k)), buyCondition
            const prevData = fetchedData[index + 3];
            const realPrice = realPrices[index + 4].price;

            if (
                aData.candle_date_time_kst.slice(0, 10) !==
                realPrices[index + 4].date.slice(0, 10)
            ) {
                console.error("데이터 날짜와 실시가 가격 날짜가 다릅니다.");
            }

            const { range, standardPrice, buyCondition, prevVolatilityRate } =
                volatilityBreakout(
                    prevData,
                    realPrice,
                    aData.opening_price,
                    this.k
                );

            const tradeCondition = Boolean(isAverageOver && buyCondition);

            // 자금관리 : 가상화폐별 투입 금액은 (타깃 변동성 / 전일 변동성)/투자 대상 가상화폐 수
            const buyRate =
                this.targetRate / prevVolatilityRate / this.markets.length;

            const buyAmount = tradeCondition
                ? buyRate * this.totalInvestmentAmount
                : 0;

            const nextDayOpningPrice = realPrices[index + 5]
                ? realPrices[index + 5].price
                : null;

            return {
                market: aData.market,
                date: aData.candle_date_time_kst,
                range,
                standardPrice,
                buyCondition: tradeCondition,
                action: tradeCondition ? "Trade" : "Reserve",
                volatilityRate: prevVolatilityRate,
                buyPrice: realPrice, // 당일 10시 가격에 매수
                sellPrice: nextDayOpningPrice, // 다음날 10시 가격에 매도
                buyAmount,
            };
        });

        return result;
    }

    private calculateProfits(data: IBacktest5[]) {
        let sumProfit = 0;
        let tradeCount = 0;

        const result = data.map((aData) => {
            switch (aData.action) {
                case "Trade":
                    const rate =
                        aData.sellPrice && aData.buyPrice
                            ? (aData.sellPrice - aData.buyPrice) /
                              aData.buyPrice
                            : 0;
                    const profit = aData.buyAmount ? rate * aData.buyAmount : 0;
                    sumProfit += profit;
                    tradeCount++;

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
        // console.log("tradeCount", tradeCount);
        this.tradeCount = tradeCount;
        return result;
    }

    private async getRealPrices(data: ICandles5[]) {
        // 실시간 분봉 시간 : 오전 10시
        const realprices = [];
        for (const aData of data) {
            const date = aData.candle_date_time_kst;
            const toDate = date.replace("T09:00:00", "T11:00:00+09:00");
            const response = await this.fetchMinutes(
                aData.market,
                "60",
                "1",
                toDate
            );
            const price = response[0].opening_price;

            realprices.push({
                date: response[0].candle_date_time_kst,
                price,
            });

            await this.delay(100);
        }
        return realprices;
    }

    private async fetchData(market: string, count: string) {
        // 일봉 데이터 기준 시간 : 오전 9시
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
