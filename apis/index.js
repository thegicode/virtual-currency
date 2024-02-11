const accounts = require("./accounts");

const setupApiEndpoints = (app) => {
    app.get("/accounts", accounts);
};

module.exports = setupApiEndpoints;
