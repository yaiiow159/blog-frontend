<script setup>
import axiosInstance from "@/utils/request";
import { ref, onMounted } from 'vue';
import {useUserStore} from "@/stores/user";


const breadcrumbs = ref([
  { text: '首頁', disabled: false, href: '/home' },
  { text: '郵件通知紀錄', disabled: true, href: '/notifications' },
])
const userStore = useUserStore()

const userInfo = sessionStorage.getItem('userInfo');
const user = JSON.parse(userInfo);

const loading = ref(false)
const snackbar = ref(false)
const snackbarColor = ref('')
const receiveMessage = ref('')
const searchFieldName = ref('')
const searchFieldSubject = ref('')
const searchFieldEmail = ref('')
const searchFieldIsRead = ref(false)
const pageable = ref({
  totalElements: Number(0),
  totalPages: Number(0),
  pageNumber: Number(1),
  pageSize: Number(10)
})
const isReads = ref([
  { text: '全部', value: null },
  { text: '未讀', value: 'false' },
  { text: '已讀', value: 'true' },
])
const notifications = ref([])
const dialogViewNotification = ref(false)
const headers = [
  { title: '序號', key: 'id', sortable: true},
  { title: '名稱', key: 'name', sortable: true},
  { title: '信箱', key: 'email', sortable: false},
  { title: '主旨', key: 'subject', sortable: true},
  { title: '內容', key: 'content', sortable: false},
  { title: '是否已讀', key: 'isRead', sortable: true},
  { title: '是否寄送', key: 'isSend',sortable: true},
  { title: '發布時間', key: 'createDate',sortable: true},
  { title: '更新時間', key: 'updDate',sortable: true},
  { title: '操作', key: 'actions',sortable: false},
]
const notification = ref({
  id: Number(''),
  name: '',
  email: '',
  subject: '',
  content: '',
  isRead: false,
  isSend: false
})
onMounted(async () => {
  await getNotifications()
})
async function getNotifications() {
  loading.value = true
  await axiosInstance.get('/notifications/' + user.account, {params: {
      name: searchFieldName.value,
      email: searchFieldEmail.value,
      subject: searchFieldSubject.value,
      isRead: searchFieldIsRead.value,
      page: pageable.value.pageNumber,
      pageSize: pageable.value.pageSize
    }}).then((response) => {
    const apiResponse = response.data;
    if (apiResponse.result) {
      notifications.value = apiResponse.data.content
      pageable.value.totalPages = apiResponse.data.totalPages
      pageable.value.totalElements = apiResponse.data.totalElements
      pageable.value.pageNumber = apiResponse.data.number + 1
      pageable.value.pageSize = apiResponse.data.size
    } else {
      snackbarColor.value = 'error';
      receiveMessage.value = apiResponse.message;
      snackbar.value = true;
    }
  }).catch(() => {
    loading.value = false
  }).finally(() => {
    loading.value = false
  })
}

async function getNotification(id) {
  loading.value = true
  await axiosInstance.get('/notifications/' + user.account + '/' + Number(id)).then((response) => {
    const apiResponse = response.data;
    if(apiResponse.result) {
      notification.value = apiResponse.data
      loading.value = false
    }
  }).catch(() => {
    loading.value = false
  })
}

function viewNotification(id) {
  getNotification(id)
  dialogViewNotification.value = true
}

function resetNotification() {
  notification.value = {
    id: Number(''),
    name: '',
    email: '',
    subject: '',
    content: ''
  }
}
</script>

