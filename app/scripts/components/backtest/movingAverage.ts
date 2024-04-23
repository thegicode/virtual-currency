function setMovingAverage(data: any[], period = 5) {
    const result = data.map((aData, index) => {
        if (index < period - 1) {
            return aData;
        }

        const average = calculateMovingAverage(data, index, period);

        aData[`moving_average_${period}`] = average.toFixed(2);

        return aData;
    });

    return result;
}

function calculateMovingAverage(data: any, index: number, period = 5) {
    let sum = 0;

    for (let i = 0; i < period; i++) {
        sum += data[index - i].trade_price;
    }

    return sum / period;
}

// checkMovingAverage

export { setMovingAverage };
