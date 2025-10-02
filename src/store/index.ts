import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../auth/authSlice';
import transactionReducer from './transaction/transactionSlice';
import notificationReducer from './notification/notification';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        transaction: transactionReducer,
        notification: notificationReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
