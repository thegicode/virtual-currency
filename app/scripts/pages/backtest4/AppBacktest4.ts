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
 */

import { getDaliyVolatility } from "@app/scripts/components/backtest/volatility";
import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";
import Overview from "./Overview";

export default class AppBacktest4 extends HTMLElement {
    private data: ICandlesMinutes[];
    public tradeData: any[];
    public market: string;
    public count: number;
    private totalInvestmentPrice: number;
    private marketSize: number;
    public investmentPrice: number;
    private target: number;

    private countElement: HTMLInputElement;
    private tableElement: HTMLElement;
    private itemTempleteElement: HTMLTemplateElement;
    private selectElement: HTMLSelectElement;
    private formElement: HTMLFormElement;

    private overviewCustomElement: Overview;

    constructor() {
        super();

        this.data = [];
        this.tradeData = [];
        this.market = "KRW-ONG";
        this.count = 30;
        this.marketSize = 5;
        this.totalInvestmentPrice = 1000000;
        this.investmentPrice = this.totalInvestmentPrice / this.marketSize;
        this.target = 2; // 추천 2

        this.countElement = this.querySelector(
            "input[name=count]"
        ) as HTMLInputElement;
        this.tableElement = this.querySelector("tbody") as HTMLElement;
        this.itemTempleteElement = document.querySelector(
            "#tp-item"
        ) as HTMLTemplateElement;

        this.selectElement = this.querySelector("select") as HTMLSelectElement;
        this.formElement = this.querySelector("form") as HTMLFormElement;

        this.overviewCustomElement = this.querySelector(
            "backtest-overview"
        ) as Overview;

        this.onChangeMarket = this.onChangeMarket.bind(this);
        this.onOptionSubmit = this.onOptionSubmit.bind(this);
    }

    connectedCallback() {
        this.initialize();

        this.runBackTest();

        this.selectElement.addEventListener("change", this.onChangeMarket);
        this.formElement.addEventListener("submit", this.onOptionSubmit);
    }

    disconnectedCallback() {
        this.selectElement.removeEventListener("change", this.onChangeMarket);
        this.formElement.removeEventListener("submit", this.onOptionSubmit);
    }

    private initialize() {
        const investmentPriceElement = this.querySelector(
            ".investmentPrice"
        ) as HTMLElement;

        this.countElement.value = this.count.toString();
        investmentPriceElement.textContent =
            this.investmentPrice.toLocaleString();
    }

    async runBackTest() {
        this.dataset.loading = "true";
        this.data = [];
        this.tradeData = [];

        for (let index = 0; index < this.count; index++) {
            console.log(index);

            try {
                const toDate = `${this.getToDate(index)}+09:00`;
                const fetchedData = await this.fetchData("60", "37", toDate);

                this.data.push(fetchedData);

                const makedData = this.makeTradeData(fetchedData);

                const actionedData = this.setTradingAction(makedData, index);

                const volatedData = this.setVolatility(actionedData);

                const orderedData = this.order(volatedData);

                const profitedData = this.setProfit(orderedData, index);

                this.tradeData.push(profitedData);

                await this.delay(90);
            } catch (error: any) {
                console.error(
                    `Failed to process index ${index}:`,
                    error.message
                );
            }
        }

        this.render();

        this.overviewCustomElement.redner(this);

        this.dataset.loading = "false";
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
        now.setDate(now.getDate() - this.count + index);
        now.setHours(22, 0, 0, 0);
        return now.toISOString().slice(0, 19);
    }

