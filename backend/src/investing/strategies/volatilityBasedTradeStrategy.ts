/**
 * volatilityBasedTradeStrategy
 * 현재 가격이 4개 이동평균(3, 5, 10, 20)보다 높은 경우 매수 또는 보유
 * 현재 가격이 4개 이동평균(3, 5, 10, 20)보다 낮으면 매도 또는 보류
 * 자금관리 : 가상화폐별 투입금액은 (타깃변동성/특정 화폐의 변동성)/가상화폐 수
 *  - 1일 변동성 : (고가 - 저가)/시가 * 100(백분율)
 *  - 변동성 : 최근 5일간의 1일 변동성의 평균
 */

import { fetchDailyCandles } from "../../services/api";
import { calculateMovingAverage } from "../utils";

// const NUM_OF_DAYS = 20;

checkDailyVolatilityTradeStrategy(["KRW-XRP"]);

export async function checkDailyVolatilityTradeStrategy(markets: string[]) {
    try {
        const results = await Promise.all(
            markets.map(async (market) => await checkVolatility(market))
        );
        console.log(results);
    } catch (error) {
        console.error(`Error checking daily volatility:: `, error);
    }
}

async function checkVolatility(market: string) {
    try {
        const fetchedData = await fetchDailyCandles(market, "20");

        const movingAverages = [
            calculateMovingAverage(fetchedData, 3),
            calculateMovingAverage(fetchedData, 5),
            calculateMovingAverage(fetchedData, 10),
            calculateMovingAverage(fetchedData, 20),
        ].map((ma) => ma[ma.length - 1]);

        console.log("movingAverages", movingAverages);
    } catch (error) {
        console.error(`Error in checkVolatility ${market}: `, error);
    }
}
