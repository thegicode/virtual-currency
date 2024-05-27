/**
 * 투자전략 4 : 다자 가상화폐 + 전일 오후 상승 시 오전 투자 + 변동성 조절
 * 투자대상 : 아무 가상화폐 몇 개 선택
 * 거래비용  : 0.1% 적용
 *             - 지정가 매수가 양호한 전략이라 거래 비용이 상대적으로 적게 발생
 * 투자전략 :
 *      - 오전 0시에 가상화폐의 전일 오후(12시 ~ 24시) 수익률과 거래량 체크
 *      - 매수: 전일 오후 수익률 > 0, 전일 오후 거래량 > 오전 거래량
 *      - 자금 관리 : 가상화폐별 투입 금액은 (타깃 변동성 / 특정 화폐의 전일 오후 변동성) / 투자대상 화폐수
 *      - 매도 : 정오
 *
 * 재료 : 전일 오후 (12시 ~ 24시) 수익률과
 *       전일 오전 & 오후 거래량
 *
 * 하루 두 번 자정, 정오에 매수하는 전략도 ?
 * 2018년 하락장에서도 이더리움은 수익
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

export default class AppBacktest4 extends HTMLElement {
    public tradeData: any[];
    public market: string;
    public count: number;
    public totalInvestmentPrice: number;
    public marketSize: number;
    public investmentPrice: number;
    public target: number;

    private overviewCustomElement: Overview;
    private controlCustomElement: Control;
    private tableCustomElement: Table;

    constructor() {
        super();

        this.tradeData = [];
        this.market = "";
        this.count = 200;
        this.marketSize = 5;
        this.totalInvestmentPrice = 1000000;
        this.investmentPrice = this.totalInvestmentPrice / this.marketSize;
        this.target = 2; // 추천 2

        this.overviewCustomElement = this.querySelector(
            "backtest-overview"
        ) as Overview;
        this.controlCustomElement = this.querySelector(
            "backtest-control"
        ) as Control;
        this.tableCustomElement = this.querySelector("backtest-table") as Table;
    }

    connectedCallback() {
        this.initialize();
        this.runBackTest();
    }

    // disconnectedCallback() {
    // }

    private initialize() {
        this.controlCustomElement.initialize();
    }

    public async runBackTest() {
        this.reset();

        for (let index = 0; index < this.count; index++) {
            // console.log(index);

            try {
                const tradeData = await this.getTradeData(index);

                this.tradeData.push(tradeData);

                await this.delay(100);
            } catch (error: any) {
                console.error(
                    `Failed to process index ${index}:`,
                    error.message
                );
            }
        }

        this.render();
    }

    private async getTradeData(index: number) {
        const toDate = `${this.getToDate(index)}+09:00`;
        // console.log(toDate);

        const fetchedData = await this.fetchData("60", "37", toDate);

        const { makedData, afternoonData, sellPrice } = this.makeTradeData(
            fetchedData,
            toDate
        );

        const actionedData = this.setTradingAction(makedData, index);

        const volatedData = this.setVolatility(actionedData, afternoonData);

        const enrichedData = this.getStrategy(volatedData, index, sellPrice);

        return enrichedData;
    }

    private reset() {
        this.dataset.loading = "true";
        this.tradeData = [];
    }

    private delay(duration: number) {
        return new Promise((resolve) => setTimeout(resolve, duration));
    }

    private async fetchData(unit: string, fetchCount: string, to: string) {
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

    private getToDate(index: number) {
        const now = new Date();
        now.setMonth(now.getMonth());
        now.setDate(now.getDate() - this.count + index + 1);
        now.setHours(22, 0, 0, 0);
        return now.toISOString().slice(0, 19);
    }

    private makeTradeData(data: ICandlesMinutes[], date: string) {
        const dates = data.map((d) => d.candle_date_time_kst);

        const prevDate = new Date(date);
        prevDate.setUTCDate(prevDate.getUTCDate() - 1);
        const prevDateISOString = prevDate.toISOString().slice(0, 10);

        // prev first index
        const prevFirstIndex = dates.indexOf(prevDateISOString + "T00:00:00"); // It must be 0.

        // prev mid index
        const prevMidIndex = dates.indexOf(prevDateISOString + "T12:00:00"); // It must be 12.

        // prev last index
        const prevLastIndex = dates.indexOf(date.slice(0, 11) + "00:00:00"); // It must be 24.

        const prevDayData = {
            morning: [data[prevFirstIndex], data[prevMidIndex]],
            afternoon: [data[prevMidIndex], data[prevLastIndex]],
        };

        // 오후 수익률
        const startPrice = prevDayData.afternoon[0].trade_price;
        const afternoonRate =
            (prevDayData.afternoon[1].trade_price - startPrice) / startPrice;

        // 전일 오전 거래량
        const moringVolume =
            prevDayData.morning[1].candle_acc_trade_volume -
            prevDayData.morning[0].candle_acc_trade_volume;

        // 전일 오후 거래량
        const afterVolume =
            prevDayData.afternoon[1].candle_acc_trade_volume -
            prevDayData.afternoon[0].candle_acc_trade_volume;

        const condition = afternoonRate > 0 && afterVolume > moringVolume;

        const makedData = {
            date: date.slice(0, 10),
            condition,
            trade_price: data[prevLastIndex].trade_price,
        };

        return {
            makedData,
            afternoonData: this.getAfternoonData(data.slice(12)),
            sellPrice: data[data.length - 1].trade_price,
        };
    }

    private getAfternoonData(data: ICandlesMinutes[]) {
        const highPrices = data.map((d) => d.high_price);
        const lowPrices = data.map((d) => d.low_price);

        return {
            high_price: Math.max(...highPrices),
            low_price: Math.min(...lowPrices),
            opening_price: data[0].opening_price,
        };
    }

    private setTradingAction(aData: ITradeData4, index: number) {
        let action = "";
        if (index === 0) {
            action = aData.condition ? "Buy" : "Reserve";
        } else {
            if (this.tradeData[index - 1].condition === aData.condition) {
                action = aData.condition ? "Hold" : "Reserve";
            } else {
                action = aData.condition ? "Buy" : "Sell";
            }
        }

        return {
            ...JSON.parse(JSON.stringify(aData)),
            action,
        };
    }

    // 특정 화폐의 전일 오후 변동성
    private setVolatility(data: ITradeData4, afternoonData: IAfternoonData) {
        return {
            ...JSON.parse(JSON.stringify(data)),
            volatility: getDaliyVolatility(afternoonData),
        };
    }

    private getStrategy(data: ITradeData4, index: number, sellPrice: number) {
        const result = this.tradeStrategy(data, index, sellPrice);

        return {
            ...data,
            buy_index: result.buy_index,
            order_amount: (data.action === "Buy" && result.orderAmount) || "",
            rate: result.rate,
            profit: result.profit,
            sum_profit: result.sum_profit,
            unrealize_rate: result.unrealize_rate,
            unrealize_profit: result.unrealize_profit,
            unrealize_sum: result.unrealize_sum,
        };
    }

    private tradeStrategy(data: ITradeData4, index: number, sellPrice: number) {
        switch (data.action) {
            case "Buy":
                return new BuyStrategy(this, data, index);
            case "Hold":
                return new HoldStrategy(this, data, index);
            case "Sell":
                return new SellStrategy(this, data, index, sellPrice);
            case "Reserve":
                return new ReserveStrategy(this, data, index);
            default:
                throw new Error(`알 수 없는 장르: ${data.action}`);
        }
    }

    private render() {
        this.tableCustomElement.render();

        this.overviewCustomElement.redner();

        this.dataset.loading = "false";
    }
}
