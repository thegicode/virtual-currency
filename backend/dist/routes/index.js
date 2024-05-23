"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const router = express_1.default.Router();
router.get("/fetchDailyMABacktest", controllers_1.handleDailyMABacktest);
router.get("/fetchMiuntesCandles", controllers_1.handleGetMinutesCandles);
exports.default = router;
