// Utilities
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      username: null,
      password: null,
      roles: [],
      loginTime: null,
      token: null,
    },
    isLoggedIn: false,
  }),
  getters: {
    isLogin(state) {
      return state.isLoggedIn;
    },
    getRoles(state) {
      return state.userInfo.roles;
    },
    getUserInfo(state) {
      return state.userInfo;
    },
  },
  actions: {
    login({ account, password, roles, token }) {
      this.userInfo.username = account;
      this.userInfo.password = password;
      this.userInfo.roles = roles;
      this.userInfo.loginTime = new Date().toLocaleTimeString('zh-TW', { hour12: false });
      this.isLoggedIn = true;
      this.userInfo.token = token;
    },
    logout() {
      this.userInfo = {
        username: null,
        password: null,
        roles: [],
        loginTime: null,
        token: null,
      };
      this.isLoggedIn = false;
    },
  },
});

