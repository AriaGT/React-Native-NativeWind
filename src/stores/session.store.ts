import {create} from 'zustand';
import axios, { AxiosInstance, isCancel } from 'axios';
import { deleteASData, saveASData } from '@/utils/storage';
import { StorageKeys } from '@/constants';
import * as SecureStore from 'expo-secure-store';

interface SessionState {
  api: AxiosInstance | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

interface SessionActions {
  setAuthToken: (token: string) => void;
  clearAuthToken: () => Promise<void>;
  cancelPendingRequests: () => void;
  login: (token: string, user?: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

const abortControllers = new Map<string, AbortController>();

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});

api.interceptors.request.use(config => {
  const controller = new AbortController();
  config.signal = controller.signal;
  abortControllers.set(config.url || '', controller);
  return config;
});


api.interceptors.response.use(
  response => {
    abortControllers.delete(response.config.url || '');
    return response;
  },
  error => {
    abortControllers.delete(error.config?.url || '');
    if (isCancel(error)) {
      console.log('Solicitud cancelada:', error.message);
      return Promise.reject(error);
    }
    if (error.name === 'AbortError') {
      console.log('Solicitud abortada:', error.message);
      return Promise.reject(error);
    }
    if (!error.response) {
      console.log('Error de conexión detectado');
    }
    return Promise.reject(error);
  }
);

export const useSessionStore = create<SessionState & SessionActions>((set, get) => ({
  // ? Estado inicial
  api,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  user: null,

  // ? Acciones
  setAuthToken: (token: string) => {
    const { api } = get();
    if (!api) {
      console.error('API instance not initialized');
      return;
    }
    saveASData(StorageKeys.AuthToken, token);
    api.defaults.headers['Authorization'] = `Token ${token}`;
  },

  clearAuthToken: async () => {
    const { api } = get();
    if (!api) {
      console.error('API instance not initialized');
      return;
    }
    await deleteASData(StorageKeys.AuthToken);
    delete api.defaults.headers['Authorization'];
  },

  cancelPendingRequests: () => {
    const { api } = get();
    if (!api) {
      console.error('API instance not initialized');
      return;
    }
    abortControllers.forEach(controller => controller.abort());
    abortControllers.clear();
  },

  login: async (token: string, user?: any) => {
    try {
      // Guardar token en SecureStore (encriptado)
      await SecureStore.setItemAsync(StorageKeys.AuthToken, token);
      // Guardar datos del usuario si existen
      if (user) {
        await SecureStore.setItemAsync(StorageKeys.User, JSON.stringify(user));
      }
      set({
        isAuthenticated: true,
        token,
        user: user || null,
      });
    } catch (error) {
      console.error('Error saving secure data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({
      isAuthenticated: false,
      token: null,
      user: null,
      isLoading: false
    });
  },

  checkAuthState: async () => {
    try {
      const state = get();
      // Si ya hay un token persistido, el usuario está autenticado
      if (state.token) {
        set({ isAuthenticated: true, isLoading: false });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
