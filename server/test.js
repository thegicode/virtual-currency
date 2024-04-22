const token = require("./config/token");
const { isProduction, staticPath, port } = require("./config/config");
const { getAccounts } = require("../apis/accounts");

console.log("token : ", token);
console.log("isProduction : ", isProduction);
console.log("staticPath : ", staticPath);
console.log("port : ", port);

async function test() {
    const accounts = await getAccounts();
}

test();
