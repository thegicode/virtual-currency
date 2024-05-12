/**
 * 투자전략 1 : 이동 평균 + 현금 비중 80% 이상
 * 투자대상 : 아무 가상화폐 몇 개 선택
 * 거래비용  : 0.2% 적용
 * 투자전략 :
 *      - 여러분이 선택한 가상화폐의 5일 이동평균을 1일 1회 체크
 *      - 현재 가격이 이동평균보다 높으면 매수 또는 보유
 *      - 현재 가격이 이동평균보다 낮으면 매도 또는 투자 볼퓨
 *      - 현금 비중은 80% 유지
 * 자금관리 : 가상화폐별 투입 금액은 자산의 20%/가상화퍠 수
 *             (5개의 화폐를 포함할 경우 각 화폐에 자산의 20%/5 = 4% 투자)
 * 
 *
 * 재료 : 전일 오후 (12시 ~ 24시) 수익률과
 *       전일 오전 & 오후 거래량
 *
 * 하루 두 번 자정, 정오에 매수하는 전략도 ?
 * 2018년 하락장에서도 이더리움은 수익


 * TODO
 * 수수료 적용
 * 현금비중 80% 유지
 * 자금관리 : 가상화폐별 투입금액은 자산의 20%/가상화폐 수
 * 거래 횟수 추가
 * 승률 추가
 * 총 투자금 입력
 **/

import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";

export default class AppBacktest extends HTMLElement {
    private data: ICandles[];
    private market: string;
    private period: number;
    private fee: number; // TODO
    private investmentPrice: number;
    private summaryAllPrice: number;
    private allSumSize: number;
    private periodInput: HTMLInputElement;
    private selectElement: HTMLSelectElement;
    private formElement: HTMLFormElement;
    private investmentPriceElement: HTMLElement;

    constructor() {
        super();

        this.data = [];
        this.market = "";
        this.period = 15;
        this.investmentPrice = 200000;
        this.fee = 0.00139;

        this.summaryAllPrice = 0;
        this.allSumSize = 0;

        this.periodInput = this.querySelector(
            "input[name=count]"
        ) as HTMLInputElement;
        this.selectElement = this.querySelector("select") as HTMLSelectElement;
        this.formElement = this.querySelector("form") as HTMLFormElement;
        this.investmentPriceElement = this.querySelector(
            ".investmentPrice"
        ) as HTMLElement;

        this.onChangeMarket = this.onChangeMarket.bind(this);
        this.onOptionSubmit = this.onOptionSubmit.bind(this);
    }

    connectedCallback() {
        this.initialize();
        this.loadAndRender();

        this.selectElement.addEventListener("change", this.onChangeMarket);
        this.formElement.addEventListener("submit", this.onOptionSubmit);

        // this.getMinutes();
    }

    disconnectedCallback() {
        this.selectElement.removeEventListener("change", this.onChangeMarket);
        this.formElement.removeEventListener("submit", this.onOptionSubmit);
    }

    private initialize() {
        this.market = this.selectElement.value;
        this.periodInput.value = this.period.toString();
        this.investmentPriceElement.textContent =
            this.investmentPrice.toLocaleString();
    }

    private async loadAndRender() {
        const originData = await this.getCandles();
        this.calculateMovingAverage(originData); // 5일 이동평균선
        this.checkCondition();
        this.setTradingAction();
        this.setProfit();
        this.render();
        this.renderSummary();
    }

    private async getCandles() {
        const searchParams = new URLSearchParams({
            market: this.market,
            count: this.period.toString(),
        });

        const response = await fetch(`/fetchCandles?${searchParams}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    private calculateMovingAverage(originData: ICandles[], period = 5) {
        this.data = originData.slice(period - 1).map((aData, index) => {
            // console.log("!!!!!", index, aData);

            let sum = 0;

            for (let i = 0; i < period; i++) {
                // console.log(index + i, originData[index + i]);
                sum += originData[index + i].trade_price;
            }

            return {
                ...aData,
                moving_average_5: sum / period,
            };
        });
    }

    private checkCondition() {
        this.data = this.data.map((aData) => {
            if (!aData.moving_average_5) return aData;

            return {
                ...aData,
                condition: aData.trade_price > aData.moving_average_5,
            };
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

        this.data = this.data.map((aData) => {
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
            .map((aData: ICandles, index) => this.createItem(aData, index))
            .forEach((cloned: HTMLElement) => fragment.appendChild(cloned));

        tableElement?.appendChild(fragment);
    }

    private createItem(aData: ICandles, index: number) {
        const tpElement = document.querySelector(
            "#tp-item"
        ) as HTMLTemplateElement;
        tpElement;

        const cloned = cloneTemplate<HTMLElement>(tpElement);
        if (!aData.moving_average_5) return cloned;

        const parseData = {
            index,
            candle_date_time_kst: aData.candle_date_time_kst.replace("T", " "),
            opening_price: aData.opening_price.toLocaleString(),
            trade_price: aData.trade_price.toLocaleString(),
            moving_average_5:
                aData.moving_average_5 &&
                aData.moving_average_5.toLocaleString(),
            condition: aData.condition,
            tradingAction: aData.tradingAction,

            unrealize_rate: aData.unrealize_rate,
            unrealize_profit: aData.unrealize_profit?.toLocaleString(),
            unrealize_gain: aData.unrealize_gain?.toLocaleString(),

            rate: aData.rate && aData.rate.toFixed(2),

            profit: aData.profit && Math.round(aData.profit).toLocaleString(),

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
            period: this.period,
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
        const deleteButton = cloned.querySelector(
            ".deleteButton"
        ) as HTMLButtonElement;
        deleteButton.addEventListener("click", () => {
            cloned.remove();
            this.summaryAllPrice -= lastProfit;
            this.allSumSize--;

            this.renderAllSum();
        });
    }

    private renderAllSum() {
        const summaryAllRate =
            (this.summaryAllPrice / (this.allSumSize * this.investmentPrice)) *
                100 || 0;

        const allSumData = {
            summaryAllPrice: Math.round(this.summaryAllPrice).toLocaleString(),
            summaryAllRate: summaryAllRate.toFixed(2).toLocaleString(),
        };
        const summaryAllElement = this.querySelector(
            ".summary-all"
        ) as HTMLElement;

        updateElementsTextWithData(allSumData, summaryAllElement);
    }

    private onChangeMarket(event: Event) {
        const target = event.target as HTMLInputElement;
        this.market = target.value;
        this.loadAndRender();
    }

    private onOptionSubmit(event: Event) {
        event?.preventDefault();
        const maxSize = Number(this.periodInput.getAttribute("max"));

        this.period =
            Number(this.periodInput.value) > maxSize
                ? maxSize
                : Number(this.periodInput.value);

        this.periodInput.value = this.period.toString();

        this.loadAndRender();
    }

    private async getMinutes() {
        const searchParams = new URLSearchParams({
            market: "KRW-XRP",
            unit: "30",
            to: "2024-01-11T09:00:00",
            count: "10",
        });

        const response = await fetch(`/fetchCandlesMinutes?${searchParams}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
    }
}
