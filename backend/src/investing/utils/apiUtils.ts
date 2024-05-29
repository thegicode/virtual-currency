export function adjustApiCounts(
    apiCounts: number,
    increment: number,
    maxLimit: number = 200
): number {
    return apiCounts + increment > maxLimit ? maxLimit : apiCounts + increment;
}

export async function retryFetch(
    url: string,
    options: RequestInit,
    retries: number = 5,
    delay: number = 1000
): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                if (response.status === 429 && i < retries - 1) {
                    console.warn(
                        `Rate limit exceeded, retrying in ${delay}ms...`
                    );
                    await new Promise((res) => setTimeout(res, delay));
                    continue;
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise((res) => setTimeout(res, delay));
        }
    }
    throw new Error("Maximum retries reached");
}
