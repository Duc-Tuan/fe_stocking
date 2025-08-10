import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ICurrentPnl, IOptions } from '../../types/global';
import { serverSymbolApi } from '../../api/serverSymbol';

interface AuthState {
    loading: boolean;
    serverMonitor: IOptions[];
    serverMonitorActive: IOptions | null;
    currentPnl: ICurrentPnl | null;
}

const initialState: AuthState = {
    loading: false,
    serverMonitor: [],
    serverMonitorActive: null,
    currentPnl: null
};

export const getServer = createAsyncThunk('server/getServer', async () => {
    const res = await serverSymbolApi();
    const dataNew = res.map((a: any, i: number) => ({
        value: a.username,
        label: a.server,
        data: JSON.parse(a.by_symbol)
    }));
    return dataNew;
});

const transactionSlice = createSlice({
    name: 'server',
    initialState,
    reducers: {
        setServerMonitor(state, action) {
            state.serverMonitorActive = action.payload
        },
        setCurrentPnl(state, action) {
            state.currentPnl = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getServer.pending, (state) => {
                state.loading = true;
            })
            .addCase(getServer.fulfilled, (state, action) => {
                state.serverMonitor = action.payload;
                state.serverMonitorActive = action.payload[0]
                state.loading = false;
            })
            .addCase(getServer.rejected, (state) => {
                state.loading = false;
            })
    },
});

export const { setCurrentPnl, setServerMonitor } = transactionSlice.actions;
export default transactionSlice.reducer;
