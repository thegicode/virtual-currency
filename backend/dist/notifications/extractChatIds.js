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
exports.getChatIds = void 0;
const key_1 = __importDefault(require("../config/key"));
const { TELEGRAM_BOT_TOKEN } = key_1.default;
function getChatIds() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
        try {
            const response = yield fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = yield response.json();
            return extractChatIds(data.result);
        }
        catch (error) {
            console.error("Error sending Telegram message:", error);
        }
    });
}
exports.getChatIds = getChatIds;
function extractChatIds(updates) {
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield getChatIds();
}))();
