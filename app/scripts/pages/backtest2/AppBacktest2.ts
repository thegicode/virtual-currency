/**
 * 투자전략 3 : 3, 5, 10, 20일 이동평균 + 변동성 조절
 * 거래비용 0.2% 적용
 * 이동평균선 1일 1회 체크
 * 현재 가격이 4개 이동평균보다 높은 경우 매수 또는 보유
 * 현재 가격이 4개 이동평균보다 낮으면 매도 또는 보류
 * 자금관리 : 가상화폐별 투입금액은 (타깃변동성/특정 화폐의 변동성)/가상화폐 수
 *  - 1일 변동성 : (고가 - 저가)/시가 * 100(백분율)
 *  - 변동성 : 최근 5일간의 1일 변동성의 평균
 */

/**
 * TODO
 * 수수료 적용
 * 거래 횟수 추가
 * 승률 추가
 * 총 투자금 입력
 **/

import { setMovingAverage } from "@app/scripts/components/backtest/movingAverage";
import {
    getDaliyVolatility,
    getVolatility,
} from "@app/scripts/components/backtest/volatility";
import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";

export default class AppBacktest2 extends HTMLElement {
    private data: ICandles2[];
    private market: string;
    private count: number;
    private totalInvestmentPrice: number;
    private marketSize: number;
    private investmentPrice: number;
    private summaryAllPrice: number;
    private allSumSize: number;
    private target: number;
    private countElement: HTMLInputElement;
    private selectElement: HTMLSelectElement;
    private formElement: HTMLFormElement;

    constructor() {
        super();

        this.data = [];
        this.market = "";
        this.count = 30;
        this.marketSize = 5;
        this.totalInvestmentPrice = 1000000;
        this.investmentPrice = this.totalInvestmentPrice / this.marketSize;
        this.summaryAllPrice = 0;
        this.allSumSize = 0;
        this.target = 2; // 2%

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
        this.loadAndProcessData();

        this.selectElement.addEventListener("change", this.onChangeMarket);
        this.formElement.addEventListener("submit", this.onOptionSubmit);
    }

    disconnectedCallback() {
        this.selectElement.removeEventListener("change", this.onChangeMarket);
        this.formElement.removeEventListener("submit", this.onOptionSubmit);
    }

    private initialize() {
        this.market = this.selectElement.value;
        this.countElement.value = this.count.toString();
        (this.querySelector(".investmentPrice") as HTMLElement).textContent =
            this.investmentPrice.toLocaleString();
    }

    async loadAndProcessData() {
        // 원본 캔들 데이터 로드
        const rawData = await this.fetchCandleData();
        // 이동평균 계산
        const movingAverageData = this.calculateMovingAverages(rawData);
        // 거래 조건 검사
        const dataWithConditions =
            this.assessPriceAgainstAverages(movingAverageData);
        // 거래 액션 결정 (매수, 매도 등)
        const actionableData = this.determineTradeActions(dataWithConditions);
        // 변동성 계산
        const dataWithVolatility = this.calculateVolatility(actionableData);
        // 주문 처리 (매수/매도 주문)
        const orderedData = this.placeOrders(dataWithVolatility);
        const dataWithProfits = this.calculateProfits(orderedData);

        // 20번째 데이터부터 사용 (20일선 적용된 데이터부터 시작)
        this.data = dataWithProfits.slice(19);

        // 데이터 렌더링
        this.render();
        this.renderSummary();
    }

