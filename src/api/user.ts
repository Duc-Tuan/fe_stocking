import axiosClient from "../services/axiosClient";
import type { IPagination } from "../types/global";

export interface RespontPostDecentralozition {
    user_id: number
    account_id: number
}

export interface RespontPostRegiter {
    username: string
    password: string
}

export const getUserApi = async (pagination: IPagination) => {
    const data = await axiosClient.get('/user_all', {
        params: {
            search: pagination.search,
            page: pagination.page,
            limit: pagination.limit,
        },
    })

    return data.data
}

export const getMeUserApi = async (id: number) => {
    const data = await axiosClient.get(`/detail_user/${id}`)
    return data.data
}

export const regiterUserApi = async (body: RespontPostRegiter) => {
    const data = await axiosClient.post("/register", body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return data.data
}

export const deleteUserApi = async (body: { id: number }) => {
    const data = await axiosClient.delete("/user", {
        headers: {
            'Content-Type': 'application/json',
        },
        data: body
    })
    return data.data
}

export const postDecentralozitionAccMonitor = async (body: RespontPostDecentralozition) => {
    const data = await axiosClient.post('/assign_account', body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return data.data
}

export const deleteDecentralozitionAccMonitor = async (body: { id: number }) => {
    const data = await axiosClient.delete('/assign_account', {
        headers: {
            'Content-Type': 'application/json',
        },
        data: body
    })
    return data.data
}

export const postDecentralozitionAccTransaction = async (body: RespontPostDecentralozition) => {
    const data = await axiosClient.post('/assign_account_transaction', body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return data.data
}

export const deleteDecentralozitionAccTransaction = async (body: { id: number }) => {
    const data = await axiosClient.delete('/assign_account_transaction', {
        headers: {
            'Content-Type': 'application/json',
        },
        data: body
    })
    return data.data
}