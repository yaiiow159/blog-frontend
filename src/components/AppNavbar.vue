<script setup>
  import { ref } from 'vue'
  import axiosInstance from "@/utils/request";
  import {rules} from "@/utils/rules";
  import {useUserStore} from "@/stores/user";

  const drawer = ref(false);
  const userStore = useUserStore();
  const snackbar = ref(false);
  const snackbarColor = ref('success');
  const receiveMessage = ref('');
  const loading = ref(false);

  const valid = ref(false);
  const imageUrl = ref(null);
  const dialogUserProfile = ref(false);
  const dialogContact = ref(false)

  const contactForm = ref({
    fromUser: '',
    email: '',
    content: ''
  })
  const userProfile = ref({
    username: '',
    password: '',
    nickname: '',
    birthday: null,
    avatar: null,
    email: '',
    address: ''
  })

  async function updateProfile() {
    const formData = new FormData();
    formData.append('avatar', imageUrl.value);
    formData.append('username', userProfile.value.username);
    formData.append('password', userProfile.value.password);
    formData.append('nickname', userProfile.value.nickname);
    formData.append('birthday', userProfile.value.birthday);
    formData.append('email', userProfile.value.email);
    formData.append('address', userProfile.value.address);

    // 驗證
    if (rules.usernameRule(userProfile.value.username) === false) {
      receiveMessage.value = rules.usernameRule(userProfile.value.username);
      snackbarColor.value = 'error';
      snackbar.value = true;
      return
    }
    if (rules.passwordRule(userProfile.value.password) === false) {
      receiveMessage.value = rules.passwordRule(userProfile.value.password);
      snackbarColor.value = 'error';
      snackbar.value = true;
      return
    }
    if (rules.emailRule(userProfile.value.email) === false) {
      receiveMessage.value = rules.emailRule(userProfile.value.email);
      snackbarColor.value = 'error';
      snackbar.value = true;
    }
  }

  function handleFileChange(file) {
    if (!file) {
      imageUrl.value = null;
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      imageUrl.value = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function handleUserProfile() {
    loading.value = true;
    const username = userStore.userInfo.username
    axiosInstance.get(`/userProfile/get/${username}`)
      .then((response) => {
        userProfile.value = response.data;
        loading.value = false;
        imageUrl.value = userProfile.value.avatar;
      }).catch(error => {
        receiveMessage.value = error.response.data.message;
        snackbarColor.value = 'error';
        snackbar.value = true;
        loading.value = false;
      })
  }


  async function handleContact() {
    loading.value = true
    await axiosInstance.post('/communicate/contact', contactForm.value).then((response) => {
      if (response.data.result) {
        loading.value = false
        snackbarColor.value = 'success'
        receiveMessage.value = response.data.message
        snackbar.value = true
        dialogContact.value = false
      }
    }).catch((error) => {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = error.response.data.message
      snackbar.value = true
    })
  }

</script>

<template>
  <v-app-bar
      color="darkgrey"
      dark
  >
    <v-app-bar-nav-icon icon="mdi-menu" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

    <v-toolbar-title>我的部落格</v-toolbar-title>

    <v-spacer></v-spacer>

    <template v-if="$vuetify.display.mdAndUp">
      <v-btn icon="mdi-magnify" variant="text">
      </v-btn>
    </template>

    <v-menu
        open-on-hover
        offset-y
        v-if="$vuetify.display.mdAndUp"
    >
      <template v-slot:activator="{ props }">
        <v-btn
            v-bind="props"
        >
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list density="compact" nav :color="$vuetify.display.mobile ? 'primary' : undefined">
        <v-list-item prepend-icon="mdi-email" title="聯繫我們" value="contact" @click="dialogContact = true"></v-list-item>
        <v-list-item prepend-icon="mdi-account" title="個人資訊" value="profile" @click="handleUserProfile"></v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>

  <v-dialog v-model="dialogContact" persistent max-width="500">
    <v-card class="rounded-xl pa-5">
      <v-form ref="contactForm" lazy-validation v-model="valid">
        <v-card-title class="text-h5">聯繫我</v-card-title>
        <v-card-text>留下聯絡方式</v-card-text>
        <v-card-text>
          <v-text-field
              v-model="contactForm.fromUser"
              label="姓名"
              required
          ></v-text-field>
        </v-card-text>
        <v-card-text>
          <v-text-field
              v-model="contactForm.email"
              label="電子郵件"
              required
          ></v-text-field>
        </v-card-text>
        <v-card-text>
          <v-text-field
              v-model="contactForm.content"
              label="訊息"
              required
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="rounded-xl" color="edit" text="送出" @click="handleContact">送出</v-btn>
          <v-btn class="rounded-xl" color="cancel" text="取消" @click="dialogContact = false">取消</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogUserProfile" persistent max-width="600">
    <v-card class="pa-5 rounded-xl">
      <v-card-title class="text-h5">個人資訊</v-card-title>
      <v-form ref="userProfile" lazy-validation v-model="valid">
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" class="text-center">
                <v-avatar size="120" color="primary" :src="imageUrl">
                  <span class="white--text text-h5" v-if="!imageUrl">{{ userProfile.username }}</span>
                </v-avatar>
                <v-file-input
                  label="選擇圖片"
                  prepend-icon="mdi-camera"
                  @change="handleFileChange"
                  accept="image/png"
                  variant="solo-filled"
                ></v-file-input>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="userProfile.username" label="姓名" outlined dense></v-text-field>
                <v-text-field v-model="userProfile.password" label="密碼" type="password" outlined dense></v-text-field>
                <v-text-field v-model="userProfile.nickname" label="暱稱" outlined dense></v-text-field>
                <v-date-picker v-model="userProfile.birthday" label="生日" outlined dense dataformatas="yyyy/MM/dd"></v-date-picker>
                <v-text-field v-model="userProfile.email" label="電子郵件" outlined dense></v-text-field>
                <v-text-field v-model="userProfile.address" label="地址" outlined dense></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="edit" text="編輯" @click="updateProfile">編輯</v-btn>
          <v-btn color="cancel" text="取消" @click="dialogUserProfile = false">關閉</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" :position="'fixed'" :color="snackbarColor" timeout="1000">
    {{ receiveMessage }}
  </v-snackbar>
  <v-progress-linear indeterminate v-if="loading"></v-progress-linear>
</template>

<style scoped lang="sass">

</style>
