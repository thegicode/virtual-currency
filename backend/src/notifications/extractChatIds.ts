import keys from "../config/key";
const { TELEGRAM_BOT_TOKEN } = keys;

export async function getUpdates() {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        return extractChatIds(data.result);
    } catch (error) {
        console.error("Error sending Telegram message:", error);
    }
}

function extractChatIds(updates: any[]) {
    const chatIds = new Set();

    updates.forEach((update) => {
        if (update.message && update.message.chat) {
            chatIds.add(update.message.chat.id);
        }
        if (update.my_chat_member && update.my_chat_member.chat) {
            chatIds.add(update.my_chat_member.chat.id);
        }
    });

    return Array.from(chatIds);
}
