import axiosClient from "../services/axiosClient";

export const loginApi = (username: string, password: string, deviceId: string) =>
  axiosClient.post('/login', { username, password, deviceId });

export const getMeApi = () => axiosClient.get('/me');
