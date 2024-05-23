"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTimestampToKoreanTime = void 0;
function formatTimestampToKoreanTime(trade_timestamp) {
    const date = new Date(trade_timestamp);
    const options = {
        timeZone: "Asia/Seoul",
    };
    const koreanDate = new Intl.DateTimeFormat("ko-KR", options).format(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
exports.formatTimestampToKoreanTime = formatTimestampToKoreanTime;
const tradeTimestamp = 1672531199000;
const formattedTime = formatTimestampToKoreanTime(tradeTimestamp);
