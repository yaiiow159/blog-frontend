/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'

import HomePage from "@/pages/HomePage.vue";
import LoginPage from "@/pages/LoginPage.vue";
import ResetPassword from "@/pages/ResetPassword.vue";
import NotFound from "@/pages/NotFound.vue";
import CategoryPage from "@/pages/CategoryPage.vue";
import ArticlePage from "@/pages/ArticlePage.vue";
import Swal from "sweetalert2";
import {useUserStore} from "@/stores/user";
import TagPage from "@/pages/TagPage.vue";
import UserPage from "@/pages/UserPage.vue";
import UserGroupPage from "@/pages/UserGroupPage.vue";
import RolePage from "@/pages/RolePage.vue";
import NotificationPage from "@/pages/NotificationPage.vue";
import LoginRecordPage from "@/pages/LoginRecordPage.vue";
import ArticleDetail from "@/components/ArticleDetail.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  extendRoutes: setupLayouts,
  routes: [
    {
      path: "/home",
      name: "Home",
      component: HomePage,
    },
    {
      path: "/",
      name: "Login",
      component: LoginPage,
    },
    {
      path: "/reset",
      name: "Reset",
      component: ResetPassword,
    },
    {
      path: "/categories",
      name: "Category",
      component: CategoryPage,
    },
    {
      path: "/articles",
      name: "Article",
      component: ArticlePage,
      children: [
        {
          path: "/:articleId",
          name: "ArticleDetail",
          component: ArticleDetail
        }
      ]
    },
    {
      path: "/tags",
      name: "Tag",
      component: TagPage,
    },
    {
      path: "/users",
      name: "User",
      component: UserPage,
    },
    {
      path: "/groups",
      name: "Group",
      component: UserGroupPage,
    },
    {
      path: "/roles",
      name: "Role",
      component: RolePage
    },
    {
      path: "/notifications",
      name: "Notification",
      component: NotificationPage
    },
    {
      path: "/loginRecords",
      name: "LoginRecords",
      component: LoginRecordPage
    },
    {
      path: "/404",
      name: "NotFound",
      component: NotFound,
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      redirect: '/404',
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = useUserStore().userInfo.token;
  // 驗證jwt token過期時間
  if (token) {
    const now = new Date();
    const expire = new Date(JSON.parse(atob(token.split('.')[1])).exp * 1000);
    if (now > expire) {
      Swal.fire({
        toast: true,
        showConfirmButton: false,
        icon: 'error',
        title: '權限驗證失敗',
        text: '登入逾時，請重新登入',
        showCancelButton: true,
        cancelButtonText: '取消',
        confirmButtonText: '重新登入',
      }).then(() => {
        useUserStore().logout();
        next({ name: 'Login', query: { redirect: to.fullPath } });
      });
    }
  }
  // 沒有jwt token 但是進入到登入頁面
  if (!token && !['/login', '/reset','/'].includes(to.path)) {
    next({name: 'Login', query: {redirect: to.fullPath}});
    return;
  }
  next();
});
export default router
