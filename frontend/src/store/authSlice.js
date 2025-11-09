import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';
import tokenService from '../utils/tokenService';

// Async thunk for login
export const loginThunk = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  try {
    const res = await api.post('/api/auth/login', { email, password });
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Async thunk for silent refresh
export const refreshThunk = createAsyncThunk('auth/refresh', async (_, thunkAPI) => {
  try {
    const rt = tokenService.getRefreshToken();
    if (!rt) return thunkAPI.rejectWithValue('No refresh token');
    const res = await api.post('/api/auth/refresh', { refreshToken: rt });
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

const initialState = {
  token: tokenService.getToken() || '',
  refreshToken: tokenService.getRefreshToken() || '',
  user: (() => {
    try { const raw = localStorage.getItem('user'); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  })(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = '';
      state.refreshToken = '';
      state.user = null;
      tokenService.clearTokens();
      localStorage.removeItem('user');
    },
    setAuth(state, action) {
      const { accessToken, refreshToken, user } = action.payload;
      state.token = accessToken || '';
      state.refreshToken = refreshToken || '';
      state.user = user || null;
      if (accessToken) tokenService.setToken(accessToken);
      if (refreshToken) tokenService.setRefreshToken(refreshToken);
      if (user) localStorage.setItem('user', JSON.stringify(user));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const { accessToken, refreshToken, user } = action.payload;
        state.token = accessToken || action.payload.token || '';
        state.refreshToken = refreshToken || '';
        state.user = user || null;
        if (state.token) tokenService.setToken(state.token);
        if (state.refreshToken) tokenService.setRefreshToken(state.refreshToken);
        if (state.user) localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(loginThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message; })
      .addCase(refreshThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(refreshThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { accessToken, refreshToken } = action.payload;
        state.token = accessToken || '';
        if (refreshToken) state.refreshToken = refreshToken;
        if (state.token) tokenService.setToken(state.token);
        if (refreshToken) tokenService.setRefreshToken(refreshToken);
      })
      .addCase(refreshThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        // clear tokens on refresh failure
        state.token = '';
        state.refreshToken = '';
        state.user = null;
        tokenService.clearTokens();
        localStorage.removeItem('user');
      });
  }
});

export const { logout, setAuth } = authSlice.actions;
export default authSlice.reducer;
