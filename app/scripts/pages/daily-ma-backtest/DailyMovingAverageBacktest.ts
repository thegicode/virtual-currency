export default class DailyMovingAverageBacktest extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        console.log("DailyMovingAverageBacktest");

        const data = await this.fetchData();
        console.log(data);
    }

    private async fetchData() {
        const searchParams = new URLSearchParams({
            markets: "KRW-DOGE, KRW-AVAX",
            period: "5",
            initialCapital: "10000",
        });

        const response = await fetch(`/fetchDailyMABacktest?${searchParams}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }
}
