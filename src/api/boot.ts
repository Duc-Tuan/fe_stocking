import type { OrderType } from "../pages/BootSymmetricalOrder/type";
import axiosClient from "../services/axiosClient";
import type { QueryLots } from "../types/global";

interface OpenOrderBootRequest {
    type: "EXNESS" | "FUND";
    username: number | undefined;
    data: {
        symbol: "EURUSD" | "GBPUSD" | "XAUUSD" | "USDJPY" | undefined;
        volume: number | undefined;
        price: number | undefined;
        tp: number | undefined;
        sl: number | undefined;
        type: OrderType | undefined;
    }
}

export const postOpenOrderBoot = async (body: OpenOrderBootRequest[]) => {
    const data = await axiosClient.post('/boot_order', body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    return {
        data: data.data
    }
}

export const postCloseOrderBoot = async (body: { id: number }) => {
    const data = await axiosClient.post('/boot_close_order', body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    return {
        data: data.data
    }
}

export const getCloseOrderBoot = async (query: QueryLots) => {
    const data = await axiosClient.get('/boot_close_order', {
        params: {
            page: query.page,
            limit: query.limit,
            start_time: query.start_time,
            end_time: query.end_time,
            status: query.status,
            acc_transaction: query.acc_transaction
        },
    })

    return data.data
}

export const getDetailOrderBoot = async (id: number) => {
    const data = await axiosClient.get(`/boot_detail_order/${id}`)
    return data.data
}

export const postOpenOrderMonitorBoot = async (body: any[]) => {
    const data = await axiosClient.post('/lot-monitor-boot', body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    return {
        data: data.data
    }
}

export const getOrderMonitorBoot = async (query: QueryLots) => {
    const data = await axiosClient.get('/boot_monitor_order', {
        params: {
            page: query.page,
            limit: query.limit,
            start_time: query.start_time,
            end_time: query.end_time,
            status: query.status,
            acc_transaction: query.acc_transaction
        },
    })

    return data.data
}

export const getDetailOrderMonitorBoot = async (id: number) => {
    const data = await axiosClient.get(`/boot_monitor_detail_order/${id}`)
    return data.data
}

export const getCloseOrderMonitorBoot = async (body: any) => {
    const data = await axiosClient.post('/close-monitor-boot', body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return data.data
}