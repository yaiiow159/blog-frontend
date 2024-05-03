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
    // 用户是否登录
    isLogin(state) {
      return state.isLoggedIn;
    },
    // 用户的角色
    getRoles(state) {
      return state.userInfo.roles;
    },
    // 用户的基本信息
    getUserInfo(state) {
      return state.userInfo;
    },
  },
  actions: {
    // 登录用户
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

