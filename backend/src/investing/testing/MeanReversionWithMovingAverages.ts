{
    // 이동 평균 교차와 평균 회귀 전략 결합

    const data = [
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-09T09:00:00",
            opening_price: 5076,
            trade_price: 5127,
            high_price: 5223,
            low_price: 5030,
            candle_acc_trade_volume: 967190.94559665,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-10T09:00:00",
            opening_price: 5127,
            trade_price: 5224,
            high_price: 5524,
            low_price: 5115,
            candle_acc_trade_volume: 3743923.25063614,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-11T09:00:00",
            opening_price: 5220,
            trade_price: 5411,
            high_price: 5725,
            low_price: 5195,
            candle_acc_trade_volume: 12063723.66578983,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-12T09:00:00",
            opening_price: 5411,
            trade_price: 5328,
            high_price: 5419,
            low_price: 5240,
            candle_acc_trade_volume: 1137257.06966958,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-13T09:00:00",
            opening_price: 5328,
            trade_price: 5228,
            high_price: 5372,
            low_price: 5180,
            candle_acc_trade_volume: 629403.75317032,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-14T09:00:00",
            opening_price: 5228,
            trade_price: 5291,
            high_price: 5295,
            low_price: 5195,
            candle_acc_trade_volume: 418174.17917441,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-15T09:00:00",
            opening_price: 5291,
            trade_price: 5415,
            high_price: 5507,
            low_price: 5247,
            candle_acc_trade_volume: 1473638.41348762,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-16T09:00:00",
            opening_price: 5415,
            trade_price: 5518,
            high_price: 5582,
            low_price: 5360,
            candle_acc_trade_volume: 1511162.29580489,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-17T09:00:00",
            opening_price: 5518,
            trade_price: 5525,
            high_price: 5530,
            low_price: 5303,
            candle_acc_trade_volume: 763448.63493437,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-18T09:00:00",
            opening_price: 5520,
            trade_price: 5521,
            high_price: 5615,
            low_price: 5409,
            candle_acc_trade_volume: 853657.76336559,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-19T09:00:00",
            opening_price: 5521,
            trade_price: 5625,
            high_price: 5648,
            low_price: 5460,
            candle_acc_trade_volume: 870256.96199787,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-20T09:00:00",
            opening_price: 5625,
            trade_price: 5654,
            high_price: 5689,
            low_price: 5530,
            candle_acc_trade_volume: 925495.51631013,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-21T09:00:00",
            opening_price: 5655,
            trade_price: 5642,
            high_price: 5739,
            low_price: 5522,
            candle_acc_trade_volume: 873648.08122413,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-22T09:00:00",
            opening_price: 5642,
            trade_price: 5698,
            high_price: 5698,
            low_price: 5550,
            candle_acc_trade_volume: 462000.52379116,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-23T09:00:00",
            opening_price: 5695,
            trade_price: 5693,
            high_price: 5713,
            low_price: 5582,
            candle_acc_trade_volume: 514490.20511743,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-24T09:00:00",
            opening_price: 5684,
            trade_price: 5667,
            high_price: 5715,
            low_price: 5618,
            candle_acc_trade_volume: 411959.28877448,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-25T09:00:00",
            opening_price: 5667,
            trade_price: 5564,
            high_price: 5795,
            low_price: 5485,
            candle_acc_trade_volume: 634029.47825138,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-26T09:00:00",
            opening_price: 5564,
            trade_price: 5590,
            high_price: 5601,
            low_price: 5371,
            candle_acc_trade_volume: 609748.39163406,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-27T09:00:00",
            opening_price: 5566,
            trade_price: 5595,
            high_price: 5607,
            low_price: 5482,
            candle_acc_trade_volume: 707796.20889481,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-28T09:00:00",
            opening_price: 5595,
            trade_price: 5697,
            high_price: 5793,
            low_price: 5505,
            candle_acc_trade_volume: 1395258.3043256,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-02-29T09:00:00",
            opening_price: 5694,
            trade_price: 6126,
            high_price: 6150,
            low_price: 5605,
            candle_acc_trade_volume: 2870621.11826305,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-01T09:00:00",
            opening_price: 6110,
            trade_price: 6508,
            high_price: 6509,
            low_price: 6000,
            candle_acc_trade_volume: 1714254.69988737,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-02T09:00:00",
            opening_price: 6502,
            trade_price: 6719,
            high_price: 6746,
            low_price: 6296,
            candle_acc_trade_volume: 2609092.20997614,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-03T09:00:00",
            opening_price: 6719,
            trade_price: 6516,
            high_price: 6749,
            low_price: 5923,
            candle_acc_trade_volume: 1889056.91291426,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-04T09:00:00",
            opening_price: 6516,
            trade_price: 6720,
            high_price: 6761,
            low_price: 6305,
            candle_acc_trade_volume: 2172144.5095158,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-05T09:00:00",
            opening_price: 6720,
            trade_price: 6611,
            high_price: 7373,
            low_price: 6102,
            candle_acc_trade_volume: 6130213.74500295,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-06T09:00:00",
            opening_price: 6611,
            trade_price: 6811,
            high_price: 7953,
            low_price: 6231,
            candle_acc_trade_volume: 13750468.70933214,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-07T09:00:00",
            opening_price: 6812,
            trade_price: 6922,
            high_price: 7186,
            low_price: 6615,
            candle_acc_trade_volume: 3248141.44174599,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-08T09:00:00",
            opening_price: 6921,
            trade_price: 6837,
            high_price: 6921,
            low_price: 6628,
            candle_acc_trade_volume: 1425533.87622436,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-09T09:00:00",
            opening_price: 6836,
            trade_price: 6901,
            high_price: 6923,
            low_price: 6690,
            candle_acc_trade_volume: 902822.67777936,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-10T09:00:00",
            opening_price: 6901,
            trade_price: 6999,
            high_price: 7110,
            low_price: 6760,
            candle_acc_trade_volume: 2764470.06793028,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-11T09:00:00",
            opening_price: 6999,
            trade_price: 7088,
            high_price: 7350,
            low_price: 6749,
            candle_acc_trade_volume: 4652032.67243854,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-12T09:00:00",
            opening_price: 7088,
            trade_price: 7233,
            high_price: 7244,
            low_price: 6883,
            candle_acc_trade_volume: 1401817.12433633,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-13T09:00:00",
            opening_price: 7233,
            trade_price: 7310,
            high_price: 7372,
            low_price: 7073,
            candle_acc_trade_volume: 1617681.28229757,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-14T09:00:00",
            opening_price: 7308,
            trade_price: 7274,
            high_price: 7769,
            low_price: 6791,
            candle_acc_trade_volume: 3483241.35222311,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-15T09:00:00",
            opening_price: 7277,
            trade_price: 6929,
            high_price: 7296,
            low_price: 6615,
            candle_acc_trade_volume: 1355435.22779177,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-16T09:00:00",
            opening_price: 6921,
            trade_price: 6562,
            high_price: 6953,
            low_price: 6466,
            candle_acc_trade_volume: 590502.68504214,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-17T09:00:00",
            opening_price: 6548,
            trade_price: 6590,
            high_price: 6661,
            low_price: 6060,
            candle_acc_trade_volume: 755672.82497786,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-18T09:00:00",
            opening_price: 6590,
            trade_price: 6383,
            high_price: 6811,
            low_price: 6355,
            candle_acc_trade_volume: 637046.66886748,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-19T09:00:00",
            opening_price: 6383,
            trade_price: 5890,
            high_price: 6700,
            low_price: 5799,
            candle_acc_trade_volume: 1259499.37855908,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-20T09:00:00",
            opening_price: 5919,
            trade_price: 6336,
            high_price: 6789,
            low_price: 5493,
            candle_acc_trade_volume: 22725963.58572105,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-21T09:00:00",
            opening_price: 6346,
            trade_price: 6229,
            high_price: 6349,
            low_price: 6100,
            candle_acc_trade_volume: 1573457.34820115,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-22T09:00:00",
            opening_price: 6229,
            trade_price: 6045,
            high_price: 6234,
            low_price: 5910,
            candle_acc_trade_volume: 581529.20778323,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-23T09:00:00",
            opening_price: 6045,
            trade_price: 6138,
            high_price: 6210,
            low_price: 5843,
            candle_acc_trade_volume: 499836.50620762,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-24T09:00:00",
            opening_price: 6138,
            trade_price: 6274,
            high_price: 6304,
            low_price: 6067,
            candle_acc_trade_volume: 595137.20131082,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-25T09:00:00",
            opening_price: 6274,
            trade_price: 6409,
            high_price: 6450,
            low_price: 6252,
            candle_acc_trade_volume: 2734812.19123438,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-26T09:00:00",
            opening_price: 6409,
            trade_price: 6675,
            high_price: 6690,
            low_price: 6342,
            candle_acc_trade_volume: 1446483.29333663,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-27T09:00:00",
            opening_price: 6675,
            trade_price: 6480,
            high_price: 6726,
            low_price: 6270,
            candle_acc_trade_volume: 1053077.24973611,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-28T09:00:00",
            opening_price: 6480,
            trade_price: 6467,
            high_price: 6505,
            low_price: 6275,
            candle_acc_trade_volume: 502166.8707422,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-29T09:00:00",
            opening_price: 6467,
            trade_price: 6571,
            high_price: 6676,
            low_price: 6320,
            candle_acc_trade_volume: 1536739.11066522,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-30T09:00:00",
            opening_price: 6572,
            trade_price: 6510,
            high_price: 6600,
            low_price: 6458,
            candle_acc_trade_volume: 378359.11781067,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-03-31T09:00:00",
            opening_price: 6514,
            trade_price: 6519,
            high_price: 6580,
            low_price: 6400,
            candle_acc_trade_volume: 263885.99246121,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-01T09:00:00",
            opening_price: 6513,
            trade_price: 6205,
            high_price: 6524,
            low_price: 6128,
            candle_acc_trade_volume: 465538.74565442,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-02T09:00:00",
            opening_price: 6205,
            trade_price: 5946,
            high_price: 6216,
            low_price: 5912,
            candle_acc_trade_volume: 419556.75549993,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-03T09:00:00",
            opening_price: 5958,
            trade_price: 5999,
            high_price: 6199,
            low_price: 5824,
            candle_acc_trade_volume: 669177.01844625,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-04T09:00:00",
            opening_price: 5990,
            trade_price: 6132,
            high_price: 6166,
            low_price: 5911,
            candle_acc_trade_volume: 253969.0709552,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-05T09:00:00",
            opening_price: 6123,
            trade_price: 6066,
            high_price: 6150,
            low_price: 5943,
            candle_acc_trade_volume: 166511.59580268,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-06T09:00:00",
            opening_price: 6060,
            trade_price: 6101,
            high_price: 6195,
            low_price: 6020,
            candle_acc_trade_volume: 265073.77406202,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-07T09:00:00",
            opening_price: 6091,
            trade_price: 6141,
            high_price: 6176,
            low_price: 6075,
            candle_acc_trade_volume: 112072.12619812,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-08T09:00:00",
            opening_price: 6141,
            trade_price: 6355,
            high_price: 6367,
            low_price: 6008,
            candle_acc_trade_volume: 525995.15996234,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-09T09:00:00",
            opening_price: 6355,
            trade_price: 6215,
            high_price: 6368,
            low_price: 6180,
            candle_acc_trade_volume: 310594.38651752,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-10T09:00:00",
            opening_price: 6215,
            trade_price: 6223,
            high_price: 6249,
            low_price: 6090,
            candle_acc_trade_volume: 203098.42186678,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-11T09:00:00",
            opening_price: 6219,
            trade_price: 6595,
            high_price: 6647,
            low_price: 6150,
            candle_acc_trade_volume: 832766.7409736,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-12T09:00:00",
            opening_price: 6594,
            trade_price: 6000,
            high_price: 6671,
            low_price: 5900,
            candle_acc_trade_volume: 1164961.33976066,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-13T09:00:00",
            opening_price: 6000,
            trade_price: 5391,
            high_price: 6280,
            low_price: 5114,
            candle_acc_trade_volume: 934431.28934597,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-14T09:00:00",
            opening_price: 5363,
            trade_price: 5650,
            high_price: 5667,
            low_price: 5180,
            candle_acc_trade_volume: 376754.53954058,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-15T09:00:00",
            opening_price: 5633,
            trade_price: 5459,
            high_price: 5760,
            low_price: 5288,
            candle_acc_trade_volume: 387848.0418461,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-16T09:00:00",
            opening_price: 5459,
            trade_price: 5374,
            high_price: 5921,
            low_price: 5220,
            candle_acc_trade_volume: 2186118.95113249,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-17T09:00:00",
            opening_price: 5362,
            trade_price: 5193,
            high_price: 5383,
            low_price: 5145,
            candle_acc_trade_volume: 242035.14981036,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-18T09:00:00",
            opening_price: 5191,
            trade_price: 5311,
            high_price: 5350,
            low_price: 4989,
            candle_acc_trade_volume: 404353.99973878,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-19T09:00:00",
            opening_price: 5327,
            trade_price: 5280,
            high_price: 5526,
            low_price: 5050,
            candle_acc_trade_volume: 765646.49294526,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-20T09:00:00",
            opening_price: 5280,
            trade_price: 5674,
            high_price: 6250,
            low_price: 5254,
            candle_acc_trade_volume: 8327908.45155557,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-21T09:00:00",
            opening_price: 5674,
            trade_price: 5558,
            high_price: 5757,
            low_price: 5535,
            candle_acc_trade_volume: 1347071.79509573,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-22T09:00:00",
            opening_price: 5558,
            trade_price: 5635,
            high_price: 5672,
            low_price: 5510,
            candle_acc_trade_volume: 480640.53337606,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-23T09:00:00",
            opening_price: 5649,
            trade_price: 5950,
            high_price: 6087,
            low_price: 5526,
            candle_acc_trade_volume: 2562154.75763702,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-24T09:00:00",
            opening_price: 5931,
            trade_price: 5694,
            high_price: 6482,
            low_price: 5655,
            candle_acc_trade_volume: 8154294.70932791,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-25T09:00:00",
            opening_price: 5694,
            trade_price: 5569,
            high_price: 6396,
            low_price: 5406,
            candle_acc_trade_volume: 6177686.14754756,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-26T09:00:00",
            opening_price: 5569,
            trade_price: 5430,
            high_price: 5672,
            low_price: 5394,
            candle_acc_trade_volume: 420071.24409677,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-27T09:00:00",
            opening_price: 5430,
            trade_price: 5393,
            high_price: 5459,
            low_price: 5260,
            candle_acc_trade_volume: 311510.02484666,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-28T09:00:00",
            opening_price: 5393,
            trade_price: 5336,
            high_price: 5430,
            low_price: 5300,
            candle_acc_trade_volume: 189017.32556011,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-29T09:00:00",
            opening_price: 5335,
            trade_price: 5280,
            high_price: 5390,
            low_price: 5169,
            candle_acc_trade_volume: 297004.46903211,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-04-30T09:00:00",
            opening_price: 5280,
            trade_price: 5385,
            high_price: 5527,
            low_price: 5170,
            candle_acc_trade_volume: 1754580.30208664,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-01T09:00:00",
            opening_price: 5381,
            trade_price: 5250,
            high_price: 5484,
            low_price: 4795,
            candle_acc_trade_volume: 7834821.51637811,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-02T09:00:00",
            opening_price: 5261,
            trade_price: 5124,
            high_price: 5490,
            low_price: 5013,
            candle_acc_trade_volume: 953205.4487699,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-03T09:00:00",
            opening_price: 5106,
            trade_price: 5270,
            high_price: 5306,
            low_price: 5050,
            candle_acc_trade_volume: 398609.33818453,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-04T09:00:00",
            opening_price: 5270,
            trade_price: 5244,
            high_price: 5310,
            low_price: 5182,
            candle_acc_trade_volume: 250043.81242428,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-05T09:00:00",
            opening_price: 5244,
            trade_price: 5228,
            high_price: 5288,
            low_price: 5150,
            candle_acc_trade_volume: 114545.71675097,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-06T09:00:00",
            opening_price: 5228,
            trade_price: 5207,
            high_price: 5427,
            low_price: 5190,
            candle_acc_trade_volume: 431940.35404161,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-07T09:00:00",
            opening_price: 5208,
            trade_price: 5422,
            high_price: 5870,
            low_price: 5162,
            candle_acc_trade_volume: 6529585.81208974,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-08T09:00:00",
            opening_price: 5417,
            trade_price: 5209,
            high_price: 5460,
            low_price: 5188,
            candle_acc_trade_volume: 1062952.48772602,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-09T09:00:00",
            opening_price: 5194,
            trade_price: 5227,
            high_price: 5245,
            low_price: 5053,
            candle_acc_trade_volume: 414854.3077254,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-10T09:00:00",
            opening_price: 5223,
            trade_price: 5083,
            high_price: 5223,
            low_price: 5057,
            candle_acc_trade_volume: 269337.31962094,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-11T09:00:00",
            opening_price: 5082,
            trade_price: 5108,
            high_price: 5240,
            low_price: 5063,
            candle_acc_trade_volume: 246394.13864389,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-12T09:00:00",
            opening_price: 5108,
            trade_price: 5120,
            high_price: 5355,
            low_price: 5098,
            candle_acc_trade_volume: 1141367.64489742,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-13T09:00:00",
            opening_price: 5120,
            trade_price: 5055,
            high_price: 5265,
            low_price: 4980,
            candle_acc_trade_volume: 1048193.93272624,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-14T09:00:00",
            opening_price: 5055,
            trade_price: 5038,
            high_price: 5200,
            low_price: 4905,
            candle_acc_trade_volume: 396751.87420382,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-15T09:00:00",
            opening_price: 5010,
            trade_price: 5180,
            high_price: 5250,
            low_price: 4975,
            candle_acc_trade_volume: 261496.33466161,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-16T09:00:00",
            opening_price: 5183,
            trade_price: 5134,
            high_price: 5385,
            low_price: 5133,
            candle_acc_trade_volume: 575571.69954018,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-17T09:00:00",
            opening_price: 5133,
            trade_price: 5216,
            high_price: 5235,
            low_price: 5120,
            candle_acc_trade_volume: 161778.11756475,
        },
        {
            market: "KRW-SBD",
            candle_date_time_kst: "2024-05-18T09:00:00",
            opening_price: 5216,
            trade_price: 5248,
            high_price: 5289,
            low_price: 5180,
            candle_acc_trade_volume: 142421.77527099,
        },
    ];

    interface DataPoint {
        market: string;
        candle_date_time_kst: string;
        trade_price: number;
        short_avg_price?: number;
        long_avg_price?: number;
        signal?: number;
        capital?: number;
    }

    // 이동 평균 계산 함수
    function calculateMovingAverages(
        data: DataPoint[],
        shortPeriod: number,
        longPeriod: number
    ): void {
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

    // 이동 평균 교차와 평균 회귀 전략을 적용하기 위한 함수
    function calculateMeanReversionWithMovingAverages(
        data: DataPoint[],
        shortPeriod: number,
        longPeriod: number
    ): void {
        calculateMovingAverages(data, shortPeriod, longPeriod);

        data.forEach((row, index) => {
            if (index >= longPeriod - 1) {
                if (row.short_avg_price && row.long_avg_price) {
                    if (
                        row.short_avg_price > row.long_avg_price &&
                        row.trade_price < row.short_avg_price
                    ) {
                        row.signal = 1; // 매수 신호
                    } else if (
                        row.short_avg_price < row.long_avg_price &&
                        row.trade_price > row.short_avg_price
                    ) {
                        row.signal = -1; // 매도 신호
                    } else {
                        row.signal = 0;
                    }
                }
            } else {
                row.signal = 0;
            }
        });
    }

    // 백테스트 함수
    function backtestMeanReversionWithMovingAverages(
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

    // 이동 평균 교차와 평균 회귀 전략 계산 및 백테스트
    const initialCapital = 10000; // 초기 자본
    const shortPeriod = 14; // 단기 이동 평균 기간
    const longPeriod = 50; // 장기 이동 평균 기간

    calculateMeanReversionWithMovingAverages(data, shortPeriod, longPeriod);
    const meanReversionWithMAResult = backtestMeanReversionWithMovingAverages(
        data,
        initialCapital
    );

    const finalCapitalMeanReversionWithMA =
        meanReversionWithMAResult[meanReversionWithMAResult.length - 1].capital;
    const returnRateMeanReversionWithMA =
        (finalCapitalMeanReversionWithMA! / initialCapital - 1) * 100;

    console.log("Mean Reversion with Moving Averages Strategy Results:");
    console.log(meanReversionWithMAResult.slice(-10));
    console.log(`Final Capital: ${finalCapitalMeanReversionWithMA}`);
    console.log(`Return Rate: ${returnRateMeanReversionWithMA.toFixed(2)}%`);

    //     Final Capital: 10241.74053182917
    // Return Rate: 2.42%
}
