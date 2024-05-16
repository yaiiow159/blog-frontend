<script setup>
  import { ref, computed } from 'vue'
  import axiosInstance from "@/utils/request";
  import {rules} from "@/utils/rules";
  import {useUserStore} from "@/stores/user";
  import { useRouter } from "vue-router";
  import Swal from 'sweetalert2'

  const router = useRouter();
  const drawer = ref(false);
  const snackbar = ref(false);
  const snackbarColor = ref('success');
  const receiveMessage = ref('');
  const loading = ref(false);
  const userStore = useUserStore();
  const { usernameRule, passwordRule, emailRule } = rules
  const usernameRuleRef = [usernameRule]
  const passwordRuleRef = [passwordRule]
  const emailRuleRef = [emailRule]
  const userInfo = sessionStorage.getItem('userInfo');
  const user = JSON.parse(userInfo);

  const imageUrl = ref(null)
  const imageName = ref('');
  const imageFile = ref(null);
  const dialogUserProfile = ref(false);
  const dialogContact = ref(false)
  const dialogPassword = ref(false)
  const notificationCount = ref(0)
  const userProfile = ref({
    id: Number(''),
    username: '',
    email: '',
    address: '',
    birthday: null,
    avatar: null,
    password: '',
    nickname: '',
    avatarPath: '',
  })
  const userRecord = ref({
    commentCount: 0,
    articleCount: 0,
    articleLikeCount: 0,
    commentLikeCount: 0
  })
  const passwordForm = ref({
    oldPassword: '',
    newPassword: '',
  })

  const contactForm = ref({
    fromUser: '',
    email: '',
    message: ''
  })

  async function getUserCommentRecord() {
    axiosInstance.get('/common/userCommentLikeCount/' + userStore.userInfo.username).then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        userRecord.value.commentCount = apiResponse.data.commentCount
        userRecord.value.commentLikeCount = apiResponse.data.commentLikes
      } else {
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).catch((error) => {
        console.log(error)
    })
  }
  async function getUserArticleRecord() {
    axiosInstance.get('/common/userPostLikeCount/' + userStore.userInfo.username).then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        userRecord.value.articleCount = apiResponse.data.postCount
        userRecord.value.articleLikeCount = apiResponse.data.postLikes
      } else {
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).catch((error) => {
        console.log(error)
    })
  }

  async function openUserProfile() {
      await getUserArticleRecord()
      await getUserCommentRecord()
      await resetProfile()
      await handleUserProfile();
      dialogUserProfile.value = true
  }

  function resetProfile() {
    userProfile.value = {
      username: '',
      email: '',
      address: '',
      birthday: null,
      avatar: null,
      password: '',
      nickname: '',
    }
  }

  function openContact() {
    resetContact()
    dialogContact.value = true
  }

  function resetContact() {
    contactForm.value = {
      fromUser: '',
      email: '',
      message: ''
    }
  }
  function openPassword() {
    resetPassword()
    dialogPassword.value = true
  }

  function resetPassword() {
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
    }
  }


  function handlePassword() {
      handleChangePassword(passwordForm.value)
  }
  // 判斷是否登入才開始count通知數
  if(user.token) {
    setInterval(function () {notificationCounting()}, 50000)
  }

  function openNotification() {
    router.push("/notifications")
  }

  function handleFileUpload(e) {
    const files = e.target.files
    if (files[0] !== undefined) {
      imageName.value = files[0].name
      if (files[0].type.indexOf('png') === -1) {
        return
      }
      const fr = new FileReader()
      fr.readAsDataURL(files[0])
      fr.addEventListener('load', () => {
        imageUrl.value = fr.result
        imageFile.value = files[0]
      })
    } else {
      imageName.value = ''
      imageFile.value = null
      imageUrl.value = ''
    }
  }

  async function notificationCounting() {
   await axiosInstance.get('/notifications/count').then((response) => {
     const apiResponse = response.data
     if(apiResponse.result) {
       notificationCount.value = apiResponse.data
     } else {
       notificationCount.value = 0
       receiveMessage.value = apiResponse.message
       snackbarColor.value = 'error'
       snackbar.value = true
     }
   }).catch(() => {

   })
  }

  async function uploadAvatar() {
    await axiosInstance.post('/users/upload', {
      file: imageFile.value
    }).then((response) => {
        const apiResponse = response.data
        if(apiResponse.result) {
          receiveMessage.value = apiResponse.message
          snackbarColor.value = 'success'
          snackbar.value = true
        } else {
          receiveMessage.value = apiResponse.message
          snackbarColor.value = 'error'
          snackbar.value = true
        }
    }).catch(() => {
      loading.value = false
    })
  }

  async function handleChangePassword(password) {
    loading.value = true;

    const formData = new FormData();
    formData.append('oldPassword', password.oldPassword);
    formData.append('newPassword', password.newPassword);

    await axiosInstance.put('/users/changePassword',
      {
         formData
      }
    )
      .then((response) => {
        const apiResponse = response.data
        if(apiResponse.result) {
          dialogPassword.value = false;
          receiveMessage.value = apiResponse.message;
          snackbarColor.value = 'success';
          snackbar.value = true;
        } else {
          receiveMessage.value = apiResponse.message;
          snackbarColor.value = 'error';
          snackbar.value = true;
        }
        loading.value = false;
      }).catch(() => {
        loading.value = false;
      })
  }

  async function logout() {
    loading.value = true
    Swal.fire({
      title: '確定要登出嗎?',
      text: "登出後將無法回到登入頁面",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    }).then(async(result) => {
      if (result.isConfirmed) {
        await axiosInstance.post('/auth/logout').then((response) => {
          loading.value = false
          if(response.data === '登出成功') {
            userStore.logout()
            router.push('/')
          }
        })
      }
    })
  }


  async function updateProfile() {
    const formData = new FormData();
    formData.append('username', userProfile.value.username);
    formData.append('password', userProfile.value.password);
    formData.append('nickname', userProfile.value.nickname);
    formData.append('birthday', userProfile.value.birthday);
    formData.append('email', userProfile.value.email);
    formData.append('address', userProfile.value.address);

    await uploadAvatar().then(() => {
      axiosInstance.put('/users/updateProfile', formData).then((response) => {
        const apiResponse = response.data
        if(apiResponse.result) {
          receiveMessage.value = apiResponse.message
          snackbarColor.value = 'success'
          snackbar.value = true
        } else {
          receiveMessage.value = apiResponse.message
          snackbarColor.value = 'error'
          snackbar.value = true
        }
      }).catch(() => {
        loading.value = false
      })
    })
  }

  async function handleUserProfile() {
    loading.value = true;
    const username = userStore.userInfo.username
    axiosInstance.get('/users/userProfile/' + username)
      .then((response) => {
        const apiResponse = response.data
        if(apiResponse.result) {
          loading.value = false;
          userProfile.value = apiResponse.data;
        } else {
          loading.value = false;
          receiveMessage.value = apiResponse.message;
          snackbarColor.value = 'error';
          snackbar.value = true;
        }
      }).catch(() => {
        loading.value = false;
      })
  }


  async function handleContact() {
    loading.value = true

    const formData = new FormData();
    formData.append('fromUser', contactForm.value.fromUser);
    formData.append('email', contactForm.value.email);
    formData.append('message', contactForm.value.message);

    await axiosInstance.post('/communicate/contact', {
      formData
    }).then((response) => {
      const apiResponse = response.data
      if (apiResponse.result) {
        loading.value = false
        dialogContact.value = false
        receiveMessage.value = apiResponse.message
        snackbarColor.value = 'success'
        snackbar.value = true
      } else {
        loading.value = false
        receiveMessage.value = apiResponse.message
        snackbarColor.value = 'error'
        snackbar.value = true
      }
    }).catch(() => {
      loading.value = false
    })
  }

