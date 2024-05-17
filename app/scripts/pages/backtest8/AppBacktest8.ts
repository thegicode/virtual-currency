/**
 * 투자전략 8 : 4개 이동평균 상승장 + 변동성 돌파 + 변동성 조절
 * 투자대상 : 아무 가상화폐 몇 개 선택
 * 거래비용  : 0.2% 적용
 * 투자전략 :
 *      - 각 화폐의 레인지 계산 (전일 고가 - 저가)
 *      - 각 화폐의 가격이 3, 5, 10, 20일 이동 평균보다 높은지 여부 파악
 *          - 낮을 경우 투자 대상에서 제외
 *      - 매수 : 실시간 가격 > 당일 시가 + (레인지 * k)
 *          - 필자들은 k=0.5 추천
 *      - 자금관리 : 가상화폐별 투입 금액은 (타깃 변동성 / 전일 변동성)/투자 대상 가상화폐 수
 * 매도 : 다음날 시가
 *
 *
 * 책에서는 자정에 거래하였으나 업비트는 일봉이 9시 기준으로 온다.
 * 그래서 9시 기준으로 작업
 * 데이터 사용 시간
 * 일봉 : 오전 9시 데이터
 * 실시간 가격 : 분봉 오전 10시
 * 매도 : 다음날 일봉 오전 9시
 */

import { applyStandardMovingAverages } from "@app/scripts/components/backtest/movingAverage";
import { volatilityBreakout } from "@app/scripts/components/backtest/volatility";
import Control from "./Control";
import Overview from "./Overview";
import Table from "./Table";

export default class AppBacktest8 extends HTMLElement {
    public markets: string[];
    public count: number;
    public totalInvestmentAmount: number;
    public investmentAmount: number;
    public k: number;
    private targetRate: number;
    public tradeCount: number;
    public controlIndex: number;

    private overviewCustomElement: Overview;
    private controlCustomElement: Control;
    private tableCustomElement: Table;

    constructor() {
        super();

        this.markets = [
            "KRW-BTC",
            "KRW-ETH",
            "KRW-DOGE",
            // "KRW-SBD",
            "KRW-XRP",
            // "KRW-CTC",
            // "KRW-GRS",
            // "KRW-SOL",
            // "KRW-BCH",
            "KRW-NEAR",
        ];
        this.count = 30;
        this.totalInvestmentAmount = 1000000;
        this.investmentAmount =
            this.totalInvestmentAmount / this.markets.length;
        this.targetRate = 2; // 목표 변동성
        this.tradeCount = 0; // 거래 횟수
        this.controlIndex = 19; // 데이터 컨트롤 위한 index
        this.k = 0.1; // 추천 0.5

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
                    (this.count + this.controlIndex).toString()
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
        const movingAverageData =
            applyStandardMovingAverages<ICandles5>(fetchedData);

        const strategedData = this.processTradingDecisions(
            movingAverageData,
            orginRealPrices
        );
        const calculatedData = this.calculateProfits(strategedData);
        return calculatedData;
    }

    private processTradingDecisions(
        fetchedData: ICandles5[],
        realPrices: IRealPrice[]
    ) {
        const relevantData = fetchedData.slice(this.controlIndex);
        const result = relevantData.map(
            (candleData: ICandles5, index: number) => {
                // 이동 평균과 현재 가격 비교
                const isOverMovingAverage =
                    this.checkOverMovingAverage(candleData);

                const { previousCandle, nextCandle, currentRealPrice } =
                    this.getProcessData(fetchedData, realPrices, index);

                // 날짜 일치 여부 확인
                this.verifyDataConsistency(candleData, realPrices, index);

                // standardPrice : 돌파 가격 선정 (당일 시가 + (레인지 * k))
                // isBreakout : 실시간 가격 >  standardPrice
                const { range, standardPrice, isBreakout, prevVolatilityRate } =
                    volatilityBreakout(
                        previousCandle,
                        currentRealPrice,
                        candleData.opening_price,
                        this.k
                    );

                const tradeCondition = Boolean(
                    isOverMovingAverage && isBreakout
                );

                // 투자 금액 계산
                const investmentAmount = this.calculateInvestmentAmount(
                    tradeCondition,
                    prevVolatilityRate
                );

                const nextDayOpningPrice = this.getNextDayOpeningPrice(
                    realPrices,
                    index
                );

                // console.log(index, nextCandle, nextCandle.opening_price);

                return {
                    market: candleData.market,
                    date: candleData.candle_date_time_kst,
                    openingPrice: candleData.opening_price,
                    range,
                    standardPrice,
                    buyCondition: tradeCondition,
                    action: tradeCondition ? "Trade" : "Reserve",
                    volatilityRate: prevVolatilityRate,
                    buyPrice: currentRealPrice, // 당일 10시 가격에 매수
                    sellPrice: nextCandle ? nextCandle.opening_price : null, // 다음날 9시 시가에 매도
                    investmentAmount,
                };
            }
        );

        return result;
    }

    private checkOverMovingAverage(candleData: ICandles8) {
        if (
            !candleData.moving_average_3 ||
            !candleData.moving_average_5 ||
            !candleData.moving_average_10 ||
            !candleData.moving_average_20
        )
            return null;

        const result =
            candleData.trade_price > candleData.moving_average_3 &&
            candleData.trade_price > candleData.moving_average_5 &&
            candleData.trade_price > candleData.moving_average_10 &&
            candleData.trade_price > candleData.moving_average_20
                ? true
                : false;

        return result;
    }

    private getProcessData(
        fetchedData: ICandles5[],
        realPrices: IRealPrice[],
        index: number
    ) {
        const previousCandle = fetchedData[index + this.controlIndex - 1];
        const nextCandle = fetchedData[index + this.controlIndex + 1];
        const currentRealPrice = realPrices[index + this.controlIndex].price;
        return {
            previousCandle,
            nextCandle,
            currentRealPrice,
        };
    }

    private verifyDataConsistency(
        candleData: ICandles5,
        realPrices: IRealPrice[],
        index: number
    ) {
        if (
            candleData.candle_date_time_kst.slice(0, 10) !==
            realPrices[index + this.controlIndex].date.slice(0, 10)
        ) {
            throw new Error("Data date and real price date mismatch.");
        }
    }

    private calculateInvestmentAmount(
        tradeCondition: boolean,
        prevVolatilityRate: number
    ) {
        // 자금관리 : 가상화폐별 투입 금액은 (타깃 변동성 / 전일 변동성)/투자 대상 가상화폐 수
        if (!tradeCondition) return 0;
        const investmentRatio =
            this.targetRate / prevVolatilityRate / this.markets.length;
        return investmentRatio * this.totalInvestmentAmount;
    }

    private getNextDayOpeningPrice(realPrices: IRealPrice[], index: number) {
        if (!realPrices[index + this.controlIndex + 1]) return null;
        return realPrices[index + this.controlIndex + 1].price;
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
                    const profit = aData.investmentAmount
                        ? rate * aData.investmentAmount
                        : 0;
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