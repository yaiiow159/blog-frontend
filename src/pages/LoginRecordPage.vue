<script setup>
import axiosInstance from "@/utils/axiosHandler";
import {onMounted, ref, reactive} from 'vue';
import {useUserStore} from "@/stores/user";
import BreadcrumbBar from "@/components/BreadcrumbBar.vue";
import MessageSnakeBar from "@/components/MessageSnakeBar.vue";

const breadcrumbs = ref([
  {text: '首頁', disabled: false, href: '/home'},
  {text: '使用者登入紀錄', disabled: true, href: '/loginRecords'},
]);

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const loading = ref(false);
const snackbar = ref(false);
const snackbarColor = ref('');
const receiveMessage = ref('');

const searchFields = reactive({
  username: '',
  action: '',
  ipAddress: '',
});

const actions = [
  {text: '全部', value: null},
  {text: '登入', value: 'login'},
  {text: '登出', value: 'logout'},
];

const pageable = reactive({
  totalElements: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 10,
});

const loginRecords = reactive([]);
const dialogViewNotification = ref(false);

const headers = [
  {title: '序號', key: 'id', sortable: true},
  {title: '使用者名稱', key: 'username', sortable: true},
  {title: 'IP位址', key: 'ipAddress', sortable: false},
  {title: '執行動作', key: 'action', sortable: true},
  {title: '登入時間', key: 'loginTimestamp', sortable: true},
  {title: '登出時間', key: 'logoutTimestamp', sortable: true},
  {title: '操作', key: 'actions', sortable: false},
];

const loginRecord = reactive({
  id: null,
  username: '',
  ipAddress: '',
  action: '',
  loginTimestamp: null,
  logoutTimestamp: null,
  userAgent: '',
});

onMounted(() => {
  getLoginRecords();
});


function handleChangePage(apiResponse) {
  pageable.totalPages = apiResponse.data.totalPages;
  pageable.totalElements = apiResponse.data.totalElements;
  pageable.pageNumber = apiResponse.data.number + 1;
  pageable.pageSize = apiResponse.data.size;
}

function researchLoginRecords() {
  getLoginRecords();
}

