import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, getMeApi } from './authApi';

interface AuthState {
  user: any;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password, deviceId }: { username: string; password: string, deviceId: string }, thunkAPI) => {
    const res = await loginApi(username, password, deviceId);
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('device_id', res.data.deviceId);
    return res.data.user;
  }
);

export const getMe = createAsyncThunk('auth/getMe', async () => {
  const res = await getMeApi();
  return res.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
