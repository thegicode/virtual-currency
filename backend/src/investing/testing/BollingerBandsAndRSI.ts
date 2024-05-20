{
    //  볼린저 밴드와 RSI 결합 전략
    const data = [
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-11T09:00:00",
            opening_price: 4115,
            trade_price: 4230,
            high_price: 4344,
            low_price: 4103,
            candle_acc_trade_volume: 3712475.29186528,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-12T09:00:00",
            opening_price: 4232,
            trade_price: 4539,
            high_price: 4560,
            low_price: 4165,
            candle_acc_trade_volume: 6891011.10823005,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-13T09:00:00",
            opening_price: 4539,
            trade_price: 4360,
            high_price: 4623,
            low_price: 4305,
            candle_acc_trade_volume: 4567136.14489274,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-14T09:00:00",
            opening_price: 4360,
            trade_price: 4524,
            high_price: 4652,
            low_price: 4291,
            candle_acc_trade_volume: 4478712.74577238,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-15T09:00:00",
            opening_price: 4524,
            trade_price: 4670,
            high_price: 4670,
            low_price: 4466,
            candle_acc_trade_volume: 5777961.76178824,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-16T09:00:00",
            opening_price: 4667,
            trade_price: 4542,
            high_price: 4756,
            low_price: 4409,
            candle_acc_trade_volume: 5027647.59255596,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-17T09:00:00",
            opening_price: 4543,
            trade_price: 4613,
            high_price: 4635,
            low_price: 4333,
            candle_acc_trade_volume: 3099125.00476909,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-18T09:00:00",
            opening_price: 4613,
            trade_price: 4852,
            high_price: 4927,
            low_price: 4510,
            candle_acc_trade_volume: 5257984.72194327,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-19T09:00:00",
            opening_price: 4858,
            trade_price: 4890,
            high_price: 4994,
            low_price: 4792,
            candle_acc_trade_volume: 4829463.46783665,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-20T09:00:00",
            opening_price: 4898,
            trade_price: 4695,
            high_price: 4927,
            low_price: 4540,
            candle_acc_trade_volume: 5017329.40773406,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-21T09:00:00",
            opening_price: 4694,
            trade_price: 4525,
            high_price: 4694,
            low_price: 4351,
            candle_acc_trade_volume: 3535423.29827287,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-22T09:00:00",
            opening_price: 4524,
            trade_price: 4541,
            high_price: 4660,
            low_price: 4361,
            candle_acc_trade_volume: 3036588.22570654,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-23T09:00:00",
            opening_price: 4533,
            trade_price: 4695,
            high_price: 4778,
            low_price: 4425,
            candle_acc_trade_volume: 3998823.31827243,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-24T09:00:00",
            opening_price: 4694,
            trade_price: 5332,
            high_price: 5410,
            low_price: 4592,
            candle_acc_trade_volume: 8861217.62369248,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-25T09:00:00",
            opening_price: 5332,
            trade_price: 5110,
            high_price: 5350,
            low_price: 5035,
            candle_acc_trade_volume: 4220651.62065042,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-26T09:00:00",
            opening_price: 5106,
            trade_price: 5617,
            high_price: 5765,
            low_price: 5036,
            candle_acc_trade_volume: 13835126.38022751,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-27T09:00:00",
            opening_price: 5617,
            trade_price: 5437,
            high_price: 5698,
            low_price: 5351,
            candle_acc_trade_volume: 6043275.25307667,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-28T09:00:00",
            opening_price: 5444,
            trade_price: 5478,
            high_price: 5649,
            low_price: 5107,
            candle_acc_trade_volume: 9621543.69101244,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-02-29T09:00:00",
            opening_price: 5469,
            trade_price: 5450,
            high_price: 5698,
            low_price: 5321,
            candle_acc_trade_volume: 8632069.15269535,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-01T09:00:00",
            opening_price: 5460,
            trade_price: 5563,
            high_price: 5837,
            low_price: 5449,
            candle_acc_trade_volume: 6636411.11717335,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-02T09:00:00",
            opening_price: 5563,
            trade_price: 6287,
            high_price: 6450,
            low_price: 5475,
            candle_acc_trade_volume: 11200083.57103056,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-03T09:00:00",
            opening_price: 6287,
            trade_price: 6190,
            high_price: 6300,
            low_price: 5415,
            candle_acc_trade_volume: 10969069.74803309,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-04T09:00:00",
            opening_price: 6190,
            trade_price: 6089,
            high_price: 7081,
            low_price: 5930,
            candle_acc_trade_volume: 18304227.31205948,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-05T09:00:00",
            opening_price: 6089,
            trade_price: 6089,
            high_price: 6370,
            low_price: 5432,
            candle_acc_trade_volume: 14019919.0140357,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-06T09:00:00",
            opening_price: 6086,
            trade_price: 8329,
            high_price: 8673,
            low_price: 5630,
            candle_acc_trade_volume: 41736460.15494328,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-07T09:00:00",
            opening_price: 8340,
            trade_price: 7763,
            high_price: 9800,
            low_price: 7672,
            candle_acc_trade_volume: 48035657.40805954,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-08T09:00:00",
            opening_price: 7768,
            trade_price: 8108,
            high_price: 8174,
            low_price: 7390,
            candle_acc_trade_volume: 19667648.89535184,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-09T09:00:00",
            opening_price: 8109,
            trade_price: 8708,
            high_price: 9167,
            low_price: 7888,
            candle_acc_trade_volume: 24137940.14027211,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-10T09:00:00",
            opening_price: 8714,
            trade_price: 8429,
            high_price: 8900,
            low_price: 8181,
            candle_acc_trade_volume: 9100028.33702208,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-11T09:00:00",
            opening_price: 8431,
            trade_price: 9280,
            high_price: 10390,
            low_price: 7880,
            candle_acc_trade_volume: 44272973.6748556,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-12T09:00:00",
            opening_price: 9280,
            trade_price: 11260,
            high_price: 11270,
            low_price: 9210,
            candle_acc_trade_volume: 28544831.86479865,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-13T09:00:00",
            opening_price: 11270,
            trade_price: 11070,
            high_price: 12040,
            low_price: 10750,
            candle_acc_trade_volume: 15802238.35427864,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-14T09:00:00",
            opening_price: 11070,
            trade_price: 12730,
            high_price: 12810,
            low_price: 10560,
            candle_acc_trade_volume: 18351552.52759772,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-15T09:00:00",
            opening_price: 12730,
            trade_price: 10920,
            high_price: 13050,
            low_price: 10310,
            candle_acc_trade_volume: 35414324.45272606,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-16T09:00:00",
            opening_price: 10920,
            trade_price: 9958,
            high_price: 11540,
            low_price: 9543,
            candle_acc_trade_volume: 26038150.87152007,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-17T09:00:00",
            opening_price: 9958,
            trade_price: 12070,
            high_price: 12300,
            low_price: 9535,
            candle_acc_trade_volume: 34501149.2426295,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-18T09:00:00",
            opening_price: 12070,
            trade_price: 10320,
            high_price: 12620,
            low_price: 10160,
            candle_acc_trade_volume: 37161732.54580198,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-19T09:00:00",
            opening_price: 10310,
            trade_price: 9492,
            high_price: 10440,
            low_price: 9269,
            candle_acc_trade_volume: 35910276.41254989,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-20T09:00:00",
            opening_price: 9494,
            trade_price: 10200,
            high_price: 10300,
            low_price: 8891,
            candle_acc_trade_volume: 23409815.93683829,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-21T09:00:00",
            opening_price: 10200,
            trade_price: 9410,
            high_price: 10200,
            low_price: 9400,
            candle_acc_trade_volume: 9838626.33443644,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-22T09:00:00",
            opening_price: 9410,
            trade_price: 9554,
            high_price: 9945,
            low_price: 9020,
            candle_acc_trade_volume: 11633914.17426835,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-23T09:00:00",
            opening_price: 9553,
            trade_price: 9645,
            high_price: 9870,
            low_price: 9308,
            candle_acc_trade_volume: 5855501.19904961,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-24T09:00:00",
            opening_price: 9645,
            trade_price: 10070,
            high_price: 10090,
            low_price: 9365,
            candle_acc_trade_volume: 5198786.64223406,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-25T09:00:00",
            opening_price: 10070,
            trade_price: 10580,
            high_price: 10950,
            low_price: 10010,
            candle_acc_trade_volume: 12007203.33745151,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-26T09:00:00",
            opening_price: 10580,
            trade_price: 10950,
            high_price: 11480,
            low_price: 10510,
            candle_acc_trade_volume: 11434844.97296078,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-27T09:00:00",
            opening_price: 10940,
            trade_price: 10450,
            high_price: 11200,
            low_price: 10260,
            candle_acc_trade_volume: 8780568.83650814,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-28T09:00:00",
            opening_price: 10450,
            trade_price: 10260,
            high_price: 10620,
            low_price: 10210,
            candle_acc_trade_volume: 5274029.49500466,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-29T09:00:00",
            opening_price: 10270,
            trade_price: 9963,
            high_price: 10300,
            low_price: 9838,
            candle_acc_trade_volume: 4051031.28176651,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-30T09:00:00",
            opening_price: 9963,
            trade_price: 9975,
            high_price: 10460,
            low_price: 9883,
            candle_acc_trade_volume: 3509382.46913319,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-03-31T09:00:00",
            opening_price: 9975,
            trade_price: 10330,
            high_price: 10490,
            low_price: 9907,
            candle_acc_trade_volume: 3091610.33246581,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-01T09:00:00",
            opening_price: 10330,
            trade_price: 9710,
            high_price: 10450,
            low_price: 9513,
            candle_acc_trade_volume: 5905799.9956901,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-02T09:00:00",
            opening_price: 9700,
            trade_price: 9128,
            high_price: 9709,
            low_price: 8981,
            candle_acc_trade_volume: 5183268.49190337,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-03T09:00:00",
            opening_price: 9128,
            trade_price: 9644,
            high_price: 10030,
            low_price: 8790,
            candle_acc_trade_volume: 11336488.8907823,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-04T09:00:00",
            opening_price: 9639,
            trade_price: 9795,
            high_price: 10200,
            low_price: 9306,
            candle_acc_trade_volume: 8189034.13758643,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-05T09:00:00",
            opening_price: 9792,
            trade_price: 10480,
            high_price: 10850,
            low_price: 9471,
            candle_acc_trade_volume: 11209598.4720924,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-06T09:00:00",
            opening_price: 10470,
            trade_price: 10110,
            high_price: 10600,
            low_price: 9981,
            candle_acc_trade_volume: 3708871.59879716,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-07T09:00:00",
            opening_price: 10110,
            trade_price: 9916,
            high_price: 10230,
            low_price: 9817,
            candle_acc_trade_volume: 3102772.65346355,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-08T09:00:00",
            opening_price: 9916,
            trade_price: 10490,
            high_price: 10760,
            low_price: 9798,
            candle_acc_trade_volume: 7623560.31100332,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-09T09:00:00",
            opening_price: 10490,
            trade_price: 10400,
            high_price: 10960,
            low_price: 10230,
            candle_acc_trade_volume: 8417970.30735617,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-10T09:00:00",
            opening_price: 10400,
            trade_price: 9975,
            high_price: 10560,
            low_price: 9653,
            candle_acc_trade_volume: 5928031.89186089,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-11T09:00:00",
            opening_price: 9975,
            trade_price: 9768,
            high_price: 10430,
            low_price: 9710,
            candle_acc_trade_volume: 5067481.21307279,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-12T09:00:00",
            opening_price: 9768,
            trade_price: 8638,
            high_price: 9864,
            low_price: 8210,
            candle_acc_trade_volume: 7031502.94816287,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-13T09:00:00",
            opening_price: 8637,
            trade_price: 7910,
            high_price: 8685,
            low_price: 6617,
            candle_acc_trade_volume: 10903110.95525291,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-14T09:00:00",
            opening_price: 7910,
            trade_price: 8615,
            high_price: 8655,
            low_price: 7520,
            candle_acc_trade_volume: 8500324.98854762,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-15T09:00:00",
            opening_price: 8622,
            trade_price: 7966,
            high_price: 8760,
            low_price: 7638,
            candle_acc_trade_volume: 10077660.09220431,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-16T09:00:00",
            opening_price: 7966,
            trade_price: 8227,
            high_price: 8319,
            low_price: 7417,
            candle_acc_trade_volume: 8897106.16722383,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-17T09:00:00",
            opening_price: 8228,
            trade_price: 8072,
            high_price: 8439,
            low_price: 7812,
            candle_acc_trade_volume: 6892110.12526972,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-18T09:00:00",
            opening_price: 8072,
            trade_price: 8396,
            high_price: 8660,
            low_price: 7770,
            candle_acc_trade_volume: 8065680.11718707,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-19T09:00:00",
            opening_price: 8396,
            trade_price: 8179,
            high_price: 8551,
            low_price: 7750,
            candle_acc_trade_volume: 6970149.18125665,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-20T09:00:00",
            opening_price: 8179,
            trade_price: 9070,
            high_price: 9132,
            low_price: 8100,
            candle_acc_trade_volume: 5389173.48366445,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-21T09:00:00",
            opening_price: 9070,
            trade_price: 9423,
            high_price: 9483,
            low_price: 8876,
            candle_acc_trade_volume: 4690206.0956411,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-22T09:00:00",
            opening_price: 9423,
            trade_price: 10200,
            high_price: 10500,
            low_price: 9280,
            candle_acc_trade_volume: 8482615.48986833,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-23T09:00:00",
            opening_price: 10220,
            trade_price: 9977,
            high_price: 10540,
            low_price: 9889,
            candle_acc_trade_volume: 5905238.50278626,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-24T09:00:00",
            opening_price: 9977,
            trade_price: 9971,
            high_price: 10600,
            low_price: 9760,
            candle_acc_trade_volume: 7160721.60047344,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-25T09:00:00",
            opening_price: 9971,
            trade_price: 10260,
            high_price: 10430,
            low_price: 9535,
            candle_acc_trade_volume: 8722252.24915549,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-26T09:00:00",
            opening_price: 10260,
            trade_price: 9980,
            high_price: 10800,
            low_price: 9947,
            candle_acc_trade_volume: 8585163.02807447,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-27T09:00:00",
            opening_price: 9980,
            trade_price: 10300,
            high_price: 10970,
            low_price: 9741,
            candle_acc_trade_volume: 9700510.76339962,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-28T09:00:00",
            opening_price: 10300,
            trade_price: 10110,
            high_price: 10710,
            low_price: 10070,
            candle_acc_trade_volume: 5924666.06075937,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-29T09:00:00",
            opening_price: 10110,
            trade_price: 9843,
            high_price: 10190,
            low_price: 9559,
            candle_acc_trade_volume: 5578795.35406291,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-04-30T09:00:00",
            opening_price: 9843,
            trade_price: 8893,
            high_price: 9898,
            low_price: 8470,
            candle_acc_trade_volume: 8744582.71993049,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-01T09:00:00",
            opening_price: 8896,
            trade_price: 8784,
            high_price: 9180,
            low_price: 8098,
            candle_acc_trade_volume: 9857678.81574853,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-02T09:00:00",
            opening_price: 8784,
            trade_price: 8548,
            high_price: 8854,
            low_price: 8300,
            candle_acc_trade_volume: 5225150.36183485,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-03T09:00:00",
            opening_price: 8557,
            trade_price: 9746,
            high_price: 9815,
            low_price: 8493,
            candle_acc_trade_volume: 9698165.37818376,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-04T09:00:00",
            opening_price: 9749,
            trade_price: 9710,
            high_price: 9882,
            low_price: 9536,
            candle_acc_trade_volume: 5259097.69061594,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-05T09:00:00",
            opening_price: 9710,
            trade_price: 10530,
            high_price: 10590,
            low_price: 9395,
            candle_acc_trade_volume: 6916123.15848298,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-06T09:00:00",
            opening_price: 10530,
            trade_price: 10260,
            high_price: 10620,
            low_price: 10040,
            candle_acc_trade_volume: 8286584.47105604,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-07T09:00:00",
            opening_price: 10260,
            trade_price: 10020,
            high_price: 11080,
            low_price: 10000,
            candle_acc_trade_volume: 13337531.01887871,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-08T09:00:00",
            opening_price: 10010,
            trade_price: 9567,
            high_price: 10270,
            low_price: 9518,
            candle_acc_trade_volume: 8292283.288432,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-09T09:00:00",
            opening_price: 9564,
            trade_price: 10440,
            high_price: 10450,
            low_price: 9550,
            candle_acc_trade_volume: 8971784.41095059,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-10T09:00:00",
            opening_price: 10440,
            trade_price: 10240,
            high_price: 10680,
            low_price: 10080,
            candle_acc_trade_volume: 6893430.05546849,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-11T09:00:00",
            opening_price: 10240,
            trade_price: 9902,
            high_price: 10330,
            low_price: 9873,
            candle_acc_trade_volume: 4199067.00002059,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-12T09:00:00",
            opening_price: 9902,
            trade_price: 9709,
            high_price: 9969,
            low_price: 9670,
            candle_acc_trade_volume: 2825467.4269575,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-13T09:00:00",
            opening_price: 9709,
            trade_price: 10190,
            high_price: 10300,
            low_price: 9200,
            candle_acc_trade_volume: 7379572.31901486,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-14T09:00:00",
            opening_price: 10200,
            trade_price: 9879,
            high_price: 10340,
            low_price: 9734,
            candle_acc_trade_volume: 7673334.98514372,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-15T09:00:00",
            opening_price: 9879,
            trade_price: 11200,
            high_price: 11240,
            low_price: 9650,
            candle_acc_trade_volume: 12573956.60702045,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-16T09:00:00",
            opening_price: 11200,
            trade_price: 11160,
            high_price: 11540,
            low_price: 10890,
            candle_acc_trade_volume: 8769107.43159982,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-17T09:00:00",
            opening_price: 11170,
            trade_price: 11130,
            high_price: 11780,
            low_price: 11020,
            candle_acc_trade_volume: 8960548.52079778,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-18T09:00:00",
            opening_price: 11140,
            trade_price: 11030,
            high_price: 11250,
            low_price: 10900,
            candle_acc_trade_volume: 4240320.25037888,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-19T09:00:00",
            opening_price: 11020,
            trade_price: 10820,
            high_price: 11090,
            low_price: 10600,
            candle_acc_trade_volume: 3809910.53419692,
        },
        {
            market: "KRW-NEAR",
            candle_date_time_kst: "2024-05-20T09:00:00",
            opening_price: 10830,
            trade_price: 11110,
            high_price: 11110,
            low_price: 10680,
            candle_acc_trade_volume: 1353672.58823432,
        },
    ];

    interface DataPoint {
        market: string;
        candle_date_time_kst: string;
        trade_price: number;
        avg_price?: number; // Optional as it will be calculated
        upper_band?: number; // Optional for Bollinger Bands
        lower_band?: number; // Optional for Bollinger Bands
        rsi?: number; // Optional for RSI
        signal?: number; // Optional as it will be calculated
        capital?: number; // Optional as it will be calculated during backtest
    }

    // RSI 계산 함수
    function calculateRSI(data: DataPoint[], n: number): void {
        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= n; i++) {
            const change = data[i].trade_price - data[i - 1].trade_price;
            if (change > 0) {
                gains += change;
            } else {
                losses -= change;
            }
        }

        let avgGain = gains / n;
        let avgLoss = losses / n;
        data[n].rsi = 100 - 100 / (1 + avgGain / avgLoss);

        for (let i = n + 1; i < data.length; i++) {
            const change = data[i].trade_price - data[i - 1].trade_price;
            if (change > 0) {
                avgGain = (avgGain * (n - 1) + change) / n;
                avgLoss = (avgLoss * (n - 1)) / n;
            } else {
                avgGain = (avgGain * (n - 1)) / n;
                avgLoss = (avgLoss * (n - 1) - change) / n;
            }
            data[i].rsi = 100 - 100 / (1 + avgGain / avgLoss);
        }
    }

    // 볼린저 밴드와 RSI 결합 전략을 적용하기 위한 함수
    function calculateBollingerBandsAndRSI(
        data: DataPoint[],
        n: number,
        k: number,
        rsiPeriod: number
    ): void {
        calculateRSI(data, rsiPeriod);

        data.forEach((row, index) => {
            if (index >= n) {
                const prices = data
                    .slice(index - n, index)
                    .map((d) => d.trade_price);
                const avgPrice =
                    prices.reduce((acc, price) => acc + price, 0) / n;
                const stdDev = Math.sqrt(
                    prices
                        .map((price) => Math.pow(price - avgPrice, 2))
                        .reduce((acc, diff) => acc + diff, 0) / n
                );
                const upperBand = avgPrice + k * stdDev;
                const lowerBand = avgPrice - k * stdDev;
                row.avg_price = avgPrice;
                row.upper_band = upperBand;
                row.lower_band = lowerBand;

                if (row.rsi && row.rsi < 30 && row.trade_price < lowerBand) {
                    row.signal = 1; // 매수 신호
                } else if (
                    row.rsi &&
                    row.rsi > 70 &&
                    row.trade_price > upperBand
                ) {
                    row.signal = -1; // 매도 신호
                } else {
                    row.signal = 0;
                }
            } else {
                row.signal = 0;
            }
        });
    }

    // 백테스트 함수
    function backtestBollingerBandsAndRSI(
        data: DataPoint[],
        initialCapital: number
    ): DataPoint[] {
        let capital = initialCapital;
        let position = 0;

        data.forEach((row) => {
            if (row.signal === 1 && capital > 0) {
                // 매수
                position = capital / row.trade_price;
                capital = 0;
            } else if (row.signal === -1 && position > 0) {
                // 매도
                capital = position * row.trade_price;
                position = 0;
            }
            row.capital = capital + position * row.trade_price; // 현재 자본 계산
        });

        return data;
    }

    // 볼린저 밴드와 RSI 결합 전략 계산 및 백테스트
    const initialCapital = 10000; // 초기 자본
    const n = 20; // 볼린저 밴드 이동 평균 기간
    const k = 2; // 볼린저 밴드 표준 편차 계수
    const rsiPeriod = 14; // RSI 기간

    calculateBollingerBandsAndRSI(data, n, k, rsiPeriod);
    const bollingerBandsAndRSIResult = backtestBollingerBandsAndRSI(
        data,
        initialCapital
    );

    const finalCapitalBollingerBandsAndRSI =
        bollingerBandsAndRSIResult[bollingerBandsAndRSIResult.length - 1]
            .capital;
    const returnRateBollingerBandsAndRSI =
        (finalCapitalBollingerBandsAndRSI! / initialCapital - 1) * 100;

    console.log("Bollinger Bands and RSI Strategy Results:");
    console.log(bollingerBandsAndRSIResult.slice(-10));
    console.log(`Final Capital: ${finalCapitalBollingerBandsAndRSI}`);
    console.log(`Return Rate: ${returnRateBollingerBandsAndRSI.toFixed(2)}%`);
}
