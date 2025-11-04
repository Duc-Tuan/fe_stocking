import axiosClient from "../services/axiosClient";

export const getNotes = async () => {
    const data = await axiosClient.get('/note')

    return {
        data: data.data
    }
}

export const postNotes = async (body: any) => {
    const data = await axiosClient.post('/note', body, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    return {
        data: data.data
    }
}