<script setup>
  import { ref } from 'vue'
  import {rules} from "@/utils/rules";
  import axiosInstance from "@/utils/request";
  import {createRouter as $router} from "vue-router";
  import {useUserStore} from "@/stores/user";

  const snackbar = ref(false)
  const snackbarColor = ref('success')
  const receiveMessage = ref('')
  const loading = ref(false)

  const valid = ref(false)
  const userStore = useUserStore();

  const dialogPassword = ref(false)
  const passwordForm = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const userProfile = ref({
    username: '',
    password: '',
    nickname: '',
    birthday: null,
    email: '',
    address: ''
  })
  const drawer = ref(false)

  function handlePassword() {
    let result = rules.confirmPasswordRule(passwordForm.value.newPassword, passwordForm.value.confirmPassword)
    if(result === true) {
      handleChangePassword(passwordForm.value)
    } else {
      receiveMessage.value = result
      snackbarColor.value = 'error'
      snackbar.value = true
    }
  }

  async function handleChangePassword(password) {
    loading.value = true;
    await axiosInstance.put('/users/changePassword', password)
      .then((response) => {
          if(response.data.result) {
            dialogPassword.value = false;
            receiveMessage.value = response.data.message;
            snackbarColor.value = 'success';
            snackbar.value = true;
          } else {
            receiveMessage.value = response.data.message;
            snackbarColor.value = 'error';
            snackbar.value = true;
          }
          loading.value = false;
      }).catch(error => {
        dialogPassword.value = false;
        receiveMessage.value = error.response.data.message;
        snackbarColor.value = 'error';
        snackbar.value = true;
        loading.value = false;
      })
  }

  async function logout() {
    loading.value = true
    await axiosInstance.post('/auth/logout').then((response) => {
        loading.value = false
        if(response.data.result) {
            receiveMessage.value = response.data.message
            snackbarColor.value = 'success'
            snackbar.value = true
            userStore.logout()
            $router.push({name: 'Login'})
        } else {
          receiveMessage.value = response.data.message
          snackbarColor.value = 'error'
          snackbar.value = true
        }
      }).catch(error => {
        loading.value = false
        receiveMessage.value = error.response.data.message
        snackbarColor.value = 'error'
        snackbar.value = true
      })
  }

</script>

<template>
  <v-navigation-drawer
    v-model="drawer"
    :location="$vuetify.display.mobile ? 'bottom' : undefined"
    temporary
    width="300"
  >
    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-account"
                   :prepend-avatar="userProfile.avatar"
                   :title="userProfile.username">
        <v-btn-group :theme="$vuetify.display.mobile ? 'dark' : undefined">
          <v-btn @click="handlePassword" color="primary" variant="text">修改密碼</v-btn>
          <v-btn @click="logout" color="primary" variant="text">登出</v-btn>
        </v-btn-group>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-home" title="首頁" value="home" to="/home"></v-list-item>
    </v-list>

    <v-divider :thickness="1"></v-divider>

    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-file-document-multiple" title="文章管理" value="article" to="/article">
      </v-list-item>
      <v-list-item prepend-icon="mdi-folder" title="分類管理" value="category" to="/category">
      </v-list-item>
      <v-list-item prepend-icon="mdi-tag" title="標籤管理" value="category" to="/category">
      </v-list-item>

      <v-divider :thickness='1'></v-divider>

      <v-list-item prepend-icon="mdi-account" title="用戶管理" value="user" to="/user">
      </v-list-item>
      <v-list-item prepend-icon="mdi-account-group" title="群組管理" value="user" to="/group">
      </v-list-item>
      <v-list-item prepend-icon="mdi-account-supervisor-circle" title="角色管理" value="user" to="/role">
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-dialog v-model="dialogPassword" persistent max-width="300px">
    <v-card class="rounded-xl pa-5">
      <v-form ref="passwordForm" lazy-validation v-model="valid">
        <v-card-title class="text-h5">修改密碼</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="passwordForm.oldPassword"
            label="舊密碼"
            required
          ></v-text-field>
          <v-text-field
            v-model="passwordForm.newPassword"
            label="新密碼"
            required
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="edit" text="送出" @click="handlePassword">送出</v-btn>
          <v-btn color="cancel" text="取消" @click="dialogPassword = false">取消</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="sass">

</style>
