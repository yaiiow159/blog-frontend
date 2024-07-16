<template>
  <div class="login-container ml-7">
    <MessageSnakeBar :color="snackbar.color" :message="snackbar.message" v-if="snackbar.visible"/>
    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card :loading="loading" elevation="5" class="mx-auto" max-width="600">
            <v-toolbar color="dark">
              <v-toolbar-title>登入</v-toolbar-title>
            </v-toolbar>
            <v-form ref="loginForm" v-model="loginFormValid" validate-on="lazy blur" @submit.prevent="handleLogin">
              <v-card-text>
                <v-text-field
                  v-model.trim="loginForm.username"
                  @focus="checkFocus('username')"
                  @input="checkInput('username', $event)"
                  @update:modelValue="checkUpdate('username', $event)"
                  label="姓名"
                  prepend-icon="mdi-account"
                  :rules="[commonRules.required, commonRules.usernameRule]"
                  placeholder="請輸入姓名"
                  clearable
                />
                <v-text-field
                  v-model.trim="loginForm.password"
                  @focus="checkFocus('password')"
                  @input="checkInput('password', $event)"
                  @update:modelValue="checkUpdate('password', $event)"
                  label="密碼"
                  prepend-icon="mdi-lock"
                  type="password"
                  :rules="[commonRules.required, commonRules.passwordRule]"
                  placeholder="請輸入密碼"
                  clearable
                />
                <v-row>
                  <v-col cols="12" md="6">
                    <v-img class="pointer" :src="capchaCodeUrl" @click="refreshCaptchaCode"/>
                    <div v-show="countdown > 0" class="text-caption mt-1">
                      驗證碼有效時間 {{ countdown }} 秒
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.trim="loginForm.captchaCode"
                      label="驗證碼"
                      prepend-icon="mdi-key"
                      :rules="[commonRules.required]"
                      placeholder="請輸入驗證碼"
                      clearable
                    />
                  </v-col>
                </v-row>
                <v-card-actions>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-btn type="submit" variant="text" block :disabled="!loginFormValid">
                        登入
                      </v-btn>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-btn variant="text" block @click="openForgotPassword">忘記密碼?</v-btn>
                    </v-col>
                  </v-row>
                </v-card-actions>
                <v-card-actions>
                  <v-btn variant="text" block @click="openSignUp">註冊新帳號</v-btn>
                </v-card-actions>
              </v-card-text>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>

  <!-- 忘記密碼dialog -->
  <v-dialog v-model="forgotPasswordDialog" persistent max-width="600">
    <v-card class="px-5 py-5" flat :loading="dialogLoading">
      <v-card-title class="text-h5">忘記密碼</v-card-title>
      <v-form ref="forgotPasswordForm" v-model="forgotPasswordFormValid" validate-on="lazy blur"
              @submit.prevent="handleForgotPassword">
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="email"
                  label="電子郵件"
                  prepend-icon="mdi-email"
                  :rules="[commonRules.required, commonRules.emailRule]"
                  clearable
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn type="submit" class="button-add" variant="outlined" @click="handleForgotPassword"
                 :disabled="!forgotPasswordFormValid">送出
          </v-btn>
          <v-btn class="button-cancel" variant="outlined" @click="forgotPasswordDialog = false">取消</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <!-- 註冊dialog -->
  <v-dialog v-model="signUpDialog" persistent max-width="600" transition="dialog-bottom-transition">
    <v-card :loading="dialogLoading" class="px-5 py-5">
      <v-card-title class="text-h5">註冊</v-card-title>
      <v-form ref="registerForm" v-model="signUpFormValid" validate-on="lazy blur" @submit.prevent="handleSignUp">
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="registerForm.username"
                  label="姓名"
                  prepend-icon="mdi-account"
                  :rules="[commonRules.required, commonRules.usernameRule]"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="registerForm.password"
                  label="密碼"
                  prepend-icon="mdi-lock"
                  type="password"
                  :rules="[commonRules.required, commonRules.passwordRule]"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="registerForm.nickname"
                  label="暱稱"
                  prepend-icon="mdi-account"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="registerForm.email"
                  label="電子郵件"
                  prepend-icon="mdi-email"
                  type="email"
                  :rules="[commonRules.required, commonRules.emailRule]"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="registerForm.address"
                  label="地址"
                  prepend-icon="mdi-map-marker"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="registerForm.phoneNumber"
                  label="電話"
                  prepend-icon="mdi-phone"
                  clearable
                  :rules="[commonRules.phoneRule]"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn type="submit" class="button-add" variant="outlined" @click="handleSignUp" :disabled="!signUpFormValid">註冊</v-btn>
          <v-btn class="button-cancel" variant="outlined" @click="signUpDialog = false">取消</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {ref, reactive} from 'vue';
