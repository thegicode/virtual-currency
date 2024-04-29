// const options = { method: "GET", headers: { accept: "application/json" } };

// fetch(
//     "https://api.upbit.com/v1/candles/days?market=KRW-BTC&count=10&convertingPriceUnit=KRW",
//     options
// )
//     .then((response) => response.json())
//     .then((response) => console.log(response))
//     .catch((err) => console.error(err));

/* const fn = require("./candlesMinutes.js");

const searchParams = {
    market: "KRW-XRP",
    to: "2024-01-11T01:00:00+09:00",
    count: "2",
    unit: 30,
};

async function test() {
    const data = await fn.candlesMinutes(searchParams);
    console.log(data);
} */

const fn = require("./marketAll.js");
async function test() {
    const data = await fn.marketAll();
    console.log(data);
}
test();
