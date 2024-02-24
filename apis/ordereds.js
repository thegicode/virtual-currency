const uuidv4 = require("uuid").v4;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const queryEncode = require("querystring").encode;

const { ACCESS_KEY, SECRET_KEY } = require("../server/config/key");
const URL = require("../server/config/URL");

function transformData(orders) {
    const grouped = {};

    orders.forEach((aOrder) => {
        const { market } = aOrder;
        if (!grouped[market]) {
            grouped[market] = [];
        }

        const aData = {
            ...aOrder,
            executed_volume: Number(aOrder.executed_volume),
            locked: Number(aOrder.locked),
            paid_fee: Number(aOrder.paid_fee),
            price: Number(aOrder.price),
            remaining_fee: Number(aOrder.remaining_fee),
            remaining_volume: Number(aOrder.remaining_volume),
            reserved_fee: Number(aOrder.reserved_fee),
            volume: Number(aOrder.volume),
        };

        grouped[market].push(aData);
    });

    return grouped;
}

async function ordereds(req, res) {
    const query = queryEncode({ state: "wait" });
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
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    try {
        const response = await fetch(`${URL.orders}?${query}`, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const orders = await response.json();

        const result = transformData(orders);

        res.send(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = ordereds;