import axiosInstance from '@/utils/axiosHandler';
import {useUserStore} from '@/stores/user';
import {useRouter} from 'vue-router';
import {commonRules} from '@/utils/rules';
import MessageSnakeBar from '@/components/MessageSnakeBar.vue';

const router = useRouter();
const userStore = useUserStore();

const loginFormValid = ref(false);
const signUpFormValid = ref(false);
const forgotPasswordFormValid = ref(false);

const capchaCodeUrl = ref('http://localhost:9090/api/v1/auth/captchaCode');
const isRefreshing = ref(false);
const countdown = ref(0);
const timer = ref(null);

const forgotPasswordDialog = ref(false);
const signUpDialog = ref(false);
const email = ref('');

const snackbar = reactive({
  visible: false,
  color: '',
  message: ''
});

const dialogLoading = ref(false);
const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: '',
  captchaCode: '',
});

const registerForm = reactive({
  username: '',
  password: '',
  phoneNumber: '',
  email: '',
  address: '',
  nickname: '',
});

const resetRegisterForm = () => {
  registerForm.username = '';
  registerForm.password = '';
  registerForm.phoneNumber = '';
  registerForm.email = '';
  registerForm.address = '';
  registerForm.nickname = '';
};

const refreshCaptchaCode = () => {
  if (isRefreshing.value) return;
  capchaCodeUrl.value = `http://localhost:9090/api/v1/auth/captchaCode?refresh=${Math.random()}`;
  countdown.value = 60;
  refreshCountdown();
};

const refreshCountdown = () => {
  timer.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer.value);
      isRefreshing.value = false;
    }
  }, 1000);
};

const openForgotPassword = () => {
  email.value = '';
  forgotPasswordDialog.value = true;
};

const openSignUp = () => {
  resetRegisterForm();
  signUpDialog.value = true;
};

const showSnackbar = (color, message) => {
  snackbar.color = color;
  snackbar.message = message;
  snackbar.visible = true;
};

const handleForgotPassword = async () => {
  loading.value = true;
  try {
    const {data: apiResponse} = await axiosInstance.post('/auth/forgetPassword', {email: email.value});
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      forgotPasswordDialog.value = false;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', '請求時發生錯誤,請稍後再試');
  } finally {
    loading.value = false;
  }
};

const handleLogin = async () => {
  loading.value = true;
  try {
    const {data: apiResponse} = await axiosInstance.post('/auth/login', loginForm);
    if (apiResponse.result) {
      userStore.login(apiResponse.data);
      await router.push({name: 'Home'}).then(() => {
        showSnackbar('success', apiResponse.message);
      });
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', '請求時發生錯誤,請稍後再試');
  } finally {
    loading.value = false;
  }
};

const handleSignUp = async () => {
  loading.value = true;
  try {
    const {data: apiResponse} = await axiosInstance.post('/auth/register', registerForm);
    if (apiResponse.result) {
      signUpDialog.value = false;
      await router.push({name: 'Login'}).then(() => {
        showSnackbar('success', apiResponse.message);
      });
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', '請求時發生錯誤,請稍後再試');
  } finally {
    loading.value = false;
  }
};

// 監聽數據變化
watch(
  () => [loginForm.username, loginForm.password, loginForm.captchaCode],
  ([newUsername, newPassword, newCaptchaCode]) => {
    console.log('loginForm.username 新數據', newUsername);
    console.log('loginForm.password 新數據', newPassword);
    console.log('loginForm.captchaCode 新數據', newCaptchaCode);
  }
);

function checkFocus(field) {
  console.log(`${field} 輸入開始`);
}
function checkInput(field, event) {
  console.log(`${field} 欄位輸入:` +　'數值為:' + event.target.value);
}

function checkUpdate(field, event) {
  console.log(`${field} 欄位更新:`　+ '數值為:' + event.target.value);
}


</script>

<style scoped lang="sass">
.login-container
  display: flex
  justify-content: center
  align-items: center
  height: 100vh
  background-color: var(--v-background-base), linear-gradient(180deg, var(--v-primary-lighten1) 0%, var(--v-primary-base) 100%)

.pointer
  cursor: pointer

.v-btn
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
  text-decoration: none
  transition: .2s ease-in-out

  &:hover
    color: var(--v-primary-base)
</style>
