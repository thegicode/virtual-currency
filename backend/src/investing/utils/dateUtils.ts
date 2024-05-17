// backend/investing/utils/dateUtils.ts

export function formatTimestampToKoreanTime(trade_timestamp: number): string {
    // Unix Timestamp를 밀리초로 변환
    const date = new Date(trade_timestamp);

    // 한국 시간대(UTC+9)로 변환
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Seoul",
        timeZoneName: "short",
    };

    // 한국 시간대 포맷팅
    const koreanTime = new Intl.DateTimeFormat("ko-KR", options).format(date);

    return koreanTime;
}

// 예제 사용
// const tradeTimestamp = 1672531199000; // 예시 Unix Timestamp
// const formattedTime = formatTimestampToKoreanTime(tradeTimestamp);

// console.log(formattedTime);
// 결과 예시: 2023.01.01. 오후 12:59:59 KST
