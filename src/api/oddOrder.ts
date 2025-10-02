import axiosClient from "../services/axiosClient"

interface OdđOrderRequest {
    ticket: number,
    vloume: number,
    acc_transaction: number
}

export const closeOddOrder = async (body: OdđOrderRequest) => {
    const data = await axiosClient.post('/close_odd_order', body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    return {
        data: data.data
    }
}