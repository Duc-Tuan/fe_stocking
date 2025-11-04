export const calculateROC = (data: any[], period: number = 14) => {
    data = data.sort((a: any, b: any) => a.time - b.time);
    if (data.length < period + 1) return [];

    const roc: { time: number; value: number }[] = [];

    // Gắn NaN cho các nến ban đầu
    for (let i = 0; i < period; i++) {
        roc.push({ time: data[i].time, value: NaN });
    }

    // Tính giá trị ROC từ cây thứ period trở đi
    for (let i = period; i < data.length; i++) {
        const current = data[i].close;
        const past = data[i - period].close;

        const value = (!past || !isFinite(past))
            ? 0
            : ((current - past) / Math.abs(past));
            //  * 100
        roc.push({ time: data[i].time, value });
    }

    return roc.sort((a: any, b: any) => a.time - b.time);
};
