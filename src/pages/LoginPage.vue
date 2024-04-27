<template>
  <div class="login-container ml-7">
    <v-container fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card elevation="2" color="transparent" width="650">
            <v-toolbar color="teal" flat>
              <v-toolbar-title>登入</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <v-text-field label="姓名" prepend-icon="mdi-account" type="text" v-model="loginForm.username" required :rules="usernameRules" clearable></v-text-field>
                <v-text-field label="密碼" prepend-icon="mdi-lock" type="password" v-model="loginForm.password" required :rules="passwordRules" clearable></v-text-field>
                <v-row>
                  <v-col cols="6">
                    <v-img class="pointer" :src="capchaCodeUrl" @click="refreshCaptchaCode"></v-img>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field label="驗證碼" prepend-icon="mdi-key" type="text" required :rules="captchaCodeRules" v-model="loginForm.captchaCode" clearable></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-btn color="teal" block @click="handleLogin">登入</v-btn>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-btn text="忘記密碼?" block @click="forgotPasswordDialog = true">忘記密碼?</v-btn>
                  </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn text="註冊新帳號" color="teal" @click="signUpDialog = true">註冊新帳號</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
  <v-dialog v-model="forgotPasswordDialog" persistent max-width="600px">
    <v-card class="pa-5 rounded-xl">
      <v-card-title class="text-h5">忘記密碼</v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="email" label="電子郵件" prepend-icon="mdi-email" type="text" required clearable></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="add" text="送出" @click="handleForgotPassword">送出</v-btn>
        <v-btn color="cancel" text="取消" @click="forgotPasswordDialog = false">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 註冊dialog -->
  <v-dialog v-model="signUpDialog" persistent max-width="600px">
    <v-card class="pa-5 rounded-xl">
      <v-card-title class="text-h5">
        註冊
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="registerForm.username" label="姓名" prepend-icon="mdi-account" type="text" required :rules="usernameRules" clearable></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="registerForm.password" label="密碼" prepend-icon="mdi-lock" type="password" required :rules="passwordRules" clearable></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="registerForm.nickname" label="暱稱" prepend-icon="mdi-account" type="text" clearable></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="registerForm.email" label="電子郵件" prepend-icon="mdi-email" type="email" required :rules="emailRules" clearable></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="registerForm.address" label="地址" prepend-icon="mdi-map-marker" type="text" clearable></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="add" text="註冊" @click="handleSignUp">註冊</v-btn>
        <v-btn color="cancel" text="取消" @click="signUpDialog = false">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="snackbar" :position="'fixed'" :color="snackbarColor" timeout="1000">
    {{ receiveMessage }}
  </v-snackbar>
  <v-progress-linear indeterminate v-if="loading"></v-progress-linear>
</template>

<script setup>
    import { ref } from 'vue'
    import axiosInstance from '@/utils/request'
    import { useUserStore } from '@/stores/user'
    import { useRouter } from 'vue-router'
    import { rules } from '@/utils/rules'

    const capchaCodeUrl = ref('http://localhost:9090/api/v1/auth/captchaCode')
    const isRefreshing = ref(false)
    const countdown = ref(0)
    const timer = ref(null)
    const capchaCode = ref('')
    const forgotPasswordDialog = ref(false)
    const email = ref('')
    const snackbar = ref(false)
    const snackbarColor = ref('')
    const receiveMessage = ref('')
    const loading = ref(false)
    const signUpDialog = ref(false)
    const router = useRouter()

    const loginForm = ref({
      username: '',
      password: '',
      captchaCode: '',
    })
    const registerForm = ref({
      username: '',
      password: '',
      email: '',
      address: '',
      birthday: null,
      nickname: '',
    })
    const { usernameRule, passwordRule, captchaCodeRule, emailRule } = rules
    const usernameRules = [usernameRule]
    const passwordRules = [passwordRule]
    const captchaCodeRules = [captchaCodeRule]
    const emailRules = [emailRule]

    async function refreshCaptchaCode() {
        if (isRefreshing.value) {
            return;
        }
        capchaCode.value = 'loading...';
        isRefreshing.value = true;
        countdown.value = 60;
        refreshCountdown();
        capchaCodeUrl.value = 'http://localhost:9090/api/v1/auth/captchaCode?refresh=' + Math.random()
    }

    function refreshCountdown() {
        timer.value = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
                clearInterval(timer.value);
                isRefreshing.value = false;
            }
        }, 1000);
    }

    async function handleForgotPassword() {
      loading.value = true
        await axiosInstance.post('/auth/forgetPassword', { email: email.value }).then((response) => {
         if(response.data.result) {
           loading.value = false
           snackbarColor.value = 'success'
           snackbar.value = true
           receiveMessage.value = response.data.message
           forgotPasswordDialog.value = false
         }
      }).catch(error => {
        loading.value = false
        snackbarColor.value = 'error'
        snackbar.value = true
        receiveMessage.value = error.response.data.message
      })
    }

    async function handleLogin() {
      loading.value = true
      axiosInstance.post('/auth/login', loginForm.value).then((response) => {
        if (response.data.result) {
          loading.value = false
          snackbarColor.value = 'success'
          snackbar.value = true
          receiveMessage.value = response.data.message
          const userInfo = response.data.data
          useUserStore().login(userInfo)
          router.push({ name: 'Home' })
        }
      }).catch(error => {
        loading.value = false
        snackbarColor.value = 'error'
        snackbar.value = true
        receiveMessage.value = error.response.data.message
      })
    }

    async function handleSignUp() {
      loading.value = true
      axiosInstance.post('/auth/register', registerForm.value).then((response) => {
        if (response.data.result) {
          loading.value = false
          snackbarColor.value = 'success'
          snackbar.value = true
          receiveMessage.value = response.data.message
          signUpDialog.value = false
          const userInfo = response.data.data
          useUserStore().login(userInfo)
          router.push({ name: 'Login' })
        }
      }).catch(error => {
        loading.value = false
        snackbarColor.value = 'error'
        snackbar.value = true
        receiveMessage.value = error.response.data.message
      })
    }
</script>

<style scoped lang="sass">
    .login-container
        display: flex
        justify-content: center
        align-items: center
        height: 100vh
    .pointer
      cursor: pointer
</style>