    private async fetchCandleData() {
        const searchParams = new URLSearchParams({
            market: this.market,
            count: (this.count + 19).toString(),
        });

        const response = await fetch(`/fetchCandles?${searchParams}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    private calculateMovingAverages(originData: ICandles2[]) {
        let data = setMovingAverage(originData, 3);
        data = setMovingAverage(data, 5);
        data = setMovingAverage(data, 10);
        data = setMovingAverage(data, 20);

        return data;
    }

    private assessPriceAgainstAverages(dataList: ICandles2[]) {
        return dataList.map((data) => {
            const isPriceAboveAverages =
                data.trade_price > data.moving_average_3 &&
                data.trade_price > data.moving_average_5 &&
                data.trade_price > data.moving_average_10 &&
                data.trade_price > data.moving_average_20
                    ? true
                    : false;

            return { ...data, condition: isPriceAboveAverages };
        });
    }

    private determineTradeActions(dataList: ICandles2[]) {
        return dataList.map((data, index) => {
            let tradingAction = "";

            if (index === 0) {
                tradingAction = data.condition ? "Buy" : "Reserve";
            } else {
                const prevCondition = dataList[index - 1].condition;
                if (prevCondition !== data.condition) {
                    tradingAction = data.condition ? "Buy" : "Sell";
                } else {
                    tradingAction = data.condition ? "Hold" : "Reserve";
                }
            }

            return {
                ...data,
                tradingAction,
            };
        });
    }

    private calculateVolatility(dataList: ICandles2[]) {
        const dailyData = dataList.map((aData) => {
            return {
                ...aData,
                daily_volatility: getDaliyVolatility(aData),
            };
        });

        const result = dailyData.map((aData, index) => {
            const volatility = getVolatility(dailyData, index);
            return {
                ...aData,
                volatility,
            };
        });

        return result;
    }

    private placeOrders(dataList: ICandles2[]) {
        return dataList.map((aData) => {
            if (aData.tradingAction === "Buy" && aData.volatility) {
                const percent = (this.target / aData.volatility) * 100;
                const unitPercent = percent / this.marketSize;
                const result = (this.totalInvestmentPrice * unitPercent) / 100;

                return { ...aData, order_price: Math.round(result) };
            }
            return { ...aData };
        });
    }

    private calculateProfits(dataList: ICandles2[]) {
        let buyTradePrice = 0;
        let orderPrice = 0;
        let profit = 0;
        let rate = 0;

        let unrealize_rate = 0;
        let unrealize_gain = 0;
        let unrealize_profit = 0;

        let sumProfit = 0;
        let sumPrice = this.investmentPrice;

        const getRate = (aData: ICandles2) =>
            (aData.trade_price - buyTradePrice) / buyTradePrice;
        const getProfit = (aData: ICandles2) => orderPrice * getRate(aData);
        const getSumPrice = () => this.investmentPrice + sumProfit;

        return dataList.map((oneData) => {
            const aData = JSON.parse(JSON.stringify(oneData));
            switch (aData.tradingAction) {
                case "Buy":
                    buyTradePrice = aData.trade_price;
                    if (aData.order_price) orderPrice = aData.order_price;
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
                    sumPrice = getSumPrice();

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
                profit,
                rate: rate * 100,
                unrealize_rate: Number((unrealize_rate * 100).toFixed(2)),
                unrealize_profit: Math.round(unrealize_profit) || 0,
                unrealize_gain: Math.round(unrealize_gain),
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

            // moving_average_3:
            //     (aData.moving_average_3 &&
            //         aData.moving_average_3.toLocaleString()) ||
            //     "",
            // moving_average_5:
            //     (aData.moving_average_5 &&
            //         aData.moving_average_5.toLocaleString()) ||
            //     "",
            // moving_average_10:
            //     (aData.moving_average_10 &&
            //         aData.moving_average_10.toLocaleString()) ||
            //     "",
            // moving_average_20:
            //     (aData.moving_average_20 &&
            //         aData.moving_average_20.toLocaleString()) ||
            //     "",

            condition: aData.condition,
            tradingAction: aData.tradingAction,

            // daily_volatility: aData.daily_volatility && aData.daily_volatility,
            volatility: (aData.volatility && aData.volatility) || "",
            order_price:
                (aData.order_price && aData.order_price.toLocaleString()) || "",

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

        // console.log("parseData", parseData);

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

        const lastProfit = this.data[this.data.length - 1].sumProfit;
        if (lastProfit === undefined) return;

        const totalRate = (lastProfit / this.investmentPrice) * 100;
        const summaryData = {
            market: this.market,
            period: this.count,
            totalRate: `${totalRate.toFixed(2)} %`,
            lastProfit: ` ${Math.round(lastProfit).toLocaleString()} 원`,
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
        this.loadAndProcessData();
    }

    private onOptionSubmit(event: Event) {
        event?.preventDefault();
        const maxSize = Number(this.countElement.getAttribute("max"));

        this.count =
            Number(this.countElement.value) > maxSize
                ? maxSize
                : Number(this.countElement.value);

        this.countElement.value = this.count.toString();

        this.loadAndProcessData();
    }
}
