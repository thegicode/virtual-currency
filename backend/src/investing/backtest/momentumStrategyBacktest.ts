// momentumStrategyBacktest

import { fetchDailyCandles, fetchMarketAll } from "../../services/api";

/**
 * 듀얼 모멘텀 + 현금 비중 최소 90%
 * 투자전략
 *  - 선택한 가상화폐의 과거 30일 수익률 체크
 *  - 최근 30일간 가장 수익률이 좋은 가상화폐에서 자산의 10% 투입
 *  - 최근 30일간 가장 수익률이 좋은 가상화폐가 바뀔 경우 기존 보유 화폐 매도, 새로운 화폐 매수
 *  - 선택한 모든 가상화폐의 30일 수익률이 마이너스로 돌아설 경우 모든 가상화폐 매도, 현금 보유
 */

interface ICandle {
    trade_price: number;
    opening_price: number;
    high_price: number;
    low_price: number;
    // other properties can be added if needed
}

export async function fetchMarketsAndBacktest(
    initialCapital: number,
    days: number = 31 // 과거 days간의 데이터 사용
) {
    // const markets = await fetchMarketAll();
    // const selectedMarkets = markets.map((market: IMarket) => market.market);
    const selectedMarkets = [
        "KRW-SOL",
        "KRW-AVAX",
        "KRW-BCH",
        "KRW-ZRX",
        "KRW-THETA",
        "KRW-NEAR",
        "KRW-BTG",
        "KRW-SHIB",
        "KRW-BTC",
        "KRW-ETH",
        "KRW-DOGE",
        "KRW-TFUEL",
        "KRW-1INCH",
        "KRW-DOT",
        "KRW-POLYX",
    ];
    return momentumStrategyBacktest(selectedMarkets, initialCapital, days);
}

async function momentumStrategyBacktest(
    markets: string[],
    initialCapital: number,
    days: number
) {
    let capital = initialCapital;
    let positions: { [key: string]: number } = {};
    let trades = 0;
    let wins = 0;
    let peakCapital = initialCapital;
    let maxDrawdown = 0;
    let lastResults: { market: string; currentPrice: number }[] = [];

    const candles = await Promise.all(
        markets.map(async (market) => {
            return {
                market,
                candles: await fetchDailyCandles(market, days.toString()),
            };
        })
    );

    for (let day = 30; day < days; day++) {
        console.log("\n day", day);
        const results = candles.map(({ market, candles }, index) => {
            if (!candles) return { market, returnRate: 0, currentPrice: 0 };
            if (index === 0) console.log(candles[day].date_time);

            const currentPrice = candles[day].trade_price;

            const pastPrice = candles[day - 30].trade_price;
            const returnRate = (currentPrice - pastPrice) / pastPrice;
            return { market, returnRate, currentPrice };
        });

        const sortedResults = results.sort(
            (a, b) => b.returnRate - a.returnRate
        );

        lastResults = sortedResults;
        const topMarkets = sortedResults
            .filter((result) => result.returnRate > 0)
            .slice(0, 5);
        const allNegative = sortedResults.every(
            (result) => result.returnRate < 0
        );

        console.log("topMarkets", topMarkets);

        // if (allNegative) {
        //     // 모든 가상화폐의 30일 수익률이 마이너스인 경우
        //     for (const market in positions) {
        //         capital +=
        //             positions[market] *
        //             sortedResults.find((result) => result.market === market)!
        //                 .currentPrice;
        //         delete positions[market];
        //     }
        //     trades++;
        //     continue;
        // }

        // buy
        const newPositions: { [key: string]: number } = {};
        topMarkets.forEach((result) => {
            const market = result.market;
            if (!positions[market]) {
                const investment = capital * 0.1; // 자본의 10%
                newPositions[market] = investment / result.currentPrice;
                capital -= investment;

                console.log("capital buy", market, capital.toLocaleString());
            } else {
                // 이미 매수한 종목은 그대로 유지
                newPositions[market] = positions[market];
            }
        });

        // sell
        for (const market in positions) {
            if (!newPositions[market]) {
                const oldPosition = positions[market];
                const sellPrice = sortedResults.find(
                    (result) => result.market === market
                )!.currentPrice;
                const profit =
                    oldPosition *
                    (sellPrice - oldPosition * (capital / initialCapital));
                if (profit > 0) wins++; // 이익이 발생한 경우 wins 증가
                capital += oldPosition * sellPrice;

                delete positions[market];

                console.log(
                    "capital sell",
                    market,
                    (profit * 100).toFixed(2),
                    capital.toLocaleString()
                );
            }
        }

        positions = newPositions;
        console.log("positions", positions);
        trades++;

        // 최대 낙폭 계산
        const currentTotal =
            capital +
            Object.keys(positions).reduce((sum, market) => {
                return (
                    sum +
                    positions[market] *
                        sortedResults.find(
                            (result) => result.market === market
                        )!.currentPrice
                );
            }, 0);

        if (currentTotal > peakCapital) {
            peakCapital = currentTotal;
        }
        const drawdown = ((peakCapital - currentTotal) / peakCapital) * 100;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    const finalCapital =
        capital +
        Object.keys(positions).reduce((sum, market) => {
            const currentPrice =
                lastResults.find((result) => result.market === market)
                    ?.currentPrice || 0;
            return sum + positions[market] * currentPrice;
        }, 0);

    const performance = (finalCapital / initialCapital - 1) * 100;
    const winRate = trades > 0 ? (wins / trades) * 100 : 0; // 거래가 0인 경우를 처리

    return {
        finalCapital,
        performance: performance.toFixed(2) + "%",
        winRate,
        maxDrawdown,
    };
}

// 실행 예제
(async () => {
    const initialCapital = 1000000;
    const days = 200;

    const backtestResults = await fetchMarketsAndBacktest(initialCapital, days);
    console.log(backtestResults);
})();
