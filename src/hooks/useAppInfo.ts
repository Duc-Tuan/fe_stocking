// hooks/useAppInfo.ts

import { useSelector } from "react-redux";
import type { RootState } from "../store";

export function useAppInfo() {
    const loadingServerMonitor = useSelector((state: RootState) => state.transaction.loading);
    const serverMonitorActive = useSelector((state: RootState) => state.transaction.serverMonitorActive);
    const serverMonitor = useSelector((state: RootState) => state.transaction.serverMonitor);
    const loadingserverTransaction = useSelector((state: RootState) => state.transaction.loadingserverTransaction);
    const dataServerTransaction = useSelector((state: RootState) => state.transaction.dataServerTransaction);
    const loadingGetMe = useSelector((state: RootState) => state.auth.loading);
    const user = useSelector((state: RootState) => state.auth.user);

    return {
        loadingServerMonitor,
        serverMonitor,
        serverMonitorActive,
        loadingGetMe,
        loadingserverTransaction,
        dataServerTransaction,
        user
    };
}
