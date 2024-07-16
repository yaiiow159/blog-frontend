<script setup>
import axiosInstance from "@/utils/axiosHandler";
import { reactive, ref, onMounted } from 'vue';
import MessageSnakeBar from "@/components/MessageSnakeBar.vue";
import BreadcrumbBar from "@/components/BreadcrumbBar.vue";
import { useUserStore } from "@/stores/user";

const breadcrumbs = ref([
  { text: '首頁', disabled: false, href: '/home' },
  { text: '郵件通知紀錄', disabled: true, href: '/notifications' },
]);

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const dialogViewNotification = ref(false);
const loading = ref(false);
const snackbar = ref(false);
const snackbarColor = ref('');
const receiveMessage = ref('');

const searchFields = reactive({
  name: '',
  subject: '',
  email: '',
  isRead: false,
});

const pageable = reactive({
  totalElements: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 10,
});

const isReads = ref([
  { text: '全部', value: null },
  { text: '未讀', value: 'false' },
  { text: '已讀', value: 'true' },
]);

const notifications = reactive([]);
const notification = reactive({
  id: null,
  name: '',
  email: '',
  subject: '',
  content: '',
  isRead: false,
  isSend: false,
});

const headers = [
  { title: '序號', key: 'id', sortable: true },
  { title: '名稱', key: 'name', sortable: true },
  { title: '信箱', key: 'email', sortable: false },
  { title: '主旨', key: 'subject', sortable: true },
  { title: '內容', key: 'content', sortable: false },
  { title: '是否已讀', key: 'isRead', sortable: true },
  { title: '是否寄送', key: 'isSend', sortable: true },
  { title: '發布時間', key: 'createDate', sortable: true },
  { title: '更新時間', key: 'updDate', sortable: true },
  { title: '操作', key: 'actions', sortable: false },
];
onMounted(getNotifications);

async function getNotifications() {
  loading.value = true;
  try {
    const response = await axiosInstance.get(`/notifications/${userInfo.username}`, {
      params: {
        name: searchFields.name,
        email: searchFields.email,
        subject: searchFields.subject,
        isRead: searchFields.isRead,
        page: pageable.pageNumber,
        pageSize: pageable.pageSize,
      },
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      notifications.splice(notifications.length, ...apiResponse.data.content);
      handleChangePage(apiResponse);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', '請求失敗,請稍後再試。');
  } finally {
    loading.value = false;
  }
}

async function getNotification(id) {
  loading.value = true;
  try {
    const response = await axiosInstance.get(`/notifications/${userInfo.username}/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      Object.assign(notification, apiResponse.data);
    }
  } catch (error) {
    showSnackbar('error', '請求失敗,請稍後再試。');
  } finally {
    loading.value = false;
  }
}

function viewNotification(id) {
  getNotification(id);
  dialogViewNotification.value = true;
}

function showSnackbar(color, message) {
  snackbarColor.value = color;
  receiveMessage.value = message;
  snackbar.value = true;
}

function handleChangePage(apiResponse) {
  pageable.totalElements = apiResponse.data.totalElements;
  pageable.totalPages = apiResponse.data.totalPages;
  pageable.pageNumber = apiResponse.data.number + 1;
  pageable.pageSize = apiResponse.data.size;
}
</script>

<template>
  <!-- Breadcrumb -->
  <BreadcrumbBar :items="breadcrumbs" />

  <!-- Snackbar -->
  <MessageSnakeBar :color="snackbarColor" :message="receiveMessage" :show="snackbar" />

  <v-card flat>
    <v-card-title class="d-flex align-center justify-space-between px-4 py-2">
      <div class="d-flex align-center">
        <v-text-field v-model="searchFields.name" density="compact" label="名稱" prepend-inner-icon="mdi-magnify" variant="outlined" hide-details class="mr-2" />
        <v-text-field v-model="searchFields.email" density="compact" label="信箱" prepend-inner-icon="mdi-magnify" variant="outlined" hide-details class="mr-2" />
        <v-text-field v-model="searchFields.subject" density="compact" label="標題" prepend-inner-icon="mdi-magnify" variant="outlined" hide-details class="mr-2" />
        <v-select v-model="searchFields.isRead" class="mr-2" density="compact" label="是否已讀" variant="outlined" hide-details :items="isReads" :item-title="item => item.text" :item-value="item => item.value" />
      </div>
      <v-btn class="button-query outlined ml-2" variant="tonal" @click="getNotifications">查詢</v-btn>
    </v-card-title>

    <v-data-table
      multi-sort
      :sort-by="[
        { key: 'name', order: 'asc' },
        { key: 'id', order: 'asc' },
        { key: 'isRead', order: 'desc' },
        { key: 'updDate', order: 'desc' },
        { key: 'createDate', order: 'desc' },
        { key: 'isSend', order: 'asc' }
      ]"
      :headers="headers"
      :loading="loading"
      loading-text="載入資料中..."
      :items="notifications"
      :items-per-page="pageable.pageSize"
      height="calc(100vh - 300px)"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>郵件通知列表</v-toolbar-title>
        </v-toolbar>
      </template>

      <template v-slot:item.isRead="{ item }">
        <v-chip :color="item.isRead ? 'success' : 'warning'" variant="outlined" density="compact">
          {{ item.isRead ? '已讀' : '未讀' }}
        </v-chip>
      </template>

      <template v-slot:item.isSend="{ item }">
        <v-chip :color="item.isSend ? 'success' : 'warning'" variant="outlined" density="compact">
          {{ item.isSend ? '已發送' : '未發送' }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn class="mr-2 outlined button-edit" density="compact" @click="viewNotification(item.id)">查看詳情</v-btn>
      </template>

      <template v-slot:bottom>
        <div class="text-center pt-2">
          <v-pagination v-model="pageable.pageNumber" :length="pageable.totalPages" total-visible="5" @update:modelValue="getNotifications" rounded="circle" density="compact" />
        </div>
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="dialogViewNotification" persistent width="auto" transition="dialog-bottom-transition">
    <v-card flat>
      <v-card-title>
        <span class="text-h5">查看郵件詳情</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field v-model="notification.name" label="名稱" readonly />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="notification.email" label="信箱" readonly />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="notification.subject" label="標題" readonly />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="notification.content" label="內文" readonly />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="cancel" variant="text" @click="dialogViewNotification = false">返回</v-btn>
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
