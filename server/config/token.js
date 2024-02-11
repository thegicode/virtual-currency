const { ACCESS_KEY, SECRET_KEY } = require("./key");

const sign = require("jsonwebtoken").sign;
const uuidv4 = require("uuid").v4;

const payload = {
    access_key: ACCESS_KEY,
    nonce: uuidv4(),
};

module.exports = sign(payload, SECRET_KEY);
