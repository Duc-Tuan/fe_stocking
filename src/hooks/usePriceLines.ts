import { useEffect, useRef } from 'react';
import { LineStyle, type IPriceLine } from 'lightweight-charts';
import type { ISetupIndicator } from '../types/global';

export function usePriceLines(
    seriesRef: React.RefObject<any>,
    dataCurrent: ISetupIndicator
) {
    const innerLineRefs = useRef<IPriceLine[]>([]);
    const outerLineRefs = useRef<IPriceLine[]>([]);
    const midLineRef = useRef<IPriceLine | null>(null);

    useEffect(() => {
        if (!seriesRef.current) return;

        // clear old lines
        innerLineRefs.current.forEach((line) => line && seriesRef.current?.removePriceLine(line));
        outerLineRefs.current.forEach((line) => line && seriesRef.current?.removePriceLine(line));
        if (midLineRef.current) {
            seriesRef.current?.removePriceLine(midLineRef.current);
        }

        innerLineRefs.current = [];
        outerLineRefs.current = [];
        midLineRef.current = null;

        // add new lines
        if (dataCurrent.isOpen) {
            if (dataCurrent.innerLines && !dataCurrent.innerLines.some((i) => i === undefined)) {
                innerLineRefs.current = dataCurrent.innerLines.map((i) =>
                    seriesRef.current!.createPriceLine({
                        price: i,
                        color: 'red',
                        lineWidth: 1,
                        lineStyle: LineStyle.Solid,
                        axisLabelVisible: true,
                    }),
                );
            }

            if (dataCurrent.outerLines && !dataCurrent.outerLines.some((i) => i === undefined)) {
                outerLineRefs.current = dataCurrent.outerLines.map((i) =>
                    seriesRef.current!.createPriceLine({
                        price: i,
                        color: 'green',
                        lineWidth: 1,
                        lineStyle: LineStyle.Solid,
                        axisLabelVisible: true,
                    }),
                );
            }

            if (dataCurrent.midline !== undefined) {
                midLineRef.current = seriesRef.current!.createPriceLine({
                    price: dataCurrent.midline,
                    color: 'gold',
                    lineWidth: 1,
                    lineStyle: LineStyle.Solid,
                    axisLabelVisible: true,
                });
            }
        }
    }, [dataCurrent, seriesRef]);

    return { innerLineRefs, outerLineRefs, midLineRef };
}
