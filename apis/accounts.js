const fs = require("fs");
const path = require("path");

const URL = require("../server/config/URL");
const TOKEN = require("../server/config/token");

const loadMyMarkets = require("./loadMyMarkets");

let storedAccounts = {};
let accountsTime = null;

async function fetchAccounts(req, res) {
    const response = await accounts();
    res.send(response);
}

async function accounts() {
    try {
        // 1분 이상시 호출
        if (
            !accountsTime ||
            (new Date().getTime() - accountsTime) / (1000 * 60) > 1
        ) {
            const response = await fetch(URL.accounts, {
                method: "GET",
                headers: { Authorization: TOKEN },
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("apis/accounts.js : ", data.error);
                throw new Error(
                    `HTTP error! status: ${response.status}, statusText: ${response.statusText}`
                );
            }

            const { assets, accounts } = transformData(data);

            storedAccounts = { assets, accounts };

            setMyMarkets(accounts);

            accountsTime = new Date().getTime();

            return {
                assets,
                accounts,
            };
        } else {
            console.log("Using stored accounts data", storedAccounts);
            return storedAccounts;
        }
    } catch (error) {
        console.error(error.name, error.message);
        return error;
        // res.status(500).send(`${error.name}, ${error.message}`);
    }
}

function transformData(data) {
    if (!data) return;

    const assetsFirst = data.filter(
        (account) =>
            account.currency === "KRW" && account.unit_currency === "KRW"
    )[0];

    const assets = {
        ...assetsFirst,
        avg_buy_price: Number(assetsFirst.avg_buy_price),
        balance: Number(assetsFirst.balance),
        locked: Number(assetsFirst.locked),
    };

    const accounts = data
        .filter(
            (account) => account.currency !== "KRW" && account.avg_buy_price > 0
        )
        .map(enrichAccount)
        .sort((a, b) => b.buy_price - a.buy_price);

    return { assets, accounts };
}

async function setMyMarkets(accounts) {
    const myMarkets = (await loadMyMarkets()) || [];
    const marketSet = new Set(myMarkets);

    accounts.forEach((anAccount) => {
        marketSet.add(anAccount.market);
    });

    fs.writeFileSync(
        path.resolve(`./data/myMarkets.json`),
        JSON.stringify(Array.from(marketSet))
    );
}

function enrichAccount(account) {
    const volume = Number(account.balance) + Number(account.locked);
    return {
        ...account,
        market: `${account.unit_currency}-${account.currency}`,
        balance: Number(account.balance),
        locked: Number(account.locked),
        avg_buy_price: Number(account.avg_buy_price),
        volume,
        buy_price: volume * Number(account.avg_buy_price),
    };
}

module.exports = { fetchAccounts, accounts };
