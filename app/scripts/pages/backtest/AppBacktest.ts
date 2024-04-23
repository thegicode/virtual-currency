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
    private allSumPrice: number;
    private allSumSize: number;
    private periodInput: HTMLInputElement;

    constructor() {
        super();

        this.data = [];
        this.market = "KRW-BTC";
        this.period = 100;
        this.investmentPrice = 500000;
        this.fee = 0.00139;

        this.allSumPrice = 0;
        this.allSumSize = 0;

        this.periodInput = this.querySelector(
            "input[name=period]"
        ) as HTMLInputElement;

        this.onChangeMarket = this.onChangeMarket.bind(this);
        this.onOptionSubmit = this.onOptionSubmit.bind(this);
    }

    connectedCallback() {
        this.initialize();

        this.loadAndRender();

        this.querySelector("select")?.addEventListener(
            "change",
            this.onChangeMarket
        );

        this.querySelector("form")?.addEventListener(
            "submit",
            this.onOptionSubmit
        );

        // this.getMinutes();
    }

    private initialize() {
        this.periodInput.value = this.period.toString();
        (this.querySelector(".investmentPrice") as HTMLElement).textContent =
            this.investmentPrice.toLocaleString();
    }

    private async loadAndRender() {
        const originData = await this.getCandles();
        this.calculateMovingAverage(originData); // 5일 이동평균선
        this.enrichingData();
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
        // const investmentAmount = 200000;
        let orderPrice = 0;
        let profit = 0;
        let totalProfit = 0;
        let total = 0;
        this.data = this.data.map((aData) => {
            switch (aData.action) {
                case "Buy":
                    orderPrice = aData.trade_price;
                    profit = 0;
                    total = total || this.investmentPrice;

                    // console.log("Buy", aData.candle_date_time_kst, orderPrice);

                    break;
                case "Sell":
                    const rate = (aData.trade_price - orderPrice) / orderPrice;
                    profit = rate * total || this.investmentPrice;
                    totalProfit += profit;
                    total = this.investmentPrice + totalProfit;

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
            action: aData.action,
            profit: aData.profit && Math.round(aData.profit).toLocaleString(),
            totalProfit:
                aData.totalProfit &&
                Math.round(aData.totalProfit).toLocaleString(),
            total: aData.total && Math.round(aData.total).toLocaleString(),
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

        const lastProfit = this.data[this.data.length - 1].totalProfit;
        if (!lastProfit) return;

        const totalRate = Math.round((lastProfit / this.investmentPrice) * 100);

        const summaryData = {
            market: this.market,
            period: this.period,
            totalRate: `${totalRate} %`,
            lastProfit: ` ${Math.round(lastProfit).toLocaleString()} 원`,
        };

        updateElementsTextWithData(summaryData, cloned);

        summaryListElement.appendChild(cloned);

        // summary-all
        this.allSumPrice += lastProfit;
        this.allSumSize++;

        this.renderAllSum();

        // delete

        deleteButton.addEventListener("click", () => {
            cloned.remove();
            this.allSumPrice -= lastProfit;
            this.allSumSize--;

            this.renderAllSum();
        });
    }

    private renderAllSum() {
        const allSumRate =
            (this.allSumPrice / (this.allSumSize * this.investmentPrice)) * 100;

        const allSumData = {
            allSumPrice: Math.round(this.allSumPrice).toLocaleString(),
            allSumRate: allSumRate.toFixed(2).toLocaleString(),
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

/**
 * TODO
 * 수수료 적용
 * 현금비중 80% 유지
 * 자금관리 : 가상화폐별 투입금액은 자산의 20%/가상화폐 수
 **/
