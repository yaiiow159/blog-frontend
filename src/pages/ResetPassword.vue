<template>
  <v-container>
    <v-form ref="reset_form" v-model="valid">
      <v-text-field
        v-model="formState.password"
        :rules="passwordRules"
        label="新密碼"
        type="password"
        required
      ></v-text-field>

      <v-text-field
        v-model="formState.confirmPassword"
        :rules="confirmPasswordRules"
        label="確認密碼"
        type="password"
        required
      ></v-text-field>

      <v-text-field
        v-model="formState.verificationCode"
        :rules="verificationCodeRules"
        label="驗證碼"
        required
      ></v-text-field>

      <v-btn
        :disabled="!valid"
        color="success"
        @click="resetPassword"
      >
        重設密碼
      </v-btn>
    </v-form>
  </v-container>

  <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor" top absolute >
    {{ receiveMessage }}
  </v-snackbar>

  <v-overlay :opacity="0.8" :model-value="loading" z-index="1000" absolute></v-overlay>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axiosInstance from "@/utils/request";
import {createRouter as $router} from "vue-router";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const snackbar = ref(false);
const snackbarColor = ref('success');
const receiveMessage = ref('');
const loading = ref(false);
const reset_form = ref(null);
const valid = ref(true);
const formState = reactive({
  password: '',
  confirmPassword: '',
  verificationCode: '',
});

const passwordRules = [
  v => !!v || '新密碼是必填的',
  v => (v && v.length >= 8) || '密碼必須至少8個字符',
];
const confirmPasswordRules = [
  v => !!v || '確認密碼是必填的',
  v => v === formState.password || '密碼和確認密碼不匹配',
];
const verificationCodeRules = [
  v => !!v || '驗證碼是必填的',
  v => (v && v.length === 4) || '驗證碼必須是6位數字',
];

async function resetPassword() {
  if (reset_form.value.validate()) {
    await axiosInstance.post('/auth/resetPassword', {
      password: formState.password,
      confirmPassword: formState.confirmPassword,
      verificationCode: formState.verificationCode
    }).then((response) => {
      if(response.data.result){
        snackbarColor.value = 'success';
        receiveMessage.value = response.data.message;
        snackbar.value = true;
        // 更改 userStore 的狀態
        userStore.updatePassword(formState.password);
        $router.push('/login');
      } else {
        snackbarColor.value = 'error';
        receiveMessage.value = response.data.message;
        snackbar.value = true;
      }
    }).catch((error) => {
      snackbarColor.value = 'error';
      receiveMessage.value = error.data.message;
      snackbar.value = true;
    })
  }
}
</script>

<style scoped lang="sass">


</style>
