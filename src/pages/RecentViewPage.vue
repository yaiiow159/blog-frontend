<script setup>
import axiosInstance from "@/utils/request";
import { ref, onMounted } from 'vue';
import {useUserStore} from "@/stores/user";


const breadcrumbs = ref([
  { text: '首頁', disabled: false, href: '/home' },
  { text: '瀏覽紀錄', disabled: true, href: '/recentViews' },
])
const userStore = useUserStore()
const loading = ref(false)
const snackbar = ref(false)
const snackbarColor = ref('')
const receiveMessage = ref('')

const userInfo = sessionStorage.getItem('userInfo');
const user = JSON.parse(userInfo);

const searchFieldTitle = ref('')
const searchFieldAuthorName = ref('')
const searchFieldAuthorEmail = ref('')

const pageable = ref({
  totalElements: Number(0),
  totalPages: Number(0),
  pageNumber: Number(1),
  pageSize: Number(10)
})

const notifications = ref([])
const dialogViewRecentView = ref(false)
const headers = [
  { title: '序號', key: 'id', sortable: true},
  { title: '標題', key: 'title', sortable: true},
  { title: '作者名稱', key: 'authorName', sortable: false},
  { title: '作者郵件', key: 'authorEmail', sortable: true},
  { title: '內容', key: 'content', sortable: false},
  { title: '發布時間', key: 'createTimeStr',sortable: true},
  { title: '操作', key: 'actions',sortable: false},
]
const recentView = ref({
  id: Number(''),
  title: '',
  authorName: '',
  authorEmail: '',
  content: '',
  createTimeStr: ''
})
onMounted(async () => {
  await getRecentViews()
})
async function getRecentViews() {
  loading.value = true
  await axiosInstance.get('/recentViews', {params: {
      email: searchFieldAuthorEmail.value,
      authorName: searchFieldAuthorName.value,
      title: searchFieldTitle.value,
      username: user.username,
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

async function getRecentView(id) {
  loading.value = true
  await axiosInstance.get('/recentViews/' + Number(id)).then((response) => {
    const apiResponse = response.data;
    if(apiResponse.result) {
      recentView.value = apiResponse.data
      loading.value = false
    }
  }).catch(() => {
    loading.value = false
  })
}

function viewRecentView(id) {
  getRecentView(id)
  dialogViewRecentView.value = true
}

function resetRecentView() {
  recentView.value = {
    id: Number(''),
    title: '',
    authorName: '',
    authorEmail: '',
    content: '',
    createTimeStr: ''
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
      近期瀏覽頁面
      <v-spacer></v-spacer>
      <v-text-field
          class="ml-2"
          hide-details
          v-model="searchFieldAuthorName"
          density="compact"
          label="作者名稱"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          single-line
      ></v-text-field>
      <v-text-field
          class="ml-2"
          hide-details
          v-model="searchFieldAuthorEmail"
          density="compact"
          label="作者郵件"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          single-line
      ></v-text-field>
      <v-text-field
          class="ml-2"
          hide-details
          v-model="searchFieldTitle"
          density="compact"
          label="標題"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          single-line
      ></v-text-field>
      <v-divider class="mx-2" inset vertical></v-divider>
      <v-btn :bordered="false" color="search" class="mr-2 outlined" size="large" density="compact" @click="getRecentViews">查詢</v-btn>
    </v-card-title>
    <v-data-table multi-sort
                  :sort-by="[{ key: 'name', order: 'asc'}, { key: 'id', order: 'asc'}]"
                  :headers="headers"
                  :loading="loading"
                  loading-text="載入資料中..."
                  :items="notifications"
                  :items-per-page="pageable.pageSize"
                  height="calc(100vh - 300px)">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>近期瀏覽列表</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn  class="mr-2 outlined" density="compact" color="edit" @click="viewRecentView(item.id)">查看詳情</v-btn>
      </template>
      <template v-slot:bottom>
        <div class="text-center pt-2">
          <v-pagination
              v-model="pageable.pageNumber"
              :length="pageable.totalPages"
              total-visible="5"
              @update:modelValue="getRecentViews"
              rounded="circle"
              density="compact"
          ></v-pagination>
        </div>
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="dialogViewRecentView" persistent max-width="600px">
    <v-card class="rounded-xl pa-5">
      <v-card-title>
        <span class="text-h5">查看瀏覽紀錄</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col
                cols="12"
            >
              標題:
              <v-text-field
                  v-model="recentView.title"
                  label="名稱"
                  readonly
              ></v-text-field>
            </v-col>
            <v-col
                cols="12"
            >
              作者名稱:
              <v-text-field
                  v-model="recentView.authorName"
                  label="作者名稱"
                  readonly
              ></v-text-field>
            </v-col>
            <v-col
                cols="12"
            >
              作者郵箱:
              <v-text-field
                  v-model="recentView.authorEmail"
                  label="作者名稱"
                  readonly
              ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                >
              內容:
              <v-textarea
                  v-model="recentView.content"
                  label="內文"
                  readonly
              ></v-textarea>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="cancel"
            variant="text"
            @click="dialogViewRecentView = false"
        >
          關閉
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
