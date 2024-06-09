<template>
  <v-container>
    <v-form ref="resetForm" lazy-validation>
      <v-text-field
        v-model="resetForm.password"
        :rules="passwordRules"
        label="新密碼"
        type="password"
        required
      ></v-text-field>

      <v-text-field
        v-model="resetForm.confirmPassword"
        :rules="confirmPasswordRules"
        label="確認密碼"
        type="password"
        required
      ></v-text-field>

      <v-text-field
        v-model="resetForm.verificationCode"
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

  <v-snackbar v-model="snackbar" :timeout="2000" :color="snackbarColor" top absolute >
    {{ receiveMessage }}
  </v-snackbar>

  <v-overlay :opacity="0.8" :model-value="loading" z-index="999" absolute></v-overlay>
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
const valid = ref(true);
const resetForm = ref({
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
  v => v === resetForm.password || '密碼和確認密碼不匹配',
];
const verificationCodeRules = [
  v => !!v || '驗證碼是必填的',
  v => (v && v.length === 4) || '驗證碼必須是4位數字',
];

async function resetPassword() {
    await axiosInstance.post('/auth/resetPassword', {
      password: resetForm.value.password,
      confirmPassword: resetForm.value.confirmPassword,
      verificationCode: resetForm.value.verificationCode
    }).then((response) => {
      if(response.data.result){
        snackbarColor.value = 'success';
        receiveMessage.value = response.data.message;
        snackbar.value = true;
        userStore.userInfo.password = resetForm.value.password
        $router.push('/login');
      } else {
        snackbarColor.value = 'error';
        receiveMessage.value = response.data.message;
        snackbar.value = true;
      }
    }).catch(() => {
    })
}
</script>

<style scoped lang="sass">


</style>
