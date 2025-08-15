import axiosClient from "../services/axiosClient";
import type { IPostCloseOrder, QueryLots } from "../types/global";

export const getLots = async (query: QueryLots) => {
    const data = await axiosClient.get('/lots-transaction', {
        params: {
            page: query.page,
            limit: query.limit,
            start_time: query.start_time,
            end_time: query.end_time,
            status: query.status,
            acc_transaction: query.acc_transaction
        },
    })

    return {
        data: data.data
    }
}

export const postCloseOrder = async (body: IPostCloseOrder) => {
    const data = await axiosClient.post('/close-fast-lot', body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    return {
        data: data.data
    }
}


export const getOrdersClose = async (query: QueryLots) => {
    const data = await axiosClient.get('/orders-close', {
        params: {
            page: query.page,
            limit: query.limit,
            start_time: query.start_time,
            end_time: query.end_time,
            symbol: query.symbol,
            acc_transaction: query.acc_transaction
        },
    })

    return {
        data: data.data
    }
}

export const getSymbolTransaction = async (query: QueryLots) => {
    const data = await axiosClient.get('/all-send-symbols', {
        params: {
            page: query.page,
            limit: query.limit,
            start_time: query.start_time,
            status: query.status,
            end_time: query.end_time,
            symbol: query.symbol,
            acc_transaction: query.acc_transaction
        },
    })

    return {
        data: data.data
    }
}

export const getPositionTransaction = async (query: QueryLots) => {
    const data = await axiosClient.get('/position-transaction', {
        params: {
            page: query.page,
            limit: query.limit,
            start_time: query.start_time,
            status: query.status,
            end_time: query.end_time,
            type: query.type,
            acc_transaction: query.acc_transaction
        },
    })

    return {
        data: data.data
    }
}
