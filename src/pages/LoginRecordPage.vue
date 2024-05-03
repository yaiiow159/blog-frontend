<script setup>
import axiosInstance from "@/utils/request";
import { ref, onMounted } from 'vue';
import {useUserStore} from "@/stores/user";

const breadcrumbs = ref([
  { text: '首頁', disabled: false, href: '/home' },
  { text: '使用者登入紀錄', disabled: true, href: '/loginRecords' },
])
const userStore = useUserStore()
const loading = ref(false)
const snackbar = ref(false)
const snackbarColor = ref('')
const receiveMessage = ref('')
const search = ref({
  username: '',
  ipAddress: '',
  action: '',
})
const actions = [

]
const pageable = ref({
  totalElements: Number(0),
  totalPages: Number(0),
  pageNumber: Number(1),
  pageSize: Number(10)
})
const loginRecords = ref([])
const dialogViewNotification = ref(false)
const headers = [
  { title: '序號', key: 'id', sortable: true},
  { title: '使用者名稱', key: 'username', sortable: true},
  { title: 'IP位址', key: 'ipAddress', sortable: false},
  { title: '執行動作', key: 'action', sortable: true},
  { title: '登入時間', key: 'loginTimestamp',sortable: true},
  { title: '登出時間', key: 'logoutTimestamp',sortable: true},
  { title: '操作', key: 'actions',sortable: false},
]
const loginRecord = ref({
  id: Number(''),
  username: '',
  ipAddress: '',
  action: '',
  loginTimestamp: null,
  logoutTimestamp: null,
  userAgent: '',
})
onMounted(async () => {
  await getLoginRecords()
})
async function getLoginRecords() {
  loading.value = true
  await axiosInstance.get('/loginRecords/' + userStore.userInfo.username, {params: {
      username: search.value.username,
      ipAddress: search.value.ipAddress,
      action: search.value.action,
      page: pageable.value.pageNumber,
      pageSize: pageable.value.pageSize
    }}).then((response) => {
    const apiResponse = response.data;
    if (apiResponse.result) {
      loginRecords.value = apiResponse.data.content
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

async function getLoginRecord(id) {
  loading.value = true
  await axiosInstance.get('/loginRecords/' + Number(id)).then((response) => {
    const apiResponse = response.data;
    if(apiResponse.result) {
      loginRecord.value = apiResponse.data
      loading.value = false
    }
  }).catch(() => {
    loading.value = false
  })
}

function viewLoginRecord(id) {
  resetLoginRecord()
  getLoginRecord(id)
  dialogViewNotification.value = true
}

function resetLoginRecord() {
  loginRecord.value = {
    id: Number(''),
    username: '',
    ipAddress: '',
    action: '',
    loginTimestamp: null,
    logoutTimestamp: null,
    userAgent: ''
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
      使用者登入紀錄頁面
      <v-spacer></v-spacer>
      <v-text-field
          v-model="search.username"
          density="compact"
          label="使用者名稱"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          hide-details
          single-line
      ></v-text-field>
      <v-text-field
          class="ml-2"
          v-model="search.ipAddress"
          density="compact"
          label="IP位址"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          hide-details
          single-line
      ></v-text-field>
        <v-select class="ml-2" v-model="search.action" density="compact" label="執行動作" variant="solo-filled" flat hide-details>
          <template v-slot:label>
            執行動作
          </template>
          <v-list>
            <v-list-item
                v-for="item in actions"
                :title="item"
                :value="item"
            ></v-list-item>
          </v-list>
        </v-select>
      <v-divider class="mx-2" inset vertical></v-divider>
      <v-btn :bordered="false" color="search" class="mr-2 outlined" size="large" density="compact" @click="getLoginRecords">查詢</v-btn>
    </v-card-title>
    <v-data-table multi-sort
                  :sort-by="[
                  { key: 'username', order: 'asc'},
                  { key: 'id', order: 'asc'},
                  { key: 'loginTimestamp', order: 'asc'},
                  { key: 'logoutTimestamp', order: 'asc'}]"
                  :headers="headers"
                  :loading="loading"
                  loading-text="載入資料中..."
                  :items="loginRecords"
                  :items-per-page="pageable.pageSize"
                  height="calc(100vh - 300px)">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>分頁列表</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn  class="mr-2 outlined" density="compact" color="edit" @click="viewLoginRecord(item.id)">查看詳情</v-btn>
      </template>
      <template v-slot:bottom>
        <div class="text-center pt-2">
          <v-pagination
              v-model="pageable.pageNumber"
              :length="pageable.totalPages"
              total-visible="5"
              @update:modelValue="getLoginRecords"
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
        <span class="text-h5">新增分類</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col
                cols="12"
                sm="6"
                md="4"
            >
              使用者名稱:
              <v-text-field
                  v-model="loginRecord.username"
                  label="使用者名稱"
                  readonly
              ></v-text-field>
            </v-col>
            <v-col
                cols="12">
              IP位址:
              <v-text-field
                  v-model="loginRecord.ipAddress"
                  label="IP位址"
                  readonly
              ></v-text-field>
            </v-col>
            <v-col
                cols="12">
              執行動作:
              <v-text-field
                  v-model="loginRecord.action"
                  label="標題"
                  readonly
              ></v-text-field>
            </v-col>
            <v-col
                cols="12">
              瀏覽器資訊:
              <v-text-field
                  v-model="loginRecord.userAgent"
                  label="內文"
                  readonly
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
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
