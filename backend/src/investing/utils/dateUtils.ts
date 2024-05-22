// backend/investing/utils/dateUtils.ts

export function formatTimestampToKoreanTime(trade_timestamp: number): string {
    // Unix Timestamp를 밀리초로 변환
    const date = new Date(trade_timestamp);

    // 한국 시간대(UTC+9)로 변환
    const options: Intl.DateTimeFormatOptions = {
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

// 예제 사용
const tradeTimestamp = 1672531199000; // 예시 Unix Timestamp
const formattedTime = formatTimestampToKoreanTime(tradeTimestamp);

console.log(formattedTime);
// 결과 예시: 2024-05-22T20:00:00
