import { defineStore } from 'pinia';

// sessionStorage加載用戶資訊
function loadUserInfo() {
  const userInfo = sessionStorage.getItem('userInfo');
  if (userInfo) {
    return JSON.parse(userInfo);
  }
  return {
    username: null,
    password: null,
    roles: [],
    loginTime: null,
    token: null,
  };
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: loadUserInfo(),
    isLoggedIn: !!sessionStorage.getItem('isLoggedIn'),
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
      this.userInfo.token = token;
      this.isLoggedIn = true;

      // 將用戶資訊同步保存到SessionStorage中
      sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo));
      sessionStorage.setItem('isLoggedIn', 'true');
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
      // 清除 localStorage 中的用户信息和登录状态
      sessionStorage.removeItem('userInfo');
      sessionStorage.removeItem('isLoggedIn');
    },
  },
});
