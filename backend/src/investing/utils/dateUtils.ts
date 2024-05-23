// backend/investing/utils/dateUtils.ts

export function formatDateString(dateString: string): string {
    if (dateString.length !== 8 || !/^\d{8}$/.test(dateString)) {
        throw new Error("Invalid date string format");
    }

    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);

    return `${year}-${month}-${day}`;
}

export function formatTimeString(timeString: string): string {
    if (timeString.length !== 6 || !/^\d{6}$/.test(timeString)) {
        throw new Error("Invalid time string format");
    }

    const hours = timeString.slice(0, 2);
    const minutes = timeString.slice(2, 4);
    const seconds = timeString.slice(4, 6);

    return `${hours}:${minutes}:${seconds}`;
}
