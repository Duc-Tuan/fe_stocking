import type { ILoginMt5 } from "../pages/Home/PopupLoginMt5";
import axiosClient from "../services/axiosClient";

export const serverSymbolApi = async () => {
    const data = await axiosClient.get('/accmt5')
    return data.data.data
}

export const postAccMt5Api = async (dataAccMt5: ILoginMt5) => {
    const data = await axiosClient.post('/accmt5', dataAccMt5, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return data.data
}

