import axiosClient from "../services/axiosClient";
import type { IPagination } from "../types/global";

export interface IDataRiskReq {
    risk: number
}

export interface IOddOrderRequest {
    price: number | null,
    id_notification: number
    symbol: string
    lot: number
    order_type: "BUY" | "SELL"
    account_transaction_id: number
    lot_id: number
}

export const notificationApi = async (pagination: IPagination) => {
    const data = await axiosClient.get('/notifcations', {
        params: {
            page: pagination.page,
            limit: pagination.limit,
        },
    })

    return data.data
}

export const postNotificationApi = async (body: IOddOrderRequest) => {
    const data = await axiosClient.post('/odd_order', body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    return data.data
}

export const getSettingNotificationApi = async (pagination: IPagination) => {
    const data = await axiosClient.get('/setting_risk', {
        params: {
            page: pagination.page,
            limit: pagination.limit,
        },
    })

    return data.data
}

export const getSettingDailyNotificationApi = async (pagination: IPagination) => {
    const data = await axiosClient.get('/setting_daily_risk', {
        params: {
            page: pagination.page,
            limit: pagination.limit,
        },
    })

    return data.data
}

export const postSettingNotificationApi = async (body: IDataRiskReq) => {
    const data = await axiosClient.post('/setting_risk', body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    return data.data
}

export const readNotificationApi = async (body: { data: { id: number }[] }) => {
    const data = await axiosClient.post('/notifcations_read', body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    return data.data
}

export const getDetailNotificationApi = async (id: number) => {
    const data = await axiosClient.get(`/notifcations_read/${id}`)
    return data.data
}

