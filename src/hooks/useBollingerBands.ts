import { useEffect } from "react";
import { calculateBollingerBands } from "../components/candlestickSeries/options";

interface BBParams {
    dataOld: any[];
    dataCurrent: { period: number; k: number };
    maLine: any;
    upperLine: any;
    lowerLine: any;
    isVisible: boolean
}

export function useBollingerBands({
    dataOld,
    dataCurrent,
    maLine,
    upperLine,
    lowerLine,
    isVisible
}: BBParams) {
    useEffect(() => {
        if (maLine?.current && upperLine?.current && lowerLine?.current) {
            const sortedData = [...dataOld].sort((a, b) => a.time - b.time);
            const bb = calculateBollingerBands(sortedData, dataCurrent.period, dataCurrent.k);

            maLine.current.setData(bb.map(p => ({ time: p.time, value: p.ma })));
            upperLine.current.setData(bb.map(p => ({ time: p.time, value: p.upper })));
            lowerLine.current.setData(bb.map(p => ({ time: p.time, value: p.lower })));

            // Cập nhật hiển thị luôn
            maLine.current.applyOptions({ visible: isVisible });
            upperLine.current.applyOptions({ visible: isVisible });
            lowerLine.current.applyOptions({ visible: isVisible });
        }
    }, [dataOld, dataCurrent, isVisible, maLine, upperLine, lowerLine]);
}
