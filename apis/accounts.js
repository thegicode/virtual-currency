const fs = require("fs");
const path = require("path");

const URL = require("../server/config/URL");
const TOKEN = require("../server/config/token");

let storedAccounts = {};
let accountsTime = null;

async function accounts(req, res) {
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // console.log("account", data);
            const processedData = handleAccounts(data);

            // console.log("processedData", processedData);

            res.send(processedData);

            accountsTime = new Date().getTime();
        } else {
            console.log("Using stored accounts data", storedAccounts);
            res.send(storedAccounts);
        }

        accountsTime = new Date().getTime();
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

function handleAccounts(data) {
    if (!data) return;

    // 필터링과 매핑을 분리하여 가독성 향상
    const krwAccounts = data.filter(
        (account) =>
            account.currency === "KRW" && account.unit_currency === "KRW"
    );

    let assets = krwAccounts[0];
    assets = {
        ...assets,
        avg_buy_price: Number(assets.avg_buy_price),
        balance: Number(assets.balance),
        locked: Number(assets.locked),
    };

    const accounts = data
        .filter(
            (account) => account.currency !== "KRW" && account.avg_buy_price > 0
        )
        .map(transformAccount)
        .sort((a, b) => b.buy_price - a.buy_price);

    const myMarkets = accounts.map((a) => a.market);

    fs.writeFileSync(
        path.resolve(`./data/myMarkets.json`),
        JSON.stringify(myMarkets)
    );

    storedAccounts = { assets, accounts };

    return { assets, accounts };
}

function transformAccount(account) {
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

module.exports = accounts;
