const uuidv4 = require("uuid").v4;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const queryEncode = require("querystring").encode;

const { ACCESS_KEY, SECRET_KEY } = require("../server/config/key");
const URL = require("../server/config/URL");

async function cancel(req, res) {
    const body = {
        uuid: req.query.uuid,
    };

    const query = queryEncode(body);
    const hash = crypto.createHash("sha512");

    const payload = {
        access_key: ACCESS_KEY,
        nonce: uuidv4(),
        query_hash: hash.update(query, "utf-8").digest("hex"),
        query_hash_alg: "SHA512",
    };

    const token = jwt.sign(payload, SECRET_KEY);

    const options = {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        // body: JSON.stringify(body),
    };

    try {
        const response = await fetch(`${URL.order}?${query}`, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        res.send(data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = cancel;
