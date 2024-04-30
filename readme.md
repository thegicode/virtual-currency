# Virtual Currency

## npm scripts

    - npm start
    - npm run build
    - npm test

## directory

    - server : app server(development | production)
    - app : 소스
    - dev : 개발
    - static : 운영 빌드
    - __tests__ : 테스트

## URL

-   http://localhost:1111/accounts

## ToDo

-   auto order
-   markup 컴포넌트별 분리
-   assets 컴포넌트 분리

## 참조

-   [RSI](https://blog.naver.com/PostView.naver?blogId=maripsee&logNo=222895780877)

## caffeinate

## ToDo

-   주문 가격 오류
-   주문한 날짜 표기
-   매수 금액 잘 보이게
-   tarde2 추가 개발
-   전체 주문내역 보이기/가리기 버튼 추가
-   pc 화면인 경우 테이블 형태로 보이기

## 변동성 돌파 전략의 핵심

1. range 계산
    - 원하는 가상화폐의 전일 고가 - 전일 저가
    - 하루 안에 가상화폐가 움직인 최대폭
2. 매수 기준
    - 시가 기준으로 가격이 'range \* k' 이상 상승하면 해당 가격에 매수
    - k는 0.5 ~ 1 (0.5 추천)
3. 매도 기준
    - 그 날 종가에 판다.
4. 시가, 종가, 고가, 저가의 기준
    - 시가 : 필자는 주로 오전 0시나 1시
    - 종가 : 시가에서 24시간 후의 가격
    - 고가(저가): 24시간 동안 가장 높은 가격
