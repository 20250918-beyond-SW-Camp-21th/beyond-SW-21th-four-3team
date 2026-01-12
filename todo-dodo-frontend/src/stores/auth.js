import { defineStore } from 'pinia';
import { authApi } from '@/api/authApi';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.accessToken,
  },
  actions: {
    async login(loginId, password) {
      try {
        const response = await authApi.login(loginId, password);

        if (!response?.success) return false;

        this.accessToken = response.data?.accessToken ?? null;
        this.refreshToken = response.data?.refreshToken ?? null;

        // 서버가 유저 정보를 안 주면 일단 loginId 정도만 저장
        this.user = response.data?.user ?? { loginId };

        if (this.accessToken) localStorage.setItem('accessToken', this.accessToken);
        if (this.refreshToken) localStorage.setItem('refreshToken', this.refreshToken);
        localStorage.setItem('user', JSON.stringify(this.user));

        return true;
      } catch (e) {
        return false;
      }
    },

    logout() {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
});
