<script setup>
import { reactive } from 'vue';
import axiosInstance from "@/utils/axiosHandler";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import Swal from 'sweetalert2';
import { commonRules } from '@/utils/rules';

const router = useRouter();
const userStore = useUserStore();
const userInfo = userStore.userInfo;

const state = reactive({
  drawer: false,
  snackbar: false,
  snackbarColor: 'success',
  receiveMessage: '',
  notificationCount: 0,
  loading: false,
  changePasswordFormValid: false,
  contactFormValid: false,
  userProfileFormValid: false,
  dialogUserProfile: false,
  dialogContact: false,
  dialogPassword: false,
  commentLiked: false,
  commentDisliked: false,
  userProfile: {
    id: null,
    username: '',
    email: '',
    address: '',
    password: '',
    nickname: '',
    phoneNumber: '',
    imageUrl: '',
  },
  userRecord: {
    commentCount: 0,
    articleCount: 0,
    articleLikeCount: 0,
    commentLikeCount: 0
  },
  passwordForm: {
    oldPassword: '',
    newPassword: '',
  },
  contactForm: {
    fromUser: '',
    email: '',
    message: ''
  }
});

async function getUserCommentRecord() {
  try {
    const response = await axiosInstance.get(`/common/userCommentLikeCount/${userStore.userInfo.username}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      state.userRecord.commentCount = apiResponse.data.commentCount;
      state.userRecord.commentLikeCount = apiResponse.data.commentLikes;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    console.error(error);
  }
}

async function getUserArticleRecord() {
  try {
    const response = await axiosInstance.get(`/common/userPostLikeCount/${userStore.userInfo.username}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      state.userRecord.articleCount = apiResponse.data.postCount;
      state.userRecord.articleLikeCount = apiResponse.data.postLikes;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    console.error(error);
  }
}

async function openUserProfile() {
  await getUserArticleRecord();
  await getUserCommentRecord();
  resetProfile();
  await handleUserProfile();
  state.dialogUserProfile = true;
}

function resetProfile() {
  state.userProfile = {
    username: '',
    email: '',
    address: '',
    phoneNumber: '',
    imageUrl: '',
    password: '',
    nickname: '',
  };
}

function openContact() {
  resetContact();
  state.dialogContact = true;
}

function resetContact() {
  state.contactForm = {
    fromUser: '',
    email: '',
    message: ''
  };
}

function openPassword() {
  resetPassword();
  state.dialogPassword = true;
}

function resetPassword() {
  state.passwordForm = {
    oldPassword: '',
    newPassword: '',
  };
}

function handlePassword() {
  handleChangePassword(state.passwordForm);
}

if (userInfo.token) {
  setInterval(notificationCounting, 20000);
}

function openNotification() {
  router.push("/notifications");
}

async function notificationCounting() {
  try {
    const response = await axiosInstance.get('/notifications/count');
    const apiResponse = response.data;
    if (apiResponse.result) {
      state.notificationCount = apiResponse.data;
    } else {
      state.notificationCount = 0;
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    console.error(error);
  }
}

async function handleChangePassword(password) {
  state.loading = true;
  try {
    const response = await axiosInstance.put('/users/changePassword', password);
    const apiResponse = response.data;
    if (apiResponse.result) {
      state.dialogPassword = false;
      showSnackbar('success', apiResponse.message);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', '發生錯誤,請稍後再試。');
  } finally {
    state.loading = false;
  }
}

async function logout() {
  state.loading = true;
  try {
    const result = await Swal.fire({
      title: '確定要登出嗎?',
      text: "登出後將無法回到登入頁面",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    });
    if (result.isConfirmed) {
      const response = await axiosInstance.post('/auth/logout');
      if (response.data === '登出成功') {
        userStore.logout();
        await router.push('/').then(() => {
          showSnackbar('success', response.data);
        });
      }
    }
  } catch (error) {
    showSnackbar('error', '發生錯誤,請稍後再試。');
  } finally {
    state.loading = false;
  }
}

async function updateProfile() {
  const formData = new FormData();
  Object.keys(state.userProfile).forEach(key => {
    formData.append(key, state.userProfile[key]);
  });

  try {
    const response = await axiosInstance.put('/users/updateProfile', formData);
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
}

async function handleUserProfile() {
  state.loading = true;
  try {
    const response = await axiosInstance.get(`/users/userProfile/${userStore.userInfo.username}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      state.userProfile = apiResponse.data;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    showSnackbar('error', '請選擇檔案');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showSnackbar('error', '檔案超過5MB');
    return;
  }
  if (file.type !== 'image/png') {
    showSnackbar('error', '檔案格式錯誤');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'user_avatars');

  try {
    const response = await axiosInstance.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      state.userProfile.imageUrl = apiResponse.data;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', '發生錯誤,請稍後再試。');
  }
}

async function handleContact() {
  state.loading = true;
  const formData = new FormData();
  Object.keys(state.contactForm).forEach(key => {
    formData.append(key, state.contactForm[key]);
  });

  try {
    const response = await axiosInstance.post('/communicate/contact', { formData });
    const apiResponse = response.data;
    if (apiResponse.result) {
      state.dialogContact = false;
      showSnackbar('success', apiResponse.message);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', '發生錯誤,請稍後再試。');
  } finally {
    state.loading = false;
  }
}

function showSnackbar(color, message) {
  state.snackbarColor = color;
  state.receiveMessage = message;
  state.snackbar = true;
}
</script>

<template>
  <v-app-bar>
    <v-app-bar-nav-icon icon="mdi-menu" @click.stop="state.drawer = !state.drawer"></v-app-bar-nav-icon>

    <v-toolbar-title>
      <v-img src="../assets/logo.png" width="100"></v-img>
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <template v-if="$vuetify.display.mdAndUp">
      <v-btn class="text-none" stacked variant="text" @click="openNotification">
        <v-badge color="error" :content="state.notificationCount">
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-menu open-on-hover offset-y v-if="$vuetify.display.mdAndUp">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list density="compact" nav :color="$vuetify.display.mobile ? 'primary' : undefined">
        <v-list-item prepend-icon="mdi-email" title="聯繫我們" @click="openContact"></v-list-item>
        <v-list-item prepend-icon="mdi-account" title="個人資訊" @click="openUserProfile"></v-list-item>
        <v-list-item prepend-icon="mdi-heart" title="收藏文章" to="/favoriteArticles"></v-list-item>
        <v-list-item prepend-icon="mdi-arrow-left" title="個人文章" to="/personalArticles"></v-list-item>
        <v-list-item prepend-icon="mdi-info" title="作者介紹" to="/about"></v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>

  <v-navigation-drawer v-model="state.drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary width="300">
    <v-list density="compact" nav>
      <v-list-item :prepend-icon="'mdi-account'" :prepend-avatar="state.userProfile.imageUrl">
        <v-list-item-title>歡迎 {{ userStore.userInfo.username }}</v-list-item-title>
        <v-list-item-subtitle v-if="userStore.userInfo.roles.includes('ROLE_ADMIN')">權限:<span style="color: rgb(128,128,128); font-weight: bold">管理員</span></v-list-item-subtitle>
        <v-list-item-subtitle v-else>權限:<span style="color: rgb(128,128,128); font-weight: bold">使用者</span></v-list-item-subtitle>
        <v-btn-group :theme="$vuetify.display.mobile ? 'dark' : undefined">
          <v-btn @click="openPassword" color="primary" variant="text">修改密碼</v-btn>
          <v-btn @click="logout" color="primary" variant="text">登出</v-btn>
        </v-btn-group>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-group value="articles" :prepend-icon="'mdi-file-document-multiple'">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-file-document-multiple" title="文章管理" to="/articles"></v-list-item>
        </template>
      </v-list-group>

      <v-list-group v-show="userStore.userInfo.roles.includes('ROLE_ADMIN')" value="management" :prepend-icon="'mdi-cog'">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-cog" title="管理"></v-list-item>
        </template>
        <v-list-item prepend-icon="mdi-folder" title="主題管理" to="/categories"></v-list-item>
        <v-list-item prepend-icon="mdi-tag" title="標籤管理" to="/tags"></v-list-item>
        <v-divider :thickness="1" class="my-2"></v-divider>
        <v-list-item prepend-icon="mdi-account" title="用戶管理" to="/users"></v-list-item>
        <v-list-item prepend-icon="mdi-account-group" title="群組管理" to="/groups"></v-list-item>
        <v-list-item prepend-icon="mdi-account-supervisor-circle" title="角色管理" to="/roles"></v-list-item>
      </v-list-group>

      <v-divider :thickness="1" class="my-2"></v-divider>

      <v-list-group value="settings" :prepend-icon="'mdi-reset-variant'">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-settings" title="操作紀錄"></v-list-item>
        </template>
        <v-list-item prepend-icon="mdi-login" title="使用者登入紀錄" to="/loginRecords"></v-list-item>
        <v-list-item prepend-icon="mdi-eye" title="瀏覽文章記錄" to="/recentViews"></v-list-item>
      </v-list-group>

      <v-divider :thickness="1" class="my-2"></v-divider>

      <v-list-group v-show="userStore.userInfo.roles.includes('ROLE_ADMIN')" value="admin">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-shield" title="管理員工具"></v-list-item>
        </template>
        <v-list-item prepend-icon="mdi-comment" title="評論審核" to="/commentReview"></v-list-item>
        <v-list-item prepend-icon="mdi-chart" title="儀表板" to="/dashboard"></v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>

  <!-- 修改密碼 -->
  <v-dialog v-model="state.dialogPassword" persistent max-width="500px" transition="dialog-bottom-transition">
    <v-card flat>
      <v-card-title class="text-h5 pa-5">修改密碼</v-card-title>
      <v-form ref="passwordForm" v-model="state.changePasswordFormValid" validate-on="lazy blur" @submit.prevent="handlePassword">
        <v-card-text class="pa-5">
          <v-row>
            <v-col cols="12" sm="4" md="6">
              <v-text-field v-model="state.passwordForm.oldPassword" label="舊密碼" :rules="[commonRules.required, commonRules.passwordRule]" required></v-text-field>
            </v-col>
            <v-col cols="12" sm="4" md="6">
              <v-text-field v-model="state.passwordForm.newPassword" label="新密碼" :rules="[commonRules.required, commonRules.passwordRule]" required></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn type="submit" class="button-add mr-2" text="送出" @click="handlePassword" :disabled="!state.changePasswordFormValid">送出</v-btn>
          <v-btn class="button-cancel" text="取消" @click="state.dialogPassword = false">取消</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <!-- 聯繫我 -->
  <v-dialog v-model="state.dialogContact" persistent max-width="500" transition="dialog-bottom-transition">
    <v-card flat>
      <v-card-title class="text-h5 pa-5">聯繫我</v-card-title>
      <v-form ref="contactForm" v-model="state.contactFormValid" validate-on="lazy blur" @submit.prevent="handleContact">
        <v-card-text class="pa-5">
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="state.contactForm.fromUser" label="姓名" :rules="[commonRules.required]" required></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="state.contactForm.email" label="電子郵件" :rules="[commonRules.required, commonRules.emailRule]" required></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="state.contactForm.message" label="訊息" required rows="5" cols="20" counter></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn type="submit" class="button-add mr-2" text="送出" @click="handleContact" :disabled="!state.contactFormValid">送出</v-btn>
          <v-btn class="button-cancel" text="取消" @click="state.dialogContact = false">取消</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <!-- 個人資訊 -->
  <v-dialog v-model="state.dialogUserProfile" persistent max-width="600px" transition="dialog-bottom-transition">
    <v-card flat>
      <v-card-title class="text-h5 mb-4">個人資訊</v-card-title>
      <v-form ref="userProfileForm" v-model="state.userProfileFormValid" @submit.prevent="updateProfile">
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="4" class="text-center mb-4">
                <v-avatar size="150" class="mb-2" :image="state.userProfile.imageUrl">
                  <span v-if="!state.userProfile.imageUrl" class="text-h4">{{ userStore.userInfo.username.charAt(0).toUpperCase() }}</span>
                </v-avatar>
                <v-file-input label="選擇圖片" prepend-icon="mdi-camera" @change="handleFileUpload" show-size accept="image/png" variant="outlined" class="mt-2"></v-file-input>
              </v-col>
              <v-col cols="12" md="8">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="state.userProfile.username" :rules="[commonRules.required, commonRules.usernameRule]" label="姓名" outlined dense></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="state.userProfile.password" :rules="[commonRules.required, commonRules.passwordRule]" label="密碼" type="password" outlined dense></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="state.userProfile.nickname" label="暱稱" outlined dense></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6" sm="4">
                    <v-text-field v-model="state.userProfile.email" :rules="[commonRules.required, commonRules.emailRule]" label="電子郵件" outlined dense></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field v-model="state.userProfile.address" label="地址" outlined dense></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="mt-4">
          <v-spacer></v-spacer>
          <v-btn class="button-edit mr-2" @click="updateProfile" type="submit" :disabled="!state.userProfileFormValid">編輯</v-btn>
          <v-btn class="button-cancel" @click="state.dialogUserProfile = false">關閉</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="sass">
.v-btn
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
  text-decoration: none
  transition: .2s ease-in-out

  &:hover
    color: var(--v-primary-base)
</style>
