const tree = require("./tree");

/*
    자동 체크
    1. market별 30분마다 매수, 매도 상황 확인
 */

let index = 0;

tree();
console.log("tree", index);

leafs();

function leafs() {
    setInterval(() => {
        tree();
        index++;
        console.log("tree", index);
    }, 100000);
}
