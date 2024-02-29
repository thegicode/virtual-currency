const tree = require("./tree");

/*
    자동 체크
    1. market별 30분마다 매수, 매도 상황 확인
 */

module.exports = function leafs() {
    let index = 0;

    tree();
    console.log("tree", index, formatTime(new Date()));

    treeTimer();

    function treeTimer() {
        setInterval(() => {
            tree();
            index++;
            console.log("tree", index, formatTime(new Date()));
        }, 1800000);
    }

    function formatTime(date) {
        const options = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "Asia/Seoul",
        };
        return new Intl.DateTimeFormat("ko-KR", options).format(date);
    }
};
