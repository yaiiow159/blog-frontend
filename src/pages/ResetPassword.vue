<template>
  <v-container>
    <!-- 訊息顯示  -->
    <MessageSnakeBar :message="receiveMessage" :color="snackbarColor" v-if="snackbar"></MessageSnakeBar>

    <v-form ref="resetForm" v-model="resetFormValid" validate-on="lazy blur" @submit.prevent="resetPassword">
      <v-text-field
        v-model.trim="resetForm.newPassword"
        :rules="[commonRules.required, commonRules.passwordRule]"
        label="新密碼"
        type="password"
        required
      ></v-text-field>
      <v-btn
        :disabled="!resetFormValid"
        block
        type="submit"
      >
        重設密碼
      </v-btn>
    </v-form>
  </v-container>
  <v-overlay :opacity="0.8" :model-value="loading" z-index="999" absolute></v-overlay>
</template>

<script setup>
import { ref } from 'vue';
import axiosInstance from "@/utils/axiosHandler";
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from "@/stores/user";
import { commonRules } from '@/utils/rules';
import MessageSnakeBar from "@/components/MessageSnakeBar.vue";

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const snackbar = ref(false);
const snackbarColor = ref('success');
const receiveMessage = ref('');
const loading = ref(false);

const resetFormValid = ref(false);

const resetForm = ref({
  newPassword: '',
});

async function resetPassword() {
  loading.value = true;
  try {
    const response = await axiosInstance.post('/auth/resetPassword', {
      newPassword: resetForm.value.newPassword,
      token: route.query.token
    });

    if (response.data.result) {
      receiveMessage.value = response.data.message;
      userStore.userInfo.password = resetForm.value.newPassword;
      await router.push('/login').then(() => {
        showSnackbar('success', response.data.message);
      });
    } else {
      showSnackbar('error', response.data.message);
    }
  } catch (error) {
    showSnackbar('error', '發送請求失敗，請聯絡管理員。');
  } finally {
    loading.value = false;
  }
}

function showSnackbar(color, message) {
  snackbarColor.value = color;
  receiveMessage.value = message;
  snackbar.value = true;
}

</script>

<style scoped lang="sass">
</style>
