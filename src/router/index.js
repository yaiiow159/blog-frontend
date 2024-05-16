/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import { defineAsyncComponent } from 'vue'

import Swal from "sweetalert2";
import {useUserStore} from "@/stores/user";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  extendRoutes: setupLayouts,
  routes: [
    {
      path: "/home",
      name: "Home",
      component: defineAsyncComponent(() => import("@/pages/HomePage.vue")),
    },
    {
      path: "/",
      name: "Login",
      component: defineAsyncComponent(() => import("@/pages/LoginPage.vue")),
    },
    {
      path: "/reset",
      name: "Reset",
      component: defineAsyncComponent(() => import("@/pages/ResetPassword.vue")),
    },
    {
      meta: { requiresAuth: true },
      path: "/categories",
      name: "Category",
      component: defineAsyncComponent(() => import("@/pages/CategoryPage.vue")),
    },
    {
      path: "/articles",
      name: "Article",
      component: defineAsyncComponent(() => import("@/pages/ArticlePage.vue")),
    },
    {
      meta: { requiresAuth: true },
      path: "/tags",
      name: "Tag",
      component: defineAsyncComponent(() => import("@/pages/TagPage.vue")),
    },
    {
      meta: { requiresAuth: true },
      path: "/users",
      name: "User",
      component: defineAsyncComponent(() => import("@/pages/UserPage.vue")),
    },
    {
      meta: { requiresAuth: true },
      path: "/groups",
      name: "Group",
      component: defineAsyncComponent(() => import("@/pages/UserGroupPage.vue")),
    },
    {
      meta: { requiresAuth: true },
      path: "/roles",
      name: "Role",
      component: defineAsyncComponent(() => import("@/pages/RolePage.vue")),
    },
    {
      path: "/notifications",
      name: "Notification",
      component: defineAsyncComponent(() => import("@/pages/NotificationPage.vue")),
    },
    {
      path: "/recentViews",
      name: "RecentViews",
      component: defineAsyncComponent(() => import("@/pages/RecentViewPage.vue")),
    },
    {
      path: "/loginRecords",
      name: "LoginRecords",
      component: defineAsyncComponent(() => import("@/pages/LoginRecordPage.vue")),
    },
    {
      path: "/404",
      name: "NotFound",
      component: defineAsyncComponent(() => import("@/pages/NotFound.vue")),
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      redirect: '/404',
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('userInfo') ? JSON.parse(sessionStorage.getItem('userInfo')).token : null
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
