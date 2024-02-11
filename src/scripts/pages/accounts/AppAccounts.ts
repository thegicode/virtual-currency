export default class AppAccounts extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        console.log("AppAccounts");

        this.fetchData();
    }

    private async fetchData() {
        try {
            const result = await fetch(`/accounts`);
            const data = await result.json();
            this.render(data);
        } catch (error) {
            console.error(error);
        }
    }

    private render(data: any) {
        console.log(data);
    }
}
