"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTimestampToKoreanTime = void 0;
function formatTimestampToKoreanTime(trade_timestamp) {
    const date = new Date(trade_timestamp);
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Seoul",
        timeZoneName: "short",
    };
    const koreanTime = new Intl.DateTimeFormat("ko-KR", options).format(date);
    return koreanTime;
}
exports.formatTimestampToKoreanTime = formatTimestampToKoreanTime;
