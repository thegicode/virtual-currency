const fs = require("fs");
const path = require("path");

const URL = require("../server/config/URL");
const TOKEN = require("../server/config/token");

let accountsData = {};
let accountsTime = null;

async function accounts(req, res) {
    const response = await fetch(URL.accounts, {
        method: "GET",
        headers: { Authorization: TOKEN },
    });

    try {
        const data = await response.json();
        if (!data) return;

        // 1분 이상시 호출
        if ((new Date().getTime() - accountsTime) / (1000 * 60) > 1) {
            res.send(handleAccounts(data));
        } else {
            console.log("accountsData", accountsData);
            res.send(accountsData);
        }

        accountsTime = new Date().getTime();
    } catch (error) {
        console.error(error);
    }
}

function handleAccounts(data) {
    if (!data) return;

    console.log("handleAccounts", accountsData);

    const myMarkets = [];
    let accountKRW = {};

    const accounts = data
        .filter((account) => {
            if (account.currency === "KRW" && account.unit_currency === "KRW") {
                accountKRW = account;
                return false;
            }
            return account.currency === "KRW" || account.avg_buy_price > 0;
        })
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
        path.resolve(`./data/myMarkets.json`),
        JSON.stringify(myMarkets)
    );

    accountsData = { accountKRW, accounts };

    return accountsData;
}

module.exports = accounts;
