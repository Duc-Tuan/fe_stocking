import axiosClient from "../services/axiosClient";
import type { IPagination } from "../types/global";

export const symbolApi = async (pagination: IPagination, id_symbol: number) => {
    const data = await axiosClient.get('/symbols', {
        params: {
            last_id: pagination.last_time,
            limit: pagination.limit,
            id_symbol
        },
    })

    return {
        data: data.data,
        status: data.status
    }
}

