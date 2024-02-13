const uuidv4 = require("uuid").v4;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const queryEncode = require("querystring").encode;

const { ACCESS_KEY, SECRET_KEY } = require("../server/config/key");
const URL = require("../server/config/URL");

async function ordered(req, res) {
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
        const data = await response.json();
        const result = data.map((aData) => {
            return {
                ...aData,
                remaining_fee: Number(aData.remaining_fee),
                remaining_volume: Number(aData.remaining_volume),
                reserved_fee: Number(aData.reserved_fee),
                volume: Number(aData.volume),
                paid_fee: Number(aData.paid_fee),
                locked: Number(aData.locked),
                executed_volume: Number(aData.executed_volume),
            };
        });

        console.log(result);
        res.send(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = ordered;
