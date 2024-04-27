// Utilities
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户的基本信息
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
    updateRoles(roles) {
      this.userInfo.roles = roles;
    },
    updateLoginTime() {
      this.userInfo.loginTime = new Date().toISOString();
    },

    updateAccessToken(token) {
      this.userInfo.token = token;
    },
    updatePassword(password) {
      this.userInfo.password = password;
    },
  },
  actions: {
    // 登录用户
    login({ account, password, roles, token }) {
      this.userInfo.username = account;
      this.userInfo.password = password;
      this.userInfo.roles = roles;
      this.userInfo.loginTime = new Date().toLocaleTimeString();
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

