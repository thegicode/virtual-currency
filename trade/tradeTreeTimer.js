const tradeTree = require("./tradeTree");
const { formatTime } = require("./orderUtils");

/*
    자동 체크
    1. market별 30분마다 매수, 매도 상황 확인
 */

module.exports = function tradeTreeTimer() {
    let index = 0;

    tradeTree();
    console.log("tradeTree", index, formatTime(new Date()));

    treeTimer();

    function treeTimer() {
        setInterval(() => {
            tradeTree();
            index++;
            console.log("tradeTree", index, formatTime(new Date()));
        }, 1800000);
    }
};
