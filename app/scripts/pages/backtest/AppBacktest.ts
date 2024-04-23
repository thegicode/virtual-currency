import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";

export default class AppBacktest extends HTMLElement {
    private data: ICandles[];
    private market: string;

    constructor() {
        super();
        this.data = [];
        this.market = "KRW-BTC";

        this.onChangeMarket = this.onChangeMarket.bind(this);
    }

    connectedCallback() {
        this.loadAndRender();

        this.querySelector("select")?.addEventListener(
            "change",
            this.onChangeMarket
        );
    }

    private onChangeMarket(event: Event) {
        const target = event.target as HTMLInputElement;
        this.market = target.value;
        this.loadAndRender();
    }

    private async loadAndRender() {
        const originData = await this.getCandles();
        this.calculateMovingAverage(originData); // 5일 이동평균선
        this.enrichingData();
        this.render();
    }

    private async getCandles() {
        const searchParams = new URLSearchParams({
            market: this.market,
            count: "1000",
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

    private enrichingData() {
        // condition
        this.data = this.data.map((aData) => {
            if (!aData.moving_average_5) return aData;

            return {
                ...aData,
                condition: aData.moving_average_5 > aData.trade_price,
            };
        });

        // action
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
                    action = "none";
                }
            }

            return {
                ...aData,
                action,
            };
        });

        // order
        const investmentAmount = 200000;
        let orderPrice = 0;
        let profit = 0;
        let totalProfit = 0;
        let total = 0;
        this.data = this.data.map((aData) => {
            switch (aData.action) {
                case "Buy":
                    orderPrice = aData.trade_price;
                    profit = 0;
                    total = total || investmentAmount;

                    // console.log("Buy", aData.candle_date_time_kst, orderPrice);

                    break;
                case "Sell":
                    const rate = (aData.trade_price - orderPrice) / orderPrice;
                    profit = rate * total || investmentAmount;
                    totalProfit += profit;
                    total = investmentAmount + totalProfit;

                    // console.log(
                    //     "Sell",
                    //     aData.candle_date_time_kst,
                    //     "orderPrice:",
                    //     orderPrice,
                    //     "trade_price: ",
                    //     aData.trade_price,
                    //     aData.trade_price - orderPrice
                    // );

                    break;
                case "none":
                    profit = 0;
                    break;
            }

            return {
                ...aData,
                profit,
                totalProfit,
                total,
            };
        });
    }

    private async render() {
        const tableElement = this.querySelector("tbody") as HTMLElement;
        const summaryElement = this.querySelector(".summary") as HTMLElement;

        tableElement.innerHTML = "";
        const fragment = new DocumentFragment();

        this.data
            .map((aData: ICandles) => this.createItem(aData))
            .forEach((cloned: HTMLElement) => fragment.appendChild(cloned));

        tableElement?.appendChild(fragment);

        const lastProfit = this.data[this.data.length - 1].totalProfit;
        if (!lastProfit) return;
        const totalRate = Math.round((lastProfit / 200000) * 100);
        summaryElement.textContent = `${
            this.market
        } | ${totalRate}% | ${Math.round(lastProfit).toLocaleString()}`;
    }

    private createItem(aData: ICandles) {
        const tpElement = document.querySelector(
            "#tp-item"
        ) as HTMLTemplateElement;
        tpElement;

        const cloned = cloneTemplate<HTMLElement>(tpElement);
        if (!aData.moving_average_5) return cloned;

        const parseData = {
            ...aData,
            candle_date_time_kst: aData.candle_date_time_kst.replace("T", " "),
            opening_price: aData.opening_price.toLocaleString(),
            trade_price: aData.trade_price.toLocaleString(),
            moving_average_5:
                aData.moving_average_5 &&
                aData.moving_average_5.toLocaleString(),
            profit: aData.profit && Math.round(aData.profit).toLocaleString(),
            totalProfit:
                aData.totalProfit &&
                Math.round(aData.totalProfit).toLocaleString(),
            total: aData.total && Math.round(aData.total).toLocaleString(),
        };

        updateElementsTextWithData(parseData, cloned);

        return cloned;
    }
}
