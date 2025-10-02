import axiosClient from "../services/axiosClient";

export interface IDataUpdateAccGDReq {
    id_Risk?: number,
    id_daily_risk?: number,
    id_acc: number,
    monney_acc?: number,
    type_acc?: string,
}

export const serverSymbolApi = async () => {
    const data = await axiosClient.get('/accmt5')
    return data.data.data
}

export const accmt5TransactionApi = async () => {
    const data = await axiosClient.get('/accmt5_transaction')
    return data.data.data
}

// Update các 3 trường của tài khoản giao dịch
export const updateTransactionApi = async (body: IDataUpdateAccGDReq) => {
    const data = await axiosClient.post('/accmt5_transaction', body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
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

