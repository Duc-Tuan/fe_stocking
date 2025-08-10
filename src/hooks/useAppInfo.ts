// hooks/useAppInfo.ts

import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useTranslation } from "react-i18next";

export function useAppInfo() {
    const { t } = useTranslation();
    const loadingServerMonitor = useSelector((state: RootState) => state.transaction.loading);
    const serverMonitorActive = useSelector((state: RootState) => state.transaction.serverMonitorActive);
    const serverMonitor = useSelector((state: RootState) => state.transaction.serverMonitor);
    const currentPnl = useSelector((state: RootState) => state.transaction.currentPnl);
    const loadingGetMe = useSelector((state: RootState) => state.auth.loading);

    return {
        t,
        loadingServerMonitor,
        serverMonitor,
        serverMonitorActive,
        currentPnl,
        loadingGetMe
    };
}
