<script setup>
import axiosInstance from "@/utils/axiosHandler";
import { ref, onMounted , reactive} from 'vue';
import { useUserStore } from "@/stores/user";
import BreadcrumbBar from "@/components/BreadcrumbBar.vue";
import MessageSnakeBar from "@/components/MessageSnakeBar.vue";

const breadcrumbs = ref([
  { text: '首頁', disabled: false, href: '/home' },
  { text: '瀏覽紀錄', disabled: true, href: '/recentViews' },
]);

const loading = ref(false);
const snackbar = ref(false);
const snackbarColor = ref('');
const receiveMessage = ref('');
const dialogViewRecentView = ref(false);

const userStore = useUserStore();
const user = userStore.userInfo;

const searchField = ref({
  title: '',
  authorName: '',
  authorEmail: ''
});

const pageable = reactive({
  totalElements: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 10
});

const notifications = reactive([]);
const recentView = reactive({
  id: '',
  title: '',
  authorName: '',
  authorEmail: '',
  content: '',
  createTimeStr: ''
});

onMounted(getRecentViews);

async function getRecentViews() {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/recentViews', {
      params: {
        ...searchField.value,
        username: user.username,
        page: pageable.value.pageNumber,
        pageSize: pageable.value.pageSize
      }
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      notifications.splice(0, notifications.length, ...apiResponse.data.content);
      handlePageChange(apiResponse);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', '發送失敗,請稍後再試。');
  } finally {
    loading.value = false;
  }
}

async function getRecentView(id) {
  loading.value = true;
  try {
    const response = await axiosInstance.get(`/recentViews/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      // 將資料 放入recentView
      Object.assign(recentView, apiResponse.data);
      dialogViewRecentView.value = true;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', '發送失敗,請稍後再試。');
  } finally {
    loading.value = false;
  }
}

function showSnackbar(color, message) {
  snackbarColor.value = color;
  receiveMessage.value = message;
  snackbar.value = true;
}

function handlePageChange(apiResponse) {
  pageable.totalElements = apiResponse.data.totalElements;
  pageable.totalPages = apiResponse.data.totalPages;
  pageable.pageNumber = apiResponse.data.number + 1;
  pageable.pageSize = apiResponse.data.size;
}

</script>

<template>
  <!-- 導覽列 -->
  <BreadcrumbBar :items="breadcrumbs" />

  <!-- 訊息顯示列 -->
  <MessageSnakeBar :message="receiveMessage" :color="snackbarColor" />

  <v-card flat full-width>
    <v-card-title class="d-flex align-center justify-space-between px-4 py-2">
      <div class="d-flex align-center">
        <v-text-field
          v-model="searchField.authorName"
          density="compact"
          label="作者名稱"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          class="mr-2"
        />

        <v-text-field
          v-model="searchField.authorEmail"
          density="compact"
          label="作者郵件"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          class="mr-2"
        />

        <v-text-field
          v-model="searchField.title"
          density="compact"
          label="標題"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
        />
      </div>

      <v-btn
        class="button-query ml-2"
        variant="tonal"
        @click="getRecentViews"
      >
        查詢
      </v-btn>
    </v-card-title>

    <!-- 瀏覽紀錄列表 -->
    <v-data-iterator :items="notifications" :items-per-page="pageable.pageSize" hide-default-footer>
      <template v-slot:default="props">
        <v-card v-for="item in props.items" :key="item.id" class="my-2">
          <v-card-title>{{ item.title }}</v-card-title>
          <v-card-subtitle>{{ item.authorName }} ({{ item.authorEmail }})</v-card-subtitle>
          <v-card-text>{{ item.content.substring(0,100) }}</v-card-text>
          <v-card-text>{{ item.createTimeStr }}</v-card-text>
          <v-card-actions class="d-flex justify-end">
            <v-btn bordered class="mr-2 outlined" size="large" density="compact" @click="getRecentView(item.id)">
              瀏覽
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-data-iterator>
  </v-card>

  <v-dialog v-model="dialogViewRecentView" persistent width="auto" transition="dialog-bottom-transition">
    <v-card flat>
      <v-card-title class="bg-primary text-white px-6 py-4">
        <span class="text-h5 font-weight-bold">{{ recentView.title }}</span>
      </v-card-title>

      <v-card-text class="px-6 py-4">
        <div class="mb-4">
          <div class="text-h6 font-weight-bold mb-2">作者資訊</div>
          <div class="text-body-1">
            <span class="font-weight-bold">作者名稱:</span> {{ recentView.authorName }}
          </div>
          <div class="text-body-1">
            <span class="font-weight-bold">作者郵箱:</span> {{ recentView.authorEmail }}
          </div>
        </div>

        <div class="mb-4">
          <div class="text-h6 font-weight-bold mb-2">文章內容</div>
          <p class="text-body-1" v-html="recentView.content"></p>
        </div>

        <div>
          <div class="text-h6 font-weight-bold mb-2">建立時間</div>
          <div class="text-body-1">{{ recentView.createTimeStr }}</div>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 py-4">
        <v-spacer></v-spacer>
        <v-btn class="button-cancel" variant="tonal" @click="dialogViewRecentView = false">
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