    private makeTradeData(data: ICandlesMinutes[]) {
        const lastData = data[24];
        const date = lastData.candle_date_time_kst.slice(0, 10);

        const prevDayData = {
            morning: [data[0], data[12]],
            afternoon: [data[12], lastData],
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

        const afternoonData = this.getAfternoonData(data.slice(12));

        return {
            date,
            condition,
            afternoonData,
            trade_price: lastData.trade_price,
            trade_sell_date: data[data.length - 1],
        };
    }

    getAfternoonData(data: ICandlesMinutes[]) {
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

    private setVolatility(data: ITradeData4) {
        // 특정 화폐의 전일 오후 변동성
        return {
            ...JSON.parse(JSON.stringify(data)),
            volatility: getDaliyVolatility(data.afternoonData),
        };
    }

    private order(data: ITradeData4) {
        const parseData = JSON.parse(JSON.stringify(data));

        if (!data.volatility) return parseData;

        if (data.action === "Buy") {
            const percent = (this.target / data.volatility) * 100;
            const unitPercent = percent / this.marketSize;
            const orderAmount = (this.totalInvestmentPrice * unitPercent) / 100;
            return {
                ...parseData,
                order_amount: Math.round(orderAmount),
            };
        }

        return parseData;
    }

    private setProfit(data: ITradeData4, index: number) {
        const aData = JSON.parse(JSON.stringify(data));
        const prevTradeData = index > 0 && this.tradeData[index - 1];
        const buyData = index > 0 && this.tradeData[prevTradeData.buy_index];

        switch (aData.action) {
            case "Buy":
                return {
                    ...aData,
                    buy_index: index,
                    sumProfit: prevTradeData.sumProfit || 0,
                    unrealize_sum: prevTradeData.unrealize_sum || 0,
                };
            case "Hold":
                const unrealize_rate =
                    (aData.trade_price - buyData.trade_price) /
                    buyData.trade_price;
                const unrealize_profit = unrealize_rate * buyData.order_amount;

                return {
                    ...aData,
                    buy_index: prevTradeData.buy_index,
                    sumProfit: prevTradeData.sumProfit || 0,
                    unrealize_rate,
                    unrealize_profit,
                    unrealize_sum:
                        prevTradeData.unrealize_sum + unrealize_profit,
                };
            case "Sell":
                const rate =
                    (aData.trade_sell_date.trade_price - buyData.trade_price) /
                    buyData.trade_price;
                const profit = rate * buyData.order_amount;
                const sumProfit = prevTradeData.sumProfit + profit;
                return {
                    ...aData,
                    rate,
                    profit,
                    sumProfit: sumProfit,
                    unrealize_sum: sumProfit,
                };

            case "Reserve": {
                return {
                    ...aData,
                    sumProfit: prevTradeData.sumProfit || 0,
                    unrealize_sum: prevTradeData.unrealize_sum || 0,
                };
            }
        }
    }

    private render() {
        this.tableElement.innerHTML = "";
        const fragment = new DocumentFragment();

        this.tradeData
            .map((aData: ITradeData4, index) => this.createItem(aData, index))
            .forEach((cloned: HTMLElement) => fragment.appendChild(cloned));

        this.tableElement.appendChild(fragment);
    }

    private createItem(aData: ITradeData4, index: number) {
        const cloned = cloneTemplate<HTMLElement>(this.itemTempleteElement);

        const parseData = {
            index,
            date: aData.date,
            trade_price: aData.trade_price.toLocaleString(),
            condition: aData.condition.toString(),
            action: aData.action,
            volatility: aData.volatility?.toFixed(2),
            order_amount: aData.order_amount?.toLocaleString() || "",
            rate: (aData.rate && aData.rate * 100)?.toFixed(2) || "",
            profit:
                (aData.profit && Math.round(aData.profit).toLocaleString()) ||
                "",
            sumProfit:
                aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
            unrealize_rate:
                (aData.unrealize_rate &&
                    (aData.unrealize_rate * 100).toFixed(2)) ||
                "",
            unrealize_profit:
                (aData.unrealize_profit &&
                    Math.round(aData.unrealize_profit).toLocaleString()) ||
                "",
            unrealize_sum:
                aData.unrealize_sum &&
                Math.round(aData.unrealize_sum).toLocaleString(),
        };

        updateElementsTextWithData(parseData, cloned);

        cloned.dataset.action = aData.action;

        return cloned;
    }

    private onChangeMarket(event: Event) {
        const target = event.target as HTMLInputElement;
        this.market = target.value;
        this.runBackTest();
    }

    private onOptionSubmit(event: Event) {
        event?.preventDefault();
        const maxSize = Number(this.countElement.getAttribute("max"));
        this.count =
            Number(this.countElement.value) > maxSize
                ? maxSize
                : Number(this.countElement.value);
        this.countElement.value = this.count.toString();
        this.runBackTest();
    }
}
