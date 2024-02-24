const uuidv4 = require("uuid").v4;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { ACCESS_KEY, SECRET_KEY } = require("../server/config/key");
const URL = require("../server/config/URL");
const { chance } = require("./chance");

async function checkChance(query) {
    const response = await chance(query.market);
    const totalPrice = parseInt(query.price) * parseInt(query.volume);

    if (query.side === "bid") {
        if (
            response.market.state !== "active" &&
            response.market.bid.min_total > totalPrice &&
            response.market.max_total < totalPrice &&
            Number(response.bid_account.balance) < query.volume
        )
            return false;
    }

    if (query.side === "ask") {
        const possibleVolume =
            Number(response.ask_account.balance) -
            Number(response.ask_account.locked);

        if (
            response.market.state !== "active" &&
            response.market.ask.min_total > totalPrice &&
            response.market.max_total < totalPrice &&
            possibleVolume < this.orderVolume
        )
            return false;
    }

    return true;
}

async function orders(req, res) {
    const body = {
        market: req.query.market,
        side: req.query.side,
        volume: req.query.volume,
        price: req.query.price,
        ord_type: req.query.ord_type,
    };

    if (!(await checkChance(req.query))) return;

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
        if (!resonse.ok) {
            throw new Error(`HTTP error! status: ${resonse.status}`);
        }
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
        res.send(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = orders;
