function setMovingAverage(data, period = 5) {
    const result = data.map((aData, index) => {
        if (index < period - 1) {
            return aData;
        }
        const average = calculateMovingAverage(data, index, period);
        return Object.assign(Object.assign({}, aData), { [`moving_average_${period}`]: average });
    });
    return result;
}
function calculateMovingAverage(data, index, period = 5) {
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[index - i].trade_price;
    }
    return sum / period;
}
function applyStandardMovingAverages(data) {
    let result = setMovingAverage(data, 3);
    result = setMovingAverage(result, 5);
    result = setMovingAverage(result, 10);
    result = setMovingAverage(result, 20);
    return result;
}
function setVolumeAverage(data, period = 5) {
    const result = data.map((aData, index) => {
        if (index < period - 1) {
            return aData;
        }
        const average = calculateVolumeAverage(data, index, period);
        return Object.assign(Object.assign({}, aData), { [`volume_average_${period}`]: average });
    });
    return result;
}
function calculateVolumeAverage(data, index, period = 5) {
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[index - i].candle_acc_trade_volume;
    }
    return sum / period;
}
export { setMovingAverage, applyStandardMovingAverages, setVolumeAverage };
//# sourceMappingURL=movingAverage.js.map