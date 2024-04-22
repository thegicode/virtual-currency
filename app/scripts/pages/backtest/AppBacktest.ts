import {
    cloneTemplate,
    updateElementsTextWithData,
} from "@app/scripts/utils/helpers";

export default class AppBacktest extends HTMLElement {
    private data: ICandles[];

    constructor() {
        super();
        this.data = [];
    }

    connectedCallback() {
        console.log("AppBacktest");

        this.loadAndRender();
    }

    private async loadAndRender() {
        const responseData = await this.getCandles();
        this.data = this.setMovingAverage(responseData);
        this.setData();
        this.render();
    }

    private async getCandles() {
        const response = await fetch("/fetchCandles");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    private setMovingAverage(responseData: ICandles[]) {
        const result = responseData.slice(4).map((aData, index) => {
            // console.log("!!!!!", index, aData);
            let sum = 0;

            // index 0 : responseData 0, 1, 2, 3, 4
            // index 1 : responseData 1, 2, 3, 4, 5
            // index 2 : responseData 2, 3, 4, 5, 6

            for (let i = 0; i < 5; i++) {
                // console.log(index + i);
                // console.log(responseData[index + i]);
                sum += Number(responseData[index + i].trade_price);
            }

            return {
                ...aData,
                moving_average_5: sum / 5,
            };
        });
        return result;
    }

    private setData() {
        this.data = this.data.map((aData) => {
            if (!aData.moving_average_5) return aData;

            return {
                ...aData,
                condition: aData.moving_average_5 > Number(aData.trade_price),
            };
        });
    }

    private async render() {
        const fragment = new DocumentFragment();

        this.data
            .map((aData: ICandles) => this.createItem(aData))
            .forEach((cloned: HTMLElement) => fragment.appendChild(cloned));

        this.querySelector("table")?.appendChild(fragment);
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
            prev_closing_price: aData.prev_closing_price.toLocaleString(),
            moving_average_5:
                aData.moving_average_5 &&
                aData.moving_average_5.toLocaleString(),
        };

        console.log(parseData);

        updateElementsTextWithData(parseData, cloned);

        return cloned;
    }
}
