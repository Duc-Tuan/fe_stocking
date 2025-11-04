import axiosClient from "../services/axiosClient";
import type { IPagination } from "../types/global";

export const symbolApi = async (pagination: IPagination, id_symbol: number) => {
    const data = await axiosClient.get('/symbols', {
        params: {
            page: pagination.page,
            limit: pagination.limit,
            id_symbol,
            timeframe: pagination.timeframe
        },
    })

    return {
        data: data.data,
        status: data.status
    }
}

export const getSwapApi = async () => {
    const data = await axiosClient.get('/swaps')
    return data
}
export const getStatistical = async (login_id: number) => {
    const data = await axiosClient.get('/statistical', {
        params: {
            login_id,
        },
    })
    return data
}

