"use strict";
{
    const data = [
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-09T09:00:00",
            opening_price: 62011000,
            trade_price: 63682000,
            high_price: 64955000,
            low_price: 61717000,
            candle_acc_trade_volume: 8059.0341961,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-10T09:00:00",
            opening_price: 63682000,
            trade_price: 64549000,
            high_price: 64890000,
            low_price: 63062000,
            candle_acc_trade_volume: 3520.61476764,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-11T09:00:00",
            opening_price: 64549000,
            trade_price: 65230000,
            high_price: 65500000,
            low_price: 64256000,
            candle_acc_trade_volume: 3675.68043315,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-12T09:00:00",
            opening_price: 65231000,
            trade_price: 67002000,
            high_price: 67444000,
            low_price: 64887000,
            candle_acc_trade_volume: 6674.5189116,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-13T09:00:00",
            opening_price: 67002000,
            trade_price: 67309000,
            high_price: 67698000,
            low_price: 65800000,
            candle_acc_trade_volume: 6757.73223342,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-14T09:00:00",
            opening_price: 67309000,
            trade_price: 70199000,
            high_price: 70300000,
            low_price: 66800000,
            candle_acc_trade_volume: 8040.24948851,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-15T09:00:00",
            opening_price: 70195000,
            trade_price: 71253000,
            high_price: 72216000,
            low_price: 70190000,
            candle_acc_trade_volume: 8360.6265065,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-16T09:00:00",
            opening_price: 71253000,
            trade_price: 72128000,
            high_price: 72500000,
            low_price: 70782000,
            candle_acc_trade_volume: 4895.5305616,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-17T09:00:00",
            opening_price: 72134000,
            trade_price: 71530000,
            high_price: 72267000,
            low_price: 69595000,
            candle_acc_trade_volume: 6239.93681452,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-18T09:00:00",
            opening_price: 71500000,
            trade_price: 71964000,
            high_price: 72158000,
            low_price: 70669000,
            candle_acc_trade_volume: 3622.39704322,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-19T09:00:00",
            opening_price: 71968000,
            trade_price: 71755000,
            high_price: 72412000,
            low_price: 71728000,
            candle_acc_trade_volume: 3590.53994514,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-20T09:00:00",
            opening_price: 71755000,
            trade_price: 72191000,
            high_price: 73100000,
            low_price: 71010000,
            candle_acc_trade_volume: 5210.9537578,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-21T09:00:00",
            opening_price: 72160000,
            trade_price: 72397000,
            high_price: 72465000,
            low_price: 71100000,
            candle_acc_trade_volume: 3784.15692927,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-22T09:00:00",
            opening_price: 72397000,
            trade_price: 71601000,
            high_price: 72399000,
            low_price: 71458000,
            candle_acc_trade_volume: 2956.43290437,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-23T09:00:00",
            opening_price: 71600000,
            trade_price: 70805000,
            high_price: 71835000,
            low_price: 70657000,
            candle_acc_trade_volume: 2937.89362228,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-24T09:00:00",
            opening_price: 70804000,
            trade_price: 71107000,
            high_price: 71467000,
            low_price: 70542000,
            candle_acc_trade_volume: 2768.92244263,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-25T09:00:00",
            opening_price: 71107000,
            trade_price: 71256000,
            high_price: 71595000,
            low_price: 70907000,
            candle_acc_trade_volume: 1867.42810931,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-26T09:00:00",
            opening_price: 71254000,
            trade_price: 74742000,
            high_price: 75000000,
            low_price: 70000000,
            candle_acc_trade_volume: 6152.52849944,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-27T09:00:00",
            opening_price: 74741000,
            trade_price: 78619000,
            high_price: 79183000,
            low_price: 74554000,
            candle_acc_trade_volume: 10168.66847875,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-28T09:00:00",
            opening_price: 78621000,
            trade_price: 87634000,
            high_price: 88424000,
            low_price: 78082000,
            candle_acc_trade_volume: 19254.09747335,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-02-29T09:00:00",
            opening_price: 87695000,
            trade_price: 85910000,
            high_price: 90000000,
            low_price: 85244000,
            candle_acc_trade_volume: 14269.12684354,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-01T09:00:00",
            opening_price: 85911000,
            trade_price: 87397000,
            high_price: 88500000,
            low_price: 85910000,
            candle_acc_trade_volume: 6256.97193595,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-02T09:00:00",
            opening_price: 87397000,
            trade_price: 86383000,
            high_price: 87724000,
            low_price: 86090000,
            candle_acc_trade_volume: 5481.66253212,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-03T09:00:00",
            opening_price: 86382000,
            trade_price: 87982000,
            high_price: 87993000,
            low_price: 85000000,
            candle_acc_trade_volume: 6017.57168637,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-04T09:00:00",
            opening_price: 87978000,
            trade_price: 95500000,
            high_price: 95586000,
            low_price: 87302000,
            candle_acc_trade_volume: 13254.11820787,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-05T09:00:00",
            opening_price: 95500000,
            trade_price: 91275000,
            high_price: 97000000,
            low_price: 88024000,
            candle_acc_trade_volume: 22134.5823534,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-06T09:00:00",
            opening_price: 91284000,
            trade_price: 93325000,
            high_price: 94917000,
            low_price: 88233000,
            candle_acc_trade_volume: 12290.20386486,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-07T09:00:00",
            opening_price: 93325000,
            trade_price: 94060000,
            high_price: 95678000,
            low_price: 92670000,
            candle_acc_trade_volume: 5792.49252841,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-08T09:00:00",
            opening_price: 94044000,
            trade_price: 96237000,
            high_price: 98543000,
            low_price: 94000000,
            candle_acc_trade_volume: 8721.93321965,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-09T09:00:00",
            opening_price: 96237000,
            trade_price: 95946000,
            high_price: 96420000,
            low_price: 95120000,
            candle_acc_trade_volume: 3946.68168858,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-10T09:00:00",
            opening_price: 95946000,
            trade_price: 97495000,
            high_price: 98445000,
            low_price: 95904000,
            candle_acc_trade_volume: 5997.98580277,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-11T09:00:00",
            opening_price: 97501000,
            trade_price: 100404000,
            high_price: 101940000,
            low_price: 95132000,
            candle_acc_trade_volume: 14017.56814882,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-12T09:00:00",
            opening_price: 100404000,
            trade_price: 101200000,
            high_price: 102350000,
            low_price: 99000000,
            candle_acc_trade_volume: 8326.93269496,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-13T09:00:00",
            opening_price: 101200000,
            trade_price: 104122000,
            high_price: 104865000,
            low_price: 100909000,
            candle_acc_trade_volume: 7708.11925332,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-14T09:00:00",
            opening_price: 104121000,
            trade_price: 102506000,
            high_price: 105000000,
            low_price: 100000000,
            candle_acc_trade_volume: 10526.11243481,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-15T09:00:00",
            opening_price: 102506000,
            trade_price: 101000000,
            high_price: 104131000,
            low_price: 95600000,
            candle_acc_trade_volume: 17862.96961701,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-16T09:00:00",
            opening_price: 101010000,
            trade_price: 96767000,
            high_price: 102407000,
            low_price: 95700000,
            candle_acc_trade_volume: 7805.49537673,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-17T09:00:00",
            opening_price: 96769000,
            trade_price: 99922000,
            high_price: 100299000,
            low_price: 94300000,
            candle_acc_trade_volume: 10512.20194197,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-18T09:00:00",
            opening_price: 99934000,
            trade_price: 99040000,
            high_price: 100233000,
            low_price: 97623000,
            candle_acc_trade_volume: 6061.17057346,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-19T09:00:00",
            opening_price: 99042000,
            trade_price: 92572000,
            high_price: 99700000,
            low_price: 92027000,
            candle_acc_trade_volume: 14040.62247096,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-20T09:00:00",
            opening_price: 92541000,
            trade_price: 99726000,
            high_price: 100216000,
            low_price: 89845000,
            candle_acc_trade_volume: 14156.97655657,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-21T09:00:00",
            opening_price: 99726000,
            trade_price: 95552000,
            high_price: 99801000,
            low_price: 95000000,
            candle_acc_trade_volume: 7441.53702699,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-22T09:00:00",
            opening_price: 95618000,
            trade_price: 93855000,
            high_price: 96500000,
            low_price: 92222000,
            candle_acc_trade_volume: 6646.70819911,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-23T09:00:00",
            opening_price: 93850000,
            trade_price: 93274000,
            high_price: 95609000,
            low_price: 92593000,
            candle_acc_trade_volume: 3672.55444643,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-24T09:00:00",
            opening_price: 93317000,
            trade_price: 96624000,
            high_price: 97252000,
            low_price: 93079000,
            candle_acc_trade_volume: 3888.32456609,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-25T09:00:00",
            opening_price: 96624000,
            trade_price: 99202000,
            high_price: 100500000,
            low_price: 95600000,
            candle_acc_trade_volume: 7510.92358508,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-26T09:00:00",
            opening_price: 99202000,
            trade_price: 100051000,
            high_price: 100800000,
            low_price: 98830000,
            candle_acc_trade_volume: 5187.8255505,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-27T09:00:00",
            opening_price: 100051000,
            trade_price: 99890000,
            high_price: 101900000,
            low_price: 98700000,
            candle_acc_trade_volume: 6873.29706874,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-28T09:00:00",
            opening_price: 99890000,
            trade_price: 100900000,
            high_price: 101725000,
            low_price: 99251000,
            candle_acc_trade_volume: 5332.23099753,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-29T09:00:00",
            opening_price: 100900000,
            trade_price: 99801000,
            high_price: 101100000,
            low_price: 99210000,
            candle_acc_trade_volume: 4351.27001019,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-30T09:00:00",
            opening_price: 99876000,
            trade_price: 99985000,
            high_price: 100317000,
            low_price: 99455000,
            candle_acc_trade_volume: 1962.11149493,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-03-31T09:00:00",
            opening_price: 99985000,
            trade_price: 100970000,
            high_price: 101133000,
            low_price: 99930000,
            candle_acc_trade_volume: 2112.03397974,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-01T09:00:00",
            opening_price: 100991000,
            trade_price: 100100000,
            high_price: 101098000,
            low_price: 98658000,
            candle_acc_trade_volume: 4739.72230488,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-02T09:00:00",
            opening_price: 100100000,
            trade_price: 96053000,
            high_price: 100100000,
            low_price: 95000000,
            candle_acc_trade_volume: 8066.15019928,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-03T09:00:00",
            opening_price: 96053000,
            trade_price: 96502000,
            high_price: 97300000,
            low_price: 94682000,
            candle_acc_trade_volume: 4274.27113577,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-04T09:00:00",
            opening_price: 96502000,
            trade_price: 99361000,
            high_price: 99912000,
            low_price: 95598000,
            candle_acc_trade_volume: 4377.11634387,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-05T09:00:00",
            opening_price: 99445000,
            trade_price: 98394000,
            high_price: 99669000,
            low_price: 96800000,
            candle_acc_trade_volume: 3533.18774879,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-06T09:00:00",
            opening_price: 98385000,
            trade_price: 99023000,
            high_price: 99888000,
            low_price: 97745000,
            candle_acc_trade_volume: 1885.55868844,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-07T09:00:00",
            opening_price: 99000000,
            trade_price: 99369000,
            high_price: 100450000,
            low_price: 98976000,
            candle_acc_trade_volume: 2132.30263827,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-08T09:00:00",
            opening_price: 99369000,
            trade_price: 102101000,
            high_price: 103084000,
            low_price: 99100000,
            candle_acc_trade_volume: 5621.6941615,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-09T09:00:00",
            opening_price: 102050000,
            trade_price: 99350000,
            high_price: 102399000,
            low_price: 98400000,
            candle_acc_trade_volume: 4778.27379895,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-10T09:00:00",
            opening_price: 99409000,
            trade_price: 100600000,
            high_price: 101750000,
            low_price: 97614000,
            candle_acc_trade_volume: 4307.83087037,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-11T09:00:00",
            opening_price: 100601000,
            trade_price: 100541000,
            high_price: 101452000,
            low_price: 100031000,
            candle_acc_trade_volume: 3026.45443123,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-12T09:00:00",
            opening_price: 100542000,
            trade_price: 99776000,
            high_price: 101426000,
            low_price: 98985000,
            candle_acc_trade_volume: 5005.55856794,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-13T09:00:00",
            opening_price: 99645000,
            trade_price: 97149000,
            high_price: 100569000,
            low_price: 95000000,
            candle_acc_trade_volume: 9545.1942808,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-14T09:00:00",
            opening_price: 97092000,
            trade_price: 98905000,
            high_price: 99180000,
            low_price: 95224000,
            candle_acc_trade_volume: 6601.79791673,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-15T09:00:00",
            opening_price: 98931000,
            trade_price: 96527000,
            high_price: 99490000,
            low_price: 95702000,
            candle_acc_trade_volume: 5860.57730753,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-16T09:00:00",
            opening_price: 96530000,
            trade_price: 95597000,
            high_price: 96941000,
            low_price: 93500000,
            candle_acc_trade_volume: 6058.36670549,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-17T09:00:00",
            opening_price: 95597000,
            trade_price: 91419000,
            high_price: 96500000,
            low_price: 90200000,
            candle_acc_trade_volume: 7117.39044578,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-18T09:00:00",
            opening_price: 91439000,
            trade_price: 93356000,
            high_price: 94200000,
            low_price: 90000000,
            candle_acc_trade_volume: 5793.82700325,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-19T09:00:00",
            opening_price: 93392000,
            trade_price: 93390000,
            high_price: 95958000,
            low_price: 88500000,
            candle_acc_trade_volume: 8931.11165293,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-20T09:00:00",
            opening_price: 93390000,
            trade_price: 94805000,
            high_price: 95600000,
            low_price: 92615000,
            candle_acc_trade_volume: 2666.36468567,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-21T09:00:00",
            opening_price: 94840000,
            trade_price: 94868000,
            high_price: 95989000,
            low_price: 94312000,
            candle_acc_trade_volume: 2369.21252418,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-22T09:00:00",
            opening_price: 94911000,
            trade_price: 97192000,
            high_price: 97627000,
            low_price: 94622000,
            candle_acc_trade_volume: 3221.84889236,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-23T09:00:00",
            opening_price: 97239000,
            trade_price: 96045000,
            high_price: 97592000,
            low_price: 95246000,
            candle_acc_trade_volume: 3179.44418004,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-24T09:00:00",
            opening_price: 96071000,
            trade_price: 93534000,
            high_price: 96627000,
            low_price: 92734000,
            candle_acc_trade_volume: 3593.11116027,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-25T09:00:00",
            opening_price: 93518000,
            trade_price: 92745000,
            high_price: 94319000,
            low_price: 91213000,
            candle_acc_trade_volume: 3762.56315286,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-26T09:00:00",
            opening_price: 92761000,
            trade_price: 91951000,
            high_price: 93000000,
            low_price: 91465000,
            candle_acc_trade_volume: 2016.93752002,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-27T09:00:00",
            opening_price: 91955000,
            trade_price: 91499000,
            high_price: 92175000,
            low_price: 90292000,
            candle_acc_trade_volume: 2455.80711714,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-28T09:00:00",
            opening_price: 91499000,
            trade_price: 90530000,
            high_price: 92630000,
            low_price: 90153000,
            candle_acc_trade_volume: 1861.37990104,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-29T09:00:00",
            opening_price: 90533000,
            trade_price: 91400000,
            high_price: 92000000,
            low_price: 88500000,
            candle_acc_trade_volume: 4650.34162208,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-04-30T09:00:00",
            opening_price: 91400000,
            trade_price: 87137000,
            high_price: 92540000,
            low_price: 85606000,
            candle_acc_trade_volume: 7328.91773497,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-01T09:00:00",
            opening_price: 87152000,
            trade_price: 83499000,
            high_price: 87625000,
            low_price: 80005000,
            candle_acc_trade_volume: 15078.237548,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-02T09:00:00",
            opening_price: 83499000,
            trade_price: 83078000,
            high_price: 84000000,
            low_price: 80601000,
            candle_acc_trade_volume: 5609.70236742,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-03T09:00:00",
            opening_price: 83096000,
            trade_price: 89291000,
            high_price: 89821000,
            low_price: 82807000,
            candle_acc_trade_volume: 8040.2538403,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-04T09:00:00",
            opening_price: 89291000,
            trade_price: 90303000,
            high_price: 91123000,
            low_price: 87910000,
            candle_acc_trade_volume: 4208.08896117,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-05T09:00:00",
            opening_price: 90303000,
            trade_price: 90061000,
            high_price: 90759000,
            low_price: 88331000,
            candle_acc_trade_volume: 2550.73818403,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-06T09:00:00",
            opening_price: 90100000,
            trade_price: 88804000,
            high_price: 91681000,
            low_price: 88500000,
            candle_acc_trade_volume: 3986.16458238,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-07T09:00:00",
            opening_price: 88780000,
            trade_price: 87595000,
            high_price: 90157000,
            low_price: 87500000,
            candle_acc_trade_volume: 2916.803769,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-08T09:00:00",
            opening_price: 87595000,
            trade_price: 85872000,
            high_price: 88566000,
            low_price: 85109000,
            candle_acc_trade_volume: 3819.52775807,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-09T09:00:00",
            opening_price: 85872000,
            trade_price: 88116000,
            high_price: 88500000,
            low_price: 85020000,
            candle_acc_trade_volume: 3096.80934359,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-10T09:00:00",
            opening_price: 88116000,
            trade_price: 85842000,
            high_price: 88480000,
            low_price: 85120000,
            candle_acc_trade_volume: 3277.85722892,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-11T09:00:00",
            opening_price: 85842000,
            trade_price: 85791000,
            high_price: 86500000,
            low_price: 85209000,
            candle_acc_trade_volume: 1299.78149293,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-12T09:00:00",
            opening_price: 85791000,
            trade_price: 86521000,
            high_price: 86978000,
            low_price: 85618000,
            candle_acc_trade_volume: 1042.82371152,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-13T09:00:00",
            opening_price: 86521000,
            trade_price: 87928000,
            high_price: 88485000,
            low_price: 85410000,
            candle_acc_trade_volume: 3085.90700562,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-14T09:00:00",
            opening_price: 87934000,
            trade_price: 86500000,
            high_price: 88225000,
            low_price: 85801000,
            candle_acc_trade_volume: 2756.81157854,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-15T09:00:00",
            opening_price: 86500000,
            trade_price: 92111000,
            high_price: 92444000,
            low_price: 86200000,
            candle_acc_trade_volume: 5272.78652607,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-16T09:00:00",
            opening_price: 92111000,
            trade_price: 90800000,
            high_price: 92860000,
            low_price: 90250000,
            candle_acc_trade_volume: 3657.22884649,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-17T09:00:00",
            opening_price: 90839000,
            trade_price: 92646000,
            high_price: 93123000,
            low_price: 90700000,
            candle_acc_trade_volume: 2713.8193315,
        },
        {
            market: "KRW-BTC",
            candle_date_time_kst: "2024-05-18T09:00:00",
            opening_price: 92632000,
            trade_price: 92724000,
            high_price: 93500000,
            low_price: 92337000,
            candle_acc_trade_volume: 1640.99866762,
        },
    ];
    function calculateMovingAverages(data, shortPeriod, longPeriod) {
        data.forEach((row, index) => {
            if (index >= shortPeriod - 1) {
                const shortPrices = data
                    .slice(index - shortPeriod + 1, index + 1)
                    .map((d) => d.trade_price);
                row.short_avg_price =
                    shortPrices.reduce((acc, price) => acc + price, 0) /
                        shortPeriod;
            }
            if (index >= longPeriod - 1) {
                const longPrices = data
                    .slice(index - longPeriod + 1, index + 1)
                    .map((d) => d.trade_price);
                row.long_avg_price =
                    longPrices.reduce((acc, price) => acc + price, 0) /
                        longPeriod;
            }
        });
    }
    function calculateEMA(data, period) {
        const k = 2 / (period + 1);
        const emaArray = [data[0]];
        data.slice(1).forEach((value, index) => {
            const ema = value * k + emaArray[index] * (1 - k);
            emaArray.push(ema);
        });
        return emaArray;
    }
    function calculateMACD(data, shortPeriod, longPeriod, signalPeriod) {
        const tradePrices = data.map((d) => d.trade_price);
        const emaShort = calculateEMA(tradePrices, shortPeriod);
        const emaLong = calculateEMA(tradePrices, longPeriod);
        const macd = emaShort.map((value, index) => value - emaLong[index]);
        const signalLine = calculateEMA(macd, signalPeriod);
        data.forEach((row, index) => {
            row.macd = macd[index];
            row.signal_line = signalLine[index];
        });
    }
    function calculateTrendFollowingStrategy(data, shortPeriod, longPeriod, signalPeriod) {
        calculateMovingAverages(data, shortPeriod, longPeriod);
        calculateMACD(data, shortPeriod, longPeriod, signalPeriod);
        data.forEach((row, index) => {
            if (index >= longPeriod - 1) {
                if (row.macd !== undefined && row.signal_line !== undefined) {
                    if (row.macd > row.signal_line &&
                        row.short_avg_price &&
                        row.long_avg_price &&
                        row.short_avg_price > row.long_avg_price) {
                        row.signal = 1;
                    }
                    else if (row.macd < row.signal_line &&
                        row.short_avg_price &&
                        row.long_avg_price &&
                        row.short_avg_price < row.long_avg_price) {
                        row.signal = -1;
                    }
                    else {
                        row.signal = 0;
                    }
                }
            }
            else {
                row.signal = 0;
            }
        });
    }
    function backtestTrendFollowingStrategy(data, initialCapital) {
        let capital = initialCapital;
        let position = 0;
        let tradeCount = 0;
        data.forEach((row) => {
            if (row.signal === 1 && capital > 0) {
                position = capital / row.trade_price;
                capital = 0;
                tradeCount++;
            }
            else if (row.signal === -1 && position > 0) {
                capital = position * row.trade_price;
                position = 0;
                tradeCount++;
            }
            row.capital = capital + position * row.trade_price;
        });
        return { data, tradeCount };
    }
    const initialCapital = 10000;
    const shortPeriod = 12;
    const longPeriod = 26;
    const signalPeriod = 9;
    calculateTrendFollowingStrategy(data, shortPeriod, longPeriod, signalPeriod);
    const { data: trendFollowingResult, tradeCount } = backtestTrendFollowingStrategy(data, initialCapital);
    const finalCapitalTrendFollowing = trendFollowingResult[trendFollowingResult.length - 1].capital;
    const returnRateTrendFollowing = (finalCapitalTrendFollowing / initialCapital - 1) * 100;
    console.log("Trend Following Strategy Results:");
    console.log(trendFollowingResult.slice(-10));
    console.log(`Final Capital: ${finalCapitalTrendFollowing}`);
    console.log(`Return Rate: ${returnRateTrendFollowing.toFixed(2)}%`);
    console.log(`Trade Count: ${tradeCount}`);
}
