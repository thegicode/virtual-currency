interface IAccount {
    market: string;
    avg_buy_price: number;
    buy_price: number;
    currency: string;
    locked: number;
    unit_currency: string;
    volume: number;
}

interface IAccountsProps {
    assets: IAsset;
    accounts: IAccount[];
}

interface IAsset {
    avg_buy_price: number;
    avg_buy_price_modified: boolean;
    balance: number;
    currency: string;
    locked: number;
    unit_currency: string;
}

interface IOrdered {
    uuid: string;
    market: string; // 시장: 예를 들어 "KRW-XRP"
    side: "ask" | "bid"; // 주문 타입: 매수(bid) 또는 매도(ask)
    ord_type: "limit" | "price" | "market"; // 주문 방식: limit 지정가 주문, price 시장가 주문(매수), market 시장가 주문(매도)
    price: string; // 주문 가격. (지정가, 시장가 매수 시 필수)
    state: "wait" | "watch" | "done" | "cancel"; // 주문 상태: 대기 중(wait) 또는 완료(done)
    created_at: string; // 생성 시간: ISO 8601 날짜 문자열
    volume: number; // 주문량: 문자열로 표현된 숫자
    reserved_fee: number; // 예약된 수수료
    remaining_fee: number; // 남은 수수료
    remaining_volume: number; // 미체결 주문량
    paid_fee: number; // 지불된 수수료
    locked: number; // 잠긴 양
    executed_volume: number; // 체결된 주문량
    trades_count: number; // 거래 횟수
    identifier?: string; // 조회용 사용자 지정값 (선택)
}

interface IProcessedAccountData {
    currency: string;
    unitCurrency: string;
    buyPrice: number;
    avgBuyPrice: number;
    volume: number;
    locked: number;
    market: string;
    profit: number;
    profitRate: number;
    tradePrice: number;
    orderedData: IOrdered[];
}

interface ITicker {
    market: string;
    trade_price: number;
}

type TOrdredData = Record<string, IOrdered[]>;