async function getLoginRecords() {
  loading.value = true;
  try {
    const response = await axiosInstance.get(`/loginRecords/${userInfo.username}`, {
      params: {
        username: searchFields.username,
        ipAddress: searchFields.ipAddress,
        action: searchFields.action,
        page: pageable.pageNumber,
        pageSize: pageable.pageSize,
      },
    });

    const apiResponse = response.data;
    if (apiResponse.result) {
      loginRecords.value = apiResponse.data.content;
      handleChangePage(apiResponse);
      researchLoginRecords();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', error.message);
  } finally {
    loading.value = false;
  }
}

async function getLoginRecord(id) {
  loading.value = true;
  try {
    const response = await axiosInstance.get(`/loginRecords/${userInfo.username}/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      loginRecord.value = apiResponse.data;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', error.message);
  } finally {
    loading.value = false;
  }
}

function viewLoginRecord(id) {
  resetLoginRecord();
  getLoginRecord(id);
  dialogViewNotification.value = true;
}

function resetLoginRecord() {
  Object.assign(loginRecord, {
    id: null,
    username: '',
    ipAddress: '',
    action: '',
    loginTimestamp: null,
    logoutTimestamp: null,
    userAgent: '',
  });
}

function showSnackbar(color, message) {
  snackbarColor.value = color;
  receiveMessage.value = message;
  snackbar.value = true;
}
</script>

<template>
  <!-- 導覽列 -->
  <BreadcrumbBar :items="breadcrumbs"></BreadcrumbBar>

  <!-- 訊息顯示 -->
  <MessageSnakeBar :color="snackbarColor" :message="receiveMessage"></MessageSnakeBar>

  <!-- 登入紀錄頁面 -->
  <v-card flat>
    <v-card-title class="d-flex align-center justify-space-between px-4 py-2">
      <div class="d-flex align-center">
        <v-text-field
          v-model="searchFields.username"
          density="compact"
          label="使用者名稱"
          prepend-inner-icon="mdi-magnify"
          hide-details
          class="mr-2"
        ></v-text-field>

        <v-text-field
          v-model="searchFields.ipAddress"
          density="compact"
          label="IP位址"
          prepend-inner-icon="mdi-magnify"
          hide-details
          class="mr-2"
        ></v-text-field>

        <v-select
          v-model="searchFields.action"
          density="compact"
          label="執行動作"
          variant="outlined"
          hide-details
          class="mr-2"
          :items="actions"
          item-title="text"
          item-value="value"
        ></v-select>
      </div>

      <v-btn
        class="ml-2 button-query"
        variant="tonal"
        @click="getLoginRecords"
      >
        查詢
      </v-btn>
    </v-card-title>
    <v-data-table
      multi-sort
      :sort-by="[
        { key: 'username', order: 'asc' },
        { key: 'id', order: 'asc' },
        { key: 'loginTimestamp', order: 'asc' },
        { key: 'logoutTimestamp', order: 'asc' }
      ]"
      :headers="headers"
      :loading="loading"
      loading-text="載入資料中..."
      :items="loginRecords"
      :items-per-page="pageable.pageSize"
      height="calc(100vh - 300px)"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>分頁列表</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn class="mr-2 button-query" density="compact" @click="viewLoginRecord(item.id)">
          查看詳情
        </v-btn>
      </template>
      <template v-slot:bottom>
        <div class="text-center pt-2">
          <v-pagination
            v-model="pageable.pageNumber"
            :length="pageable.totalPages"
            total-visible="5"
            @input="getLoginRecords"
            @update:modelValue="getLoginRecords"
            rounded
            density="compact"
          ></v-pagination>
        </div>
      </template>
    </v-data-table>
  </v-card>

  <v-alert border="top" colored-border type="error" elevation="2">
    資料只會保存一天前的登入紀錄，後端系統會自行進行定時清理
  </v-alert>

  <v-dialog v-model="dialogViewNotification" persistent transition="dialog-bottom-transition" width="auto">
    <v-card flat>
      <v-card-title class="bg-primary text-white px-5 py-3">
        <span class="text-h5 font-weight-bold">登入記錄詳情</span>
      </v-card-title>

      <v-card-text class="px-5 py-3">
        <v-container>
          <v-row>

            <v-col cols="12" sm="6" md="4" class="py-2">
              <span class="font-weight-bold">使用者名稱:</span>
              <v-text-field
                v-model="loginRecord.username"
                label="使用者名稱"
                readonly
                density="compact"
                variant="outlined"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6" md="4" class="py-2">
              <span class="font-weight-bold">IP位址:</span>
              <v-text-field
                v-model="loginRecord.ipAddress"
                label="IP位址"
                readonly
                density="compact"
                variant="outlined"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6" md="4" class="py-2">
              <span class="font-weight-bold">執行動作:</span>
              <v-text-field
                v-model="loginRecord.action"
                label="執行動作"
                readonly
                density="compact"
                variant="outlined"
              ></v-text-field>
            </v-col>

            <v-col cols="12" class="py-2">
              <span class="font-weight-bold">瀏覽器資訊:</span>
              <v-text-field
                v-model="loginRecord.userAgent"
                label="瀏覽器資訊"
                readonly
                density="compact"
                variant="outlined"
              ></v-text-field>
            </v-col>

          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions class="px-5 pb-5">
        <v-spacer></v-spacer>
        <v-btn
          class="button-cancel"
          variant="tonal"
          @click="dialogViewNotification = false"
        >
          關閉
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="sass">
.v-btn
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
  text-decoration: none
  transition: .2s ease-in-out

  &:hover
    color: var(--v-primary-base)
</style>
