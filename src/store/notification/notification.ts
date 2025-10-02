import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { INotifi } from '../../layouts/type';
import { notificationApi, readNotificationApi } from '../../api/notification';

interface AuthState {
    dataNotification: INotifi[]
    totalNotifcation: number
    loadingNotification: boolean
    pagani: {
        total: number,
        limit: number,
        page: number,
    }
}

const initialState: AuthState = {
    dataNotification: [],
    loadingNotification: false,
    totalNotifcation: 0,
    pagani: {
        limit: 10,
        page: 1,
        total: 0
    }
};

export const getNotification = createAsyncThunk('notification/getNotification', async ({ page = 1, limit = 10 }: { page?: number, limit?: number }) => {
    const data = await notificationApi({ page, limit });
    return data;
});

export const getReadNotifcation = createAsyncThunk('notification/postNotification', async ({ data }: { data: { id: number }[] }) => {
    const req = await readNotificationApi({ data });
    return { req, data };
});

const notification = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setNotification(state, action) {
            state.dataNotification = action.payload
        },
        setNotificationView(state, action) {
            const dataNew = [action.payload, ...state.dataNotification]
            state.dataNotification = dataNew
            state.totalNotifcation += 1
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getNotification.pending, (state) => {
                state.loadingNotification = true
            })
            .addCase(getNotification.fulfilled, (state, action) => {
                state.dataNotification = action.payload.data
                state.totalNotifcation = action.payload.total_notification
                state.pagani = {
                    limit: action.payload.limit,
                    page: action.payload.page,
                    total: action.payload.total,
                }
                state.loadingNotification = false
            })
            .addCase(getNotification.rejected, (state) => {
                state.loadingNotification = false
            })
            .addCase(getReadNotifcation.fulfilled, (state, action) => {
                const dataNew = state.dataNotification.map((i) => {
                    const isCheck = action.payload.data.some((d) => d.id === i.id)
                    if (isCheck) {
                        return {
                            ...i,
                            isRead: true
                        }
                    }
                    return i
                })
                state.dataNotification = dataNew
                state.totalNotifcation = (action.payload.req.total_notification);
                if (action.payload.req.total_notification === 0) {
                    state.dataNotification = state.dataNotification.map((i) => ({ ...i, isRead: true }))
                }
            })
    },
});

export const { setNotification, setNotificationView } = notification.actions;
export default notification.reducer;