<template>
  <v-breadcrumbs bg-color="breadcrumb" active-color="primary" rounded :items="breadcrumbs" divider=">" >
    <template v-slot:prepend>
      <v-icon icon="mdi-home" size="small"></v-icon>
    </template>
    <template v-slot:item="{ item }">
      <v-breadcrumbs-item :title="item.text" :href="item.href" :disabled="item.disabled">
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
  <v-card flat full-width>
    <v-card-title class="d-flex align-center pe-2">
      <v-icon icon="mdi-folder"></v-icon> &nbsp;
      郵件通知頁面
      <v-spacer></v-spacer>
      <v-text-field
          v-model="searchFieldName"
          density="compact"
          label="名稱"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          single-line
          hide-details
      ></v-text-field>
      <v-text-field
          class="ml-2"
          hide-details
          v-model="searchFieldEmail"
          density="compact"
          label="信箱"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          single-line
      ></v-text-field>
      <v-text-field
          class="ml-2"
      hide-details
      v-model="searchFieldSubject"
      density="compact"
      label="標題"
      prepend-inner-icon="mdi-magnify"
      variant="solo-filled"
      flat
      single-line
      ></v-text-field>
      <v-select class="ml-2" v-model="searchFieldIsRead" density="compact" label="是否已讀" variant="solo-filled"
                flat
                single-line :items="isReads" :item-title="item => item.text" :item-value="item => item.value">
      </v-select>
      <v-divider class="mx-2" inset vertical></v-divider>
      <v-btn :bordered="false" color="search" class="mr-2 outlined" size="large" density="compact" @click="getNotifications">查詢</v-btn>
    </v-card-title>
    <v-data-table multi-sort
                  :sort-by="[{ key: 'name', order: 'asc'}, { key: 'id', order: 'asc'}, { key: 'isRead', order: 'desc'}, { key: 'updDate', order: 'desc'}, { key: 'createDate', order: 'desc'}, { key: 'isSend', order: 'asc'}]"
                  :headers="headers"
                  :loading="loading"
                  loading-text="載入資料中..."
                  :items="notifications"
                  :items-per-page="pageable.pageSize"
                  height="calc(100vh - 300px)">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>郵件通知列表</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:item.isRead="{ item }">
        <v-chip :color="item.isRead ? 'success' : 'warning'" variant="outlined" density="compact">{{ item.isRead ? '已讀' : '未讀' }}</v-chip>
      </template>
      <template v-slot:item.isSend="{ item }">
        <v-chip :color="item.isSend ? 'success' : 'warning'" variant="outlined" density="compact">{{ item.isSend ? '已發送' : '未發送' }}</v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn  class="mr-2 outlined" density="compact" color="edit" @click="viewNotification(item.id)">查看詳情</v-btn>
      </template>
      <template v-slot:bottom>
        <div class="text-center pt-2">
          <v-pagination
              v-model="pageable.pageNumber"
              :length="pageable.totalPages"
              total-visible="5"
              @update:modelValue="getNotifications"
              rounded="circle"
              density="compact"
          ></v-pagination>
        </div>
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="dialogViewNotification" persistent max-width="600px">
    <v-card class="rounded-xl pa-5">
      <v-card-title>
        <span class="text-h5">查看郵件詳情</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col
                cols="12"
                sm="6"
                md="4"
            >
              名稱:
              <v-text-field
                  v-model="notification.name"
                  label="名稱"
                  readonly
              ></v-text-field>
            </v-col>
            <v-col
                cols="12">
              信箱:
              <v-text-field
                  v-model="notification.email"
                  label="信箱"
                  readonly
              ></v-text-field>
            </v-col>
            <v-col
                cols="12">
              主旨:
              <v-text-field
                  v-model="notification.subject"
                  label="標題"
                  readonly
              ></v-text-field>
            </v-col>
            <v-col
                cols="12">
              內文:
              <v-text-field
                  v-model="notification.content"
                  label="內文"
                  readonly
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="cancel"
            variant="text"
            @click="dialogViewNotification = false"
        >
          取消
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" :absolute="true" :top="true" :color="snackbarColor" timeout="1000">
    {{ receiveMessage }}
  </v-snackbar>
</template>

<style scoped lang="sass">
.v-btn
  transition: background-color 0.3s ease
.v-btn:hover
  background-color: var(--v-primary-base)
</style>
