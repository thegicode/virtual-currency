import keys from "../config/key";
import { getChatIds } from "./extractChatIds";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = keys;

export async function sendMessagesToUsers(message: string, chatIds: number[]) {
    // console.log("chatIds", chatIds);

    const promises = chatIds.map((chatId) =>
        sendTelegramMessageToChatId(message, chatId)
    );

    try {
        const results = await Promise.all(promises);

        results.forEach((result) => {
            if (result.ok) {
                console.log(
                    `Telegram message sent to ${result.result.chat.id} successfully`
                );
            } else {
                console.error(
                    `Failed to send Telegram message to ${result.result.chat.id}:`,
                    result.description
                );
            }
        });
    } catch (error) {
        console.error("Error sending Telegram messages:", error);
    }
}

// Telegram 메시지를 chatId로 보내는 함수
export async function sendTelegramMessageToChatId(
    message: string,
    chatId: number = TELEGRAM_CHAT_ID
) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        let errorMessage: string;

        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = String(error);
        }

        console.error(
            `Error sending message to chatId ${chatId}:`,
            errorMessage
        );
        return { ok: false, description: errorMessage };
    }
}

// (async () => {
//     const chatIds = await getChatIds();
//     if (chatIds && Array.isArray(chatIds))
//         sendMessagesToUsers("test~~", chatIds);
// })();