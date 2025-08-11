// hooks/useAppInfo.ts

import { useSelector } from "react-redux";
import type { RootState } from "../store";

export function useCurrentPnl() {
    const currentPnl = useSelector((state: RootState) => state.transaction.currentPnl);

    return {
        currentPnl
    };
}
