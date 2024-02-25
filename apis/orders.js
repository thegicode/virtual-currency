const uuidv4 = require("uuid").v4;
const crypto = require("crypto");
const { fsync } = require("fs");
const jwt = require("jsonwebtoken");

const { ACCESS_KEY, SECRET_KEY } = require("../server/config/key");
const URL = require("../server/config/URL");
const { chance } = require("./chance");

async function fetchOrders(req, res) {
    const response = await orders(req.query);
    res.send(response);
}

async function orders(params) {
    const body = {
        market: params.market,
        side: params.side,
        volume: params.volume,
        price: params.price,
        ord_type: params.ord_type,
    };

    if (!(await checkChance(params))) return;

    const query = new URLSearchParams(body).toString();
    const hash = crypto.createHash("sha512");
    const queryHash = hash.update(query, "utf-8").digest("hex");

    const payload = {
        access_key: ACCESS_KEY,
        nonce: uuidv4(),
        query_hash: queryHash,
        query_hash_alg: "SHA512",
    };

    const token = jwt.sign(payload, SECRET_KEY);

    const options = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    };

    try {
        const resonse = await fetch(URL.orders, options);
        const data = await resonse.json();
        const result = {
            ...data,
            executed_volume: Number(data.executed_volume),
            locked: Number(data.locked),
            paid_fee: Number(data.paid_fee),
            price: Number(data.price),
            remaining_fee: Number(data.remaining_fee),
            remaining_volume: Number(data.remaining_volume),
            reserved_fee: Number(data.reserved_fee),
            volume: Number(data.volume),
        };

        return result;
    } catch (error) {
        console.error("Error:", error);
        // res.status(500).send("Internal Server Error");
    }
}

async function checkChance(params) {
    const chanceResponse = await chance(params.market);

    const totalPrice = parseInt(params.price) * parseInt(params.volume);

    if (params.side === "bid") {
        if (
            chanceResponse.market.state !== "active" &&
            chanceResponse.market.bid.min_total > totalPrice &&
            chanceResponse.market.max_total < totalPrice &&
            Number(chanceResponse.bid_account.balance) < params.volume
        )
            return false;
    }

    if (params.side === "ask") {
        const possibleVolume =
            Number(chanceResponse.ask_account.balance) -
            Number(chanceResponse.ask_account.locked);

        if (
            chanceResponse.market.state !== "active" &&
            chanceResponse.market.ask.min_total > totalPrice &&
            chanceResponse.market.max_total < totalPrice &&
            possibleVolume < this.orderVolume
        )
            return false;
    }

    return true;
}

module.exports = { orders, fetchOrders };
