const tradeTree = require("./tradeTree");
const { formatTime } = require("./orderUtils");

module.exports = function tradeTreeTimer() {
    let cycleCount = 0;

    // 초기 실행
    executeTradeCycle();

    // 주기적 실행
    const intervalId = setInterval(executeTradeCycle, 1800000); // 30분 간격

    // 매수, 매도 상황을 확인하고 실행하는 함수
    function executeTradeCycle() {
        console.log(`tradeTree cycle ${cycleCount}`, formatTime(new Date()));
        tradeTree();
        cycleCount++;
    }
};
