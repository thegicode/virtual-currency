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

import { setMovingAverage } from "@app/scripts/components/backtest/movingAverage";
import {
    getDaliyVolatility,
    getVolatility,
} from "@app/scripts/components/backtest/volatility";
import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";

export default class AppBacktest4 extends HTMLElement {
    private data: ICandlesMinutes[];
    private tradeData: any[];
    private market: string;
    private size: number;
    private totalInvestmentPrice: number;
    private marketSize: number;
    private investmentPrice: number;
    private sumProfit: number;
    private summaryAllPrice: number;
    private allSumSize: number;
    private target: number;
    private sizeElement: HTMLInputElement;
    private tableElement: HTMLElement;
    private itemTempleteElement: HTMLTemplateElement;
    private selectElement: HTMLSelectElement;
    private formElement: HTMLFormElement;

    constructor() {
        super();

        this.data = [];
        this.tradeData = [];
        this.market = "KRW-BTC";
        this.size = 30;
        this.marketSize = 5;
        this.totalInvestmentPrice = 1000000;
        this.investmentPrice = this.totalInvestmentPrice / this.marketSize;
        this.sumProfit = 0;
        this.summaryAllPrice = 0;
        this.allSumSize = 0;
        this.target = 2; // 추천 2

        this.sizeElement = this.querySelector(
            "input[name=count]"
        ) as HTMLInputElement;
        this.tableElement = this.querySelector("tbody") as HTMLElement;
        this.itemTempleteElement = document.querySelector(
            "#tp-item"
        ) as HTMLTemplateElement;

        this.selectElement = this.querySelector("select") as HTMLSelectElement;
        this.formElement = this.querySelector("form") as HTMLFormElement;

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
        this.sizeElement.value = this.size.toString();
        (this.querySelector(".investmentPrice") as HTMLElement).textContent =
            this.investmentPrice.toLocaleString();
    }

    async runBackTest() {
        this.data = [];
        this.tradeData = [];

        for (let index = 0; index < this.size; index++) {
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
        // console.log(this.tradeData);

        this.render();
        this.renderSummary();
        this.renderAllSum();
    }

    private delay(duration: number) {
        return new Promise((resolve) => setTimeout(resolve, duration));
    }

    private async fetchData(unit: string, count: string, to: string) {
        const searchParams = new URLSearchParams({
            market: this.market,
            count,
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
        now.setDate(now.getDate() - this.size + index);
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

    private renderSummary() {
        if (this.data.length === 0) return;

        const tpElement = document.querySelector(
            "#tp-summary"
        ) as HTMLTemplateElement;

        const summaryListElement = this.querySelector(
            ".summary-list"
        ) as HTMLElement;

        const cloned = cloneTemplate<HTMLElement>(tpElement);
        const deleteButton = cloned.querySelector(
            ".deleteButton"
        ) as HTMLButtonElement;

        const totalProfit =
            this.tradeData[this.tradeData.length - 1].unrealize_sum;

        const totalRate = (totalProfit / this.investmentPrice) * 100;
        const summaryData = {
            market: this.market,
            period: this.size,
            totalRate: `${totalRate.toFixed(2)}%`,
            totalProfit: ` ${Math.round(totalProfit).toLocaleString()} 원`,
        };

        updateElementsTextWithData(summaryData, cloned);

        summaryListElement.appendChild(cloned);

        // summary-all
        this.summaryAllPrice += totalProfit;
        this.allSumSize++;

        this.renderAllSum();

        // delete

        deleteButton.addEventListener("click", () => {
            cloned.remove();
            this.summaryAllPrice -= totalProfit;
            this.allSumSize--;

            this.renderAllSum();
        });
    }

    private renderAllSum() {
        const summaryAllElement = this.querySelector(
            ".summary-all"
        ) as HTMLElement;

        const unrealizeSum =
            this.tradeData[this.tradeData.length - 1].unrealize_sum;

        const summaryAllRate =
            (this.summaryAllPrice / this.investmentPrice) * 100;

        const allSumData = {
            summaryAllPrice: Math.round(this.summaryAllPrice).toLocaleString(),
            summaryAllRate: summaryAllRate.toFixed(2).toLocaleString(),
        };
        updateElementsTextWithData(allSumData, summaryAllElement);
    }

    private onChangeMarket(event: Event) {
        const target = event.target as HTMLInputElement;
        this.market = target.value;
        this.runBackTest();
    }

    private onOptionSubmit(event: Event) {
        event?.preventDefault();
        const maxSize = Number(this.sizeElement.getAttribute("max"));
        this.size =
            Number(this.sizeElement.value) > maxSize
                ? maxSize
                : Number(this.sizeElement.value);
        this.sizeElement.value = this.size.toString();
        this.runBackTest();
    }
}
