"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessagesToUsers = void 0;
const key_1 = __importDefault(require("../config/key"));
const { TELEGRAM_BOT_TOKEN } = key_1.default;
function sendMessagesToUsers(message, chatIds) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = chatIds.map((chatId) => sendTelegramMessageToChatId(chatId, message));
        try {
            const results = yield Promise.all(promises);
            results.forEach((result) => {
                if (result.ok) {
                    console.log(`Telegram message sent to ${result.result.chat.id} successfully`);
                }
                else {
                    console.error(`Failed to send Telegram message to ${result.result.chat.id}:`, result.description);
                }
            });
        }
        catch (error) {
            console.error("Error sending Telegram messages:", error);
        }
    });
}
exports.sendMessagesToUsers = sendMessagesToUsers;
function sendTelegramMessageToChatId(chatId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        try {
            const response = yield fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                }),
            });
            const data = yield response.json();
            return data;
        }
        catch (error) {
            let errorMessage;
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            else {
                errorMessage = String(error);
            }
            console.error(`Error sending message to chatId ${chatId}:`, errorMessage);
            return { ok: false, description: errorMessage };
        }
    });
}
