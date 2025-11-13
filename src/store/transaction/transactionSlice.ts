import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ICurrentPnl, IOptions, IServerTransaction } from '../../types/global';
import { accmt5TransactionApi, serverSymbolApi } from '../../api/serverSymbol';

interface AuthState {
    loading: boolean;
    loadingserverTransaction: boolean;
    serverMonitor: IOptions[];
    serverMonitorActive: IOptions | null;
    currentPnl: ICurrentPnl | null;
    dataServerTransaction: IServerTransaction[]
}

const initialState: AuthState = {
    loading: false,
    loadingserverTransaction: false,
    serverMonitor: [],
    serverMonitorActive: null,
    currentPnl: null,
    dataServerTransaction: []
};

export const getServer = createAsyncThunk('server/getServer', async () => {
    const res = await serverSymbolApi();
    const dataNew = res.map((a: any, _i: number) => ({
        id: a.id,
        value: a.username,
        label: a.server,
        data: JSON.parse(a.by_symbol)
    }));
    return dataNew;
});

export const getServerTransaction = createAsyncThunk('server/getServerTransaction', async () => {
    return await accmt5TransactionApi();
});

const transactionSlice = createSlice({
    name: 'server',
    initialState,
    reducers: {
        setServerMonitor(state, action) {
            state.serverMonitorActive = action.payload
            state.currentPnl = null
        },
        setCurrentPnl(state, action) {
            state.currentPnl = action.payload
        },
        setDataAccTransaction(state, action) {
            state.dataServerTransaction = action.payload
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
            .addCase(getServerTransaction.pending, (state) => {
                state.loadingserverTransaction = true;
            })
            .addCase(getServerTransaction.fulfilled, (state, action) => {
                state.dataServerTransaction = action.payload
                state.loadingserverTransaction = false;
            })
            .addCase(getServerTransaction.rejected, (state) => {
                state.loadingserverTransaction = false;
            })
    },
});

export const { setCurrentPnl, setServerMonitor, setDataAccTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
