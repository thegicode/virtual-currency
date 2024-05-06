/**
 * 나의 백테스트
 * 5일봉 가격 변동에 따라 결정
 * 올라가면 매수
 * 내려가면 매도,
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

export default class AppThegiTest2 extends HTMLElement {
    private data: any[];
    private market: string;
    private count: number;
    // private totalInvestmentPrice: number;
    // private marketSize: number;
    private investmentPrice: number;
    private summaryAllPrice: number;
    private allSumSize: number;
    private countElement: HTMLInputElement;
    private selectElement: HTMLSelectElement;
    private formElement: HTMLFormElement;

    constructor() {
        super();

        this.data = [];
        this.market = "KRW-SBD";
        this.count = 100;
        // this.marketSize = 5;
        // this.totalInvestmentPrice = 100000;
        this.investmentPrice = 50000;
        this.summaryAllPrice = 0;
        this.allSumSize = 0;

        this.countElement = this.querySelector(
            "input[name=count]"
        ) as HTMLInputElement;
        this.selectElement = this.querySelector("select") as HTMLSelectElement;
        this.formElement = this.querySelector("form") as HTMLFormElement;

        this.onChangeMarket = this.onChangeMarket.bind(this);
        this.onOptionSubmit = this.onOptionSubmit.bind(this);
    }

    connectedCallback() {
        this.initialize();
        this.loadAndRender();

        this.selectElement.addEventListener("change", this.onChangeMarket);
        this.formElement.addEventListener("submit", this.onOptionSubmit);
    }

    disconnectedCallback() {
        this.selectElement.removeEventListener("change", this.onChangeMarket);
        this.formElement.removeEventListener("submit", this.onOptionSubmit);
    }

    private initialize() {
        this.countElement.value = this.count.toString();
        (this.querySelector(".investmentPrice") as HTMLElement).textContent =
            this.investmentPrice.toLocaleString();
    }

    async loadAndRender() {
        const originData = await this.getCandles();
        // this.calculateMovingAverage(originData); // 5일 이동평균선
        this.data = this.checkCondition(originData);
        // this.setTradingAction();
        // this.setVolatility();
        // this.order();
        // this.setProfit();
        this.render();
        this.renderSummary();
    }

    // private calculateMovingAverage(data: any) {
    //     this.data = setMovingAverage(data, 5);
    // }

    private checkCondition(data: ICandles5[]) {
        let buyPrice = 0;
        let amount = 0;
        let rate = 0;
        let quantity = 0;
        let sellPrice = 0;
        let profit = 0;
        let sumProfit = 0;
        let action = "";

        const newData = data.map((aData, index) => {
            if (buyPrice === 0) {
                amount = this.investmentPrice;
                action = "Buy";
                buyPrice = aData.opening_price;
                quantity = amount / aData.opening_price;
            } else {
                // rate = (aData.opening_price - buyPrice) / buyPrice;
                // const highRate = rate;
                // const lowRate = rate;

                const highRate = (aData.high_price - buyPrice) / buyPrice;
                const lowRate = (aData.low_price - buyPrice) / buyPrice;

                if (lowRate <= -0.2) {
                    action = "AddBuy";
                    const thisQuantity = amount / aData.opening_price;
                    const newquantity = quantity + thisQuantity;
                    buyPrice =
                        (buyPrice * quantity +
                            aData.opening_price * thisQuantity) /
                        newquantity;
                    quantity = newquantity;
                    amount = amount * 2;
                    rate = lowRate;
                } else if (highRate >= 0.1) {
                    action = "Sell";
                    sellPrice = aData.opening_price;
                    profit = highRate * amount;
                    sumProfit += profit;

                    buyPrice = 0;
                    rate = highRate;
                } else {
                    action = "Hold";
                }
            }

            return {
                date: aData.candle_date_time_kst,
                opening_price: aData.opening_price,
                action,
                buyPrice,
                sellPrice,
                rate,
                amount,
                profit,
                sumProfit,
            };
        });

        return newData;
    }

    private setTradingAction() {
        this.data = this.data.map((aData, index) => {
            let tradingAction = "";

            if (index === 0) {
                tradingAction = aData.condition ? "Buy" : "Reserve";
            } else {
                const prevCondition = this.data[index - 1].condition;
                if (prevCondition !== aData.condition) {
                    tradingAction = aData.condition ? "Buy" : "Sell";
                } else {
                    tradingAction = aData.condition ? "Hold" : "Reserve";
                }
            }

            return {
                ...aData,
                tradingAction,
            };
        });
    }

    private setProfit() {
        let buyTradePrice = 0;
        let profit = 0;
        let rate = 0;

        let unrealize_rate = 0;
        let unrealize_profit = 0;
        let unrealize_gain = 0;

        let sumProfit = 0;
        let sumPrice = 0;

        const getRate = (aData: ICandles) =>
            (aData.trade_price - buyTradePrice) / buyTradePrice;
        const getProfit = (aData: ICandles) => getRate(aData) * getSumPrice();
        const getSumPrice = () => sumPrice || this.investmentPrice;

        this.data = this.data.map((aData, index) => {
            switch (aData.tradingAction) {
                case "Buy":
                    buyTradePrice = aData.trade_price;
                    profit = 0;
                    rate = 0;

                    sumPrice = getSumPrice();

                    unrealize_rate = 0;
                    unrealize_profit = 0;
                    unrealize_gain = sumPrice;

                    break;
                case "Sell":
                    rate = getRate(aData);
                    profit = getProfit(aData);

                    sumProfit += profit;
                    sumPrice = this.investmentPrice + sumProfit;

                    unrealize_rate = rate;
                    unrealize_profit = profit;
                    unrealize_gain = sumPrice;

                    break;
                case "Hold":
                    unrealize_rate = getRate(aData);
                    unrealize_profit = getProfit(aData);
                    unrealize_gain = sumPrice + getProfit(aData);

                    break;
                case "Reserve":
                    profit = 0;
                    rate = 0;
                    sumPrice = getSumPrice();
                    unrealize_rate = 0;
                    unrealize_profit = 0;
                    unrealize_gain = sumPrice;
                    break;
            }

            return {
                ...aData,
                unrealize_rate: Number((unrealize_rate * 100).toFixed(2)),
                unrealize_profit: Math.round(unrealize_profit) || 0,
                unrealize_gain: Math.round(unrealize_gain) || 0,
                rate: rate * 100,
                profit,
                sumProfit: Number(sumProfit.toFixed(2)),
                sumPrice: Number(sumPrice.toFixed(2)),
            };
        });
    }

    private async getCandles() {
        const searchParams = new URLSearchParams({
            market: this.market,
            count: this.count.toString(),
        });

        const response = await fetch(`/fetchCandles?${searchParams}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    private render() {
        const tableElement = this.querySelector("tbody") as HTMLElement;

        tableElement.innerHTML = "";
        const fragment = new DocumentFragment();

        this.data
            .map((aData: ICandles2, index) => this.createItem(aData, index))
            .forEach((cloned: HTMLElement) => fragment.appendChild(cloned));

        tableElement?.appendChild(fragment);
    }

    private createItem(aData: any, index: number) {
        const tpElement = document.querySelector(
            "#tp-item"
        ) as HTMLTemplateElement;
        tpElement;

        const cloned = cloneTemplate<HTMLElement>(tpElement);

        const parseData = {
            index,
            candle_date_time_kst: aData.date,
            opening_price: aData.opening_price.toLocaleString(),
            action: aData.action,
            buyPrice:
                aData.action === "Hold" || aData.action === "Sell"
                    ? ""
                    : Math.round(aData.buyPrice).toLocaleString(),
            sellPrice:
                aData.action === "Sell" ? aData.sellPrice.toLocaleString() : "",
            rate:
                aData.action === "Sell"
                    ? aData.rate && (aData.rate * 100).toFixed(2)
                    : "",
            amount:
                aData.action === "Buy" || aData.action === "AddBuy"
                    ? aData.amount && aData.amount.toLocaleString()
                    : "",
            profit:
                aData.action === "Sell"
                    ? aData.profit && Math.round(aData.profit).toLocaleString()
                    : "",
            sumProfit:
                aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
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

        const lastData = this.data[this.data.length - 1];
        const lastProfit = lastData.sumProfit;
        if (lastProfit === undefined) return;

        const totalRate = (lastProfit / this.investmentPrice) * 100;
        const unrealizeAllRate =
            lastData.unrealize_gain &&
            ((lastData.unrealize_gain - this.investmentPrice) /
                this.investmentPrice) *
                100;
        const lastRate = (lastData.sumProfit / this.investmentPrice) * 100;

        const summaryData = {
            market: this.market,
            period: this.count,
            totalRate: `${totalRate.toFixed(2)} %`,
            lastProfit: ` ${Math.round(lastProfit).toLocaleString()} 원`,
            unrealizeAllRate: `${lastRate.toFixed(2)} %`,
        };

        updateElementsTextWithData(summaryData, cloned);

        summaryListElement.appendChild(cloned);

        // summary-all
        this.summaryAllPrice += lastProfit;
        this.allSumSize++;

        this.renderAllSum();

        // delete

        deleteButton.addEventListener("click", () => {
            cloned.remove();
            this.summaryAllPrice -= lastProfit;
            this.allSumSize--;

            this.renderAllSum();
        });
    }

    private renderAllSum() {
        const summaryAllElement = this.querySelector(
            ".summary-all"
        ) as HTMLElement;

        const summaryAllRate =
            (this.summaryAllPrice / (this.allSumSize * this.investmentPrice)) *
                100 || 0;
        const allSumData = {
            summaryAllPrice: Math.round(this.summaryAllPrice).toLocaleString(),
            summaryAllRate: summaryAllRate.toFixed(2).toLocaleString(),
        };

        updateElementsTextWithData(allSumData, summaryAllElement);
    }

    private onChangeMarket(event: Event) {
        const target = event.target as HTMLInputElement;
        this.market = target.value;
        this.loadAndRender();
    }

    private onOptionSubmit(event: Event) {
        event?.preventDefault();
        const maxSize = Number(this.countElement.getAttribute("max"));

        this.count =
            Number(this.countElement.value) > maxSize
                ? maxSize
                : Number(this.countElement.value);

        this.countElement.value = this.count.toString();

        this.loadAndRender();
    }
}