</script>

<template>
  <v-app-bar
      dark
  >
    <v-app-bar-nav-icon icon="mdi-menu" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

    <v-toolbar-title>
      <v-img src="../assets/logo.png" width="100"></v-img>
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <template v-if="$vuetify.display.mdAndUp">
      <v-btn class="text-none" stacked text @click="openNotification">
        <v-badge color="error" :content="notificationCount">
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
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
        <v-list-item prepend-icon="mdi-email" title="聯繫我們" value="contact" @click="openContact"></v-list-item>
        <v-list-item prepend-icon="mdi-account" title="個人資訊" value="profile" @click="openUserProfile"></v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    :location="$vuetify.display.mobile ? 'bottom' : undefined"
    temporary
    width="300"
  >
    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-account"
                   :prepend-avatar="userProfile.avatarPath"
                   :title="userProfile.username">
        <v-btn-group :theme="$vuetify.display.mobile ? 'dark' : undefined">
          <v-btn @click="openPassword" color="primary" variant="text">修改密碼</v-btn>
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
      <v-list-item prepend-icon="mdi-file-document-multiple" title="文章管理" value="article" to="/articles">
      </v-list-item>
      <v-list-item v-show="user.roles.includes('ROLE_ADMIN')" prepend-icon="mdi-folder" title="分類管理" value="category" to="/categories">
      </v-list-item>
      <v-list-item v-show="user.roles.includes('ROLE_ADMIN')" prepend-icon="mdi-tag" title="標籤管理" value="category" to="/tags">
      </v-list-item>

      <v-divider v-show="user.roles.includes('ROLE_ADMIN')"  :thickness='1' class="my-2"></v-divider>

      <v-list-item v-show="user.roles.includes('ROLE_ADMIN')" prepend-icon="mdi-account" title="用戶管理" value="user" to="/users">
      </v-list-item>
      <v-list-item v-show="user.roles.includes('ROLE_ADMIN')" prepend-icon="mdi-account-group" title="群組管理" value="user" to="/groups">
      </v-list-item>
      <v-list-item v-show="user.roles.includes('ROLE_ADMIN')" prepend-icon="mdi-account-supervisor-circle" title="角色管理" value="user" to="/roles">
      </v-list-item>

      <v-divider :thickness='1' class="my-2"></v-divider>

      <v-list-item prepend-icon="mdi-login" title="使用者登入紀錄" value="loginRecord" to="/loginRecords"></v-list-item>
      <v-list-item prepend-icon="mdi-eye" title="瀏覽文章記錄" value="reviewRecord" to="/recentViews"></v-list-item>
    </v-list>

  </v-navigation-drawer>

  <v-dialog v-model="dialogPassword" persistent max-width="300px">
    <v-card class="rounded-xl pa-5">
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
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogContact" persistent max-width="500">
    <v-card class="rounded-xl pa-5">
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
              v-model="contactForm.message"
              label="訊息"
              required
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="rounded-xl" color="edit" text="送出" @click="handleContact">送出</v-btn>
          <v-btn class="rounded-xl" color="cancel" text="取消" @click="dialogContact = false">取消</v-btn>
        </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogUserProfile" persistent max-width="600">
    <v-card class="pa-5 rounded-xl">
      <v-card-title class="text-h5">個人資訊</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
                <v-col cols="12" class="text-center">
                  <v-avatar size="120" class="ma-2" :image="userProfile.avatarPath">
                    <span class="text-h5" v-if="!userProfile.avatarPath">{{ userStore.userInfo.username }}</span>
                  </v-avatar>
                  <v-file-input
                    label="選擇圖片"
                    prepend-icon="mdi-camera"
                    @change="handleFileUpload"
                    show-size
                    accept="image/png"
                    variant="solo-filled"
                  ></v-file-input>
                </v-col>
                <v-col cols="12">
                  <v-text-field :rules="usernameRuleRef" v-model="userProfile.username"  label="姓名" outlined dense></v-text-field>
                  <v-text-field :rules="passwordRuleRef" v-model="userProfile.password"  label="密碼" type="password" outlined dense></v-text-field>
                  <v-text-field v-model="userProfile.nickname"  label="暱稱" outlined dense></v-text-field>
                  <v-text-field :rules="emailRuleRef" v-model="userProfile.email" label="電子郵件" outlined dense></v-text-field>
                  <v-text-field v-model="userProfile.address" label="地址" :model-value="userProfile.address" outlined dense></v-text-field>
                </v-col>
            </v-row>
            <v-row class="my-2">
              <v-col cols="6" md="3">
                <v-card height="100" max-height="100" class="pa-2 text-center">
                  <div class="subtitle-2">評論總數</div>
                  <div class="text-h6">{{ userRecord.commentCount ? userRecord.commentCount : 0 }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card height="100" max-height="100" class="pa-2 text-center">
                  <div class="subtitle-2">評論按讚總數</div>
                  <div class="text-h6">{{ userRecord.commentLikeCount ? userRecord.commentLikeCount : 0 }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card height="100" max-height="100" class="pa-2 text-center">
                  <div class="subtitle-2">文章總數</div>
                  <div class="text-h6">{{ userRecord.articleCount ? userRecord.articleCount : 0 }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card height="100" max-height="100" class="pa-2 text-center">
                  <div class="subtitle-2">文章按讚總數</div>
                  <div class="text-h6">{{ userRecord.articleLikeCount ? userRecord.articleLikeCount : 0 }}</div>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="edit" text="編輯" @click="updateProfile">編輯</v-btn>
          <v-btn color="cancel" text="取消" @click="dialogUserProfile = false">關閉</v-btn>
        </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" :position="'fixed'" :color="snackbarColor" timeout="1000">
    {{ receiveMessage }}
  </v-snackbar>
  <v-progress-linear indeterminate v-if="loading"></v-progress-linear>
</template>

<style scoped lang="sass">

</style>
