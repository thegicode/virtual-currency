const uuidv4 = require("uuid").v4;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { ACCESS_KEY, SECRET_KEY } = require("../server/config/key");
const URL = require("../server/config/URL");

async function chance(market) {
    const body = {
        market,
    };

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
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    };

    try {
        const response = await fetch(`${URL.orders_chance}?${query}`, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function fetchChance(req, res) {
    const result = await chance(req.query.market);
    res.send(result);
}

module.exports = { fetchChance, chance };
