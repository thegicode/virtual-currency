const uuidv4 = require("uuid").v4;
const crypto = require("crypto");
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
        price: params.price,
        ord_type: params.ord_type,
    };

    if (params.volume) {
        body.volume = params.volume;
    }

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
        return error;
    }
}

async function checkChance(params) {
    let chanceResponse;
    try {
        chanceResponse = await chance(params.market);
    } catch (error) {
        console.error("Error fetching market chance:", error);
        return false; // API 호출 실패 시 거래 불가능으로 처리
    }

    const totalPrice = Number(params.price) * Number(params.volume || 1);

    if (chanceResponse.market.state !== "active") {
        return false;
    }

    const isBid = params.side === "bid";
    const isAsk = params.side === "ask";
    const isLImit = params.ord_type === "limit";

    const bidLimitCondition =
        isBid &&
        isLImit &&
        Number(chanceResponse.bid_account.balance) < Number(params.volume);

    const askCondition =
        isAsk &&
        Number(chanceResponse.ask_account.balance) -
            Number(chanceResponse.ask_account.locked) <
            Number(params.volume);

    // Total Price 범위 확인 (min_total과 max_total 조건은 서로 상충될 수 있으므로 로직 검토 필요)
    const isTotalPriceOutOfRange =
        chanceResponse.market.bid.min_total > totalPrice ||
        chanceResponse.market.max_total < totalPrice;

    if (bidLimitCondition || askCondition || isTotalPriceOutOfRange) {
        return false;
    }

    return true;

    /* if (params.side === "bid") {
        if (
            chanceResponse.market.bid.min_total > totalPrice &&
            chanceResponse.market.max_total < totalPrice
        )
            return false;

        if (
            params.ord_type === "limit" &&
            Number(chanceResponse.bid_account.balance) < params.volume
        )
            return false;
    }

    if (params.side === "ask") {
        const possibleVolume =
            Number(chanceResponse.ask_account.balance) -
            Number(chanceResponse.ask_account.locked);

        if (
            chanceResponse.market.ask.min_total > totalPrice &&
            chanceResponse.market.max_total < totalPrice &&
            possibleVolume < this.orderVolume
        )
            return false;
    }

    return true; */
}

module.exports = { orders, fetchOrders };
