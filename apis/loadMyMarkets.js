const fs = require("fs");

module.exports = async function loadMyMarkets() {
    try {
        const data = await fs.readFileSync(`./data/myMarkets.json`, {
            encoding: "utf-8",
            flag: "r",
        });

        const myMarkets = JSON.parse(data);

        // console.log("loadMyMarkets myMarkets", myMarkets);

        return myMarkets;
    } catch (error) {
        console.error("Error loading myMarkets.json", error);
    }
};
