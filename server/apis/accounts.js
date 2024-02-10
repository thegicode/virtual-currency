const fs = require("fs");
const path = require("path");

const URL = require("../url");
const TOKEN = require("..//token");

getAccounts();

async function getAccounts() {
    const response = await fetch(URL.accounts, {
        method: "GET",
        headers: { Authorization: TOKEN },
    });

    const data = await response.json();

    const myMarkets = [];

    const result = data
        .filter(
            (account) => account.currency === "KRW" || account.avg_buy_price > 0
        )
        .map((account) => {
            const {
                currency,
                balance,
                locked,
                avg_buy_price,
                avg_buy_price_modified,
                unit_currency,
            } = account;
            const locked_number = Number(locked);
            const volume = Number(balance) + locked_number;

            if (currency !== "KRW") {
                myMarkets.push(`${unit_currency}-${currency}`);
            }

            return {
                balance: Number(balance),
                currency,
                locked: locked_number,
                avg_buy_price: Number(avg_buy_price),
                avg_buy_price_modified,
                unit_currency,
                volume,
                buy_price: volume * Number(avg_buy_price),
            };
        })
        .sort((a, b) => {
            const aPrice = a.buy_price;
            const bPrice = b.buy_price;

            if (aPrice == aPrice) return 0;
            return aPrice > bPrice ? -1 : 1;
        });

    fs.writeFileSync(
        path.resolve(`../../data/myMarkets.json`),
        JSON.stringify(myMarkets)
    );

    console.log("result", result);

    return result;
}
