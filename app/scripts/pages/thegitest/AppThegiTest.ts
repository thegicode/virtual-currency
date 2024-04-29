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

export default class AppThegiTest extends HTMLElement {
    private data: ICandles2[];
    private market: string;
    private count: number;
    private totalInvestmentPrice: number;
    private marketSize: number;
    private investmentPrice: number;
    private summaryAllPrice: number;
    private allSumSize: number;
    private countElement: HTMLInputElement;
    private selectElement: HTMLSelectElement;
    private formElement: HTMLFormElement;

    constructor() {
        super();

        this.data = [];
        this.market = "KRW-NEAR";
        this.count = 200;
        this.marketSize = 5;
        this.totalInvestmentPrice = 1000000;
        this.investmentPrice = this.totalInvestmentPrice / this.marketSize;
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
        this.calculateMovingAverage(originData); // 5일 이동평균선
        this.checkCondition();
        this.setTradingAction();
        // this.setVolatility();
        // this.order();
        this.setProfit();
        this.render();
        this.renderSummary();
    }

    private calculateMovingAverage(data: any) {
        this.data = setMovingAverage(data, 5);
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

    private checkCondition() {
        this.data = this.data.map((aData, index) => {
            if (
                (this.data[index - 1] &&
                    this.data[index - 1].moving_average_5 === undefined) ||
                this.data[index].moving_average_5 === undefined
            ) {
                aData.condition = false;
            } else {
                const distance =
                    this.data[index].moving_average_5 -
                    this.data[index - 1].moving_average_5;
                aData.condition = distance >= 0 ? true : false;
            }

            if (
                this.data[index - 1] &&
                this.data[index] &&
                this.data[index - 1].moving_average_5 &&
                this.data[index].moving_average_5
            ) {
                console.log(
                    index,
                    this.data[index - 1].moving_average_5,
                    this.data[index].moving_average_5,
                    this.data[index].moving_average_5 -
                        this.data[index - 1].moving_average_5,
                    this.data[index].moving_average_5 >
                        this.data[index - 1].moving_average_5
                );
            }
            return { ...aData };
        });
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

    private render() {
        const tableElement = this.querySelector("tbody") as HTMLElement;

        tableElement.innerHTML = "";
        const fragment = new DocumentFragment();

        this.data
            .map((aData: ICandles2, index) => this.createItem(aData, index))
            .forEach((cloned: HTMLElement) => fragment.appendChild(cloned));

        tableElement?.appendChild(fragment);
    }

    private createItem(aData: ICandles2, index: number) {
        const tpElement = document.querySelector(
            "#tp-item"
        ) as HTMLTemplateElement;
        tpElement;

        const cloned = cloneTemplate<HTMLElement>(tpElement);
        // if (!aData.moving_average_5) return cloned;

        const parseData = {
            // ...aData,
            index,
            candle_date_time_kst: aData.candle_date_time_kst.replace("T", " "),
            opening_price: aData.opening_price.toLocaleString(),
            trade_price: aData.trade_price.toLocaleString(),

            moving_average_5:
                (aData.moving_average_5 &&
                    aData.moving_average_5.toLocaleString()) ||
                "",

            condition: aData.condition,
            tradingAction: aData.tradingAction,

            // order_price:
            //     (aData.order_price && aData.order_price.toLocaleString()) || "",

            unrealize_rate: aData.unrealize_rate,
            unrealize_profit: aData.unrealize_profit?.toLocaleString(),
            unrealize_gain: aData.unrealize_gain?.toLocaleString(),

            profit: aData.profit && Math.round(aData.profit).toLocaleString(),
            rate: aData.rate && aData.rate.toFixed(2),
            sumProfit:
                aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
            sumPrice:
                aData.sumPrice && Math.round(aData.sumPrice).toLocaleString(),
        };

        updateElementsTextWithData(parseData, cloned);

        cloned.dataset.action = aData.tradingAction;

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

        const summaryData = {
            market: this.market,
            period: this.count,
            totalRate: `${totalRate.toFixed(2)} %`,
            lastProfit: ` ${Math.round(lastProfit).toLocaleString()} 원`,
            unrealizeAllRate: `${
                unrealizeAllRate && unrealizeAllRate.toFixed(2)
            } %`,
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
