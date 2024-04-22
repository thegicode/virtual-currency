const options = { method: "GET", headers: { accept: "application/json" } };

fetch(
    "https://api.upbit.com/v1/candles/days?market=KRW-BTC&count=10&convertingPriceUnit=KRW",
    options
)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));
