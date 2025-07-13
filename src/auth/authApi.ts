import axiosClient from "../services/axiosClient";

export const loginApi = (username: string, password: string) =>
  axiosClient.post('/login', { username, password });

export const getMeApi = () => {
  const data = axiosClient.get('/me')
  data.then().catch(() => localStorage.removeItem('token'))
  return data
}
