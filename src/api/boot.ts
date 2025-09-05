import axiosClient from "../services/axiosClient"

interface OpenOrderBootRequest {
    username: number,
    data: {
        price: number
        sl: number
        tp: number
        symbol: "GBPUSD" | "EURUSD" | "XAUUSD" | "USDJPY"
        type: 0 | 1 | 2 | 3 | 4 | 5
        volume: number
    }
}

interface CloseOrderBootRequest {
    id: number
    serverName: number
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

export const postCloseOrderBoot = async (body: CloseOrderBootRequest[]) => {
    const data = await axiosClient.post('/boot_close_order', body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    return {
        data: data.data
    }
}