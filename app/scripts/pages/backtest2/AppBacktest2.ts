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

    constructor() {
        super();

        this.data = [];
        this.market = "KRW-XRP";
        this.count = 50;
        this.marketSize = 5;
        this.totalInvestmentPrice = 1000000;
    }

    connectedCallback() {
        this.loadAndRender();
    }

    async loadAndRender() {
        const originData = await this.getCandles();
        this.movingAverages(originData);
        this.checkCondition();
        this.setAction();
        this.setVolatility();
        this.order();
        this.setProfit();
        this.render();
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

    private movingAverages(originData: ICandles[]) {
        let data = setMovingAverage(originData, 3);
        data = setMovingAverage(originData, 5);
        data = setMovingAverage(originData, 10);
        data = setMovingAverage(originData, 20);

        this.data = data;
    }

    private checkCondition() {
        this.data = this.data.map((aData) => {
            if (
                aData.moving_average_3 > aData.trade_price &&
                aData.moving_average_5 > aData.trade_price &&
                aData.moving_average_10 > aData.trade_price &&
                aData.moving_average_20 > aData.trade_price
            )
                aData.condition = true;
            else aData.condition = false;

            return { ...aData };
        });
    }

    private setAction() {
        this.data = this.data.map((aData, index) => {
            let action = "";
            if (index === 0) {
                if (aData.condition) action = "Buy";
                else if (!aData.condition) action = "";
            } else {
                const prevCondition = this.data[index - 1].condition;
                if (prevCondition && aData.condition) {
                    action = "Hold";
                } else if (prevCondition && !aData.condition) {
                    action = "Sell";
                } else if (!prevCondition && aData.condition) {
                    action = "Buy";
                } else if (!prevCondition && !aData.condition) {
                    action = "Reserve";
                }
            }

            return {
                ...aData,
                action,
            };
        });
    }

    private setVolatility() {
        this.data = this.data.map((aData) => {
            return {
                ...aData,
                daily_volatility: getDaliyVolatility(aData),
            };
        });

        this.data = this.data.map((aData, index) => {
            const volatility = getVolatility(this.data, aData, index);
            return {
                ...aData,
                volatility,
            };
        });
    }

    private order() {
        const target = 2; // 2%
        this.data = this.data.map((aData) => {
            if (!aData.volatility) return aData;

            if (aData.action === "Buy") {
                const percent = (target / aData.volatility) * 100;
                const unitPercent = percent / this.marketSize;

                const result = (this.totalInvestmentPrice * unitPercent) / 100;

                return { ...aData, order_price: Math.round(result) };
            } else return aData;
        });
    }

    private setProfit() {
        let buyTradePrice = 0;
        let orderPrice = 0;
        let profit = 0;
        let sumProfit = 0;
        let sumPrice = this.totalInvestmentPrice / this.marketSize;
        this.data = this.data.map((aData) => {
            switch (aData.action) {
                case "Buy":
                    buyTradePrice = aData.trade_price;
                    if (aData.order_price) orderPrice = aData.order_price;
                    profit = 0;
                    // sumPrice = orderPrice;
                    break;
                case "Sell":
                    const rate =
                        (aData.trade_price - buyTradePrice) / buyTradePrice;
                    profit = orderPrice * rate;
                    sumProfit += profit;
                    sumPrice += sumProfit;
                    break;
                case "Reserve":
                    profit = 0;
                    break;
            }

            return {
                ...aData,
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
            action: aData.action,

            daily_volatility: aData.daily_volatility && aData.daily_volatility,
            volatility: (aData.volatility && aData.volatility) || "",
            order_price:
                (aData.order_price && aData.order_price.toLocaleString()) || "",

            profit: aData.profit && Math.round(aData.profit).toLocaleString(),
            sumProfit:
                aData.sumProfit && Math.round(aData.sumProfit).toLocaleString(),
            sumPrice:
                aData.sumPrice && Math.round(aData.sumPrice).toLocaleString(),
        };

        // console.log("parseData", parseData);

        updateElementsTextWithData(parseData, cloned);

        cloned.dataset.action = aData.action;

        return cloned;
    }
}
