import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Import all API slices
import { authApi } from './api/authApi';
import { dashboardApi } from './api/dashboardApi';
import { bookingApi } from './api/bookingApi';
import { userApi } from './api/userApi';
import { reportApi } from './api/reportApi';
import { adminApi } from './api/adminApi';
import { galleryApi } from './api/galleryApi';
import { bannerApi } from './api/bannerApi';
import { settingsApi } from './api/settingsApi';
import { platformFeeApi } from './api/platformFeeApi';
import { verifyApi } from './api/verifyApi';

// Type definitions
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface RootState {
  auth: AuthState;
  [authApi.reducerPath]: ReturnType<typeof authApi.reducer>;
  [dashboardApi.reducerPath]: ReturnType<typeof dashboardApi.reducer>;
  [bookingApi.reducerPath]: ReturnType<typeof bookingApi.reducer>;
  [userApi.reducerPath]: ReturnType<typeof userApi.reducer>;
  [reportApi.reducerPath]: ReturnType<typeof reportApi.reducer>;
  [adminApi.reducerPath]: ReturnType<typeof adminApi.reducer>;
  [galleryApi.reducerPath]: ReturnType<typeof galleryApi.reducer>;
  [bannerApi.reducerPath]: ReturnType<typeof bannerApi.reducer>;
  [settingsApi.reducerPath]: ReturnType<typeof settingsApi.reducer>;
  [platformFeeApi.reducerPath]: ReturnType<typeof platformFeeApi.reducer>;
  [verifyApi.reducerPath]: ReturnType<typeof verifyApi.reducer>;
}

// Auth slice
const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    loadUserFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
          state.token = token;
          state.user = JSON.parse(user);
          state.isAuthenticated = true;
        }
      }
    },
  },
});

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [galleryApi.reducerPath]: galleryApi.reducer,
    [bannerApi.reducerPath]: bannerApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [platformFeeApi.reducerPath]: platformFeeApi.reducer,
    [verifyApi.reducerPath]: verifyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      dashboardApi.middleware,
      bookingApi.middleware,
      userApi.middleware,
      reportApi.middleware,
      adminApi.middleware,
      galleryApi.middleware,
      bannerApi.middleware,
      settingsApi.middleware,
      platformFeeApi.middleware,
      verifyApi.middleware,
    ),
});

// Export all API hooks
export * from './api/authApi';
export * from './api/dashboardApi';
export * from './api/bookingApi';
export * from './api/userApi';
export * from './api/reportApi';
export * from './api/adminApi';
export * from './api/galleryApi';
export * from './api/bannerApi';
export * from './api/settingsApi';
export * from './api/platformFeeApi';

export const { setCredentials, logout, loadUserFromStorage } = authSlice.actions;
export type { RootState, User, AuthState };