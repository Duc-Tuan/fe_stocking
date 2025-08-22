import axiosClient from "../services/axiosClient";

export const serverSymbolApi = async () => {
    const data = await axiosClient.get('/accmt5')
    return data.data.data
}

export const accmt5TransactionApi = async () => {
    const data = await axiosClient.get('/accmt5_transaction')
    return data.data.data
}

export const postAccMt5Api = async (dataAccMt5: any) => {
    const data = await axiosClient.post('/accmt5', dataAccMt5, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return data.data
}

