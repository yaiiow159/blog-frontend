<script setup>
import axiosInstance from "@/utils/axiosHandler";
import { ref, onMounted, reactive } from 'vue';
import BreadcrumbBar from "@/components/BreadcrumbBar.vue";
import MessageSnakeBar from "@/components/MessageSnakeBar.vue";

const breadcrumbs = ref([
  { text: '首頁', disabled: false, href: '/home' },
  { text: '群組管理', disabled: true, href: '/groups' },
]);

const reviewLevels = ref([
  { text: '管理員', value: 'ADMIN' },
  { text: '使用者', value: 'USER' },
  { text: '查詢', value: 'SEARCH_ONLY' },
]);

const snackbar = reactive({
  visible: false,
  color: '',
  message: ''
});

const loading = ref(false);
const dialogLoading = ref(false);

const searchFields = reactive({
  name: '',
  reviewLevel: ''
});

const pageable = reactive({
  totalElements: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 10,
});

const userGroups = reactive([]);
const group = reactive({
  id: null,
  groupName: '',
  description: '',
  reviewLevel: ''
});

const dialogAddGroup = ref(false);
const dialogEditGroup = ref(false);

const headers = [
  { title: '序號', key: 'id', sortable: true },
  { title: '群組名稱', key: 'groupName', sortable: true },
  { title: '描述', key: 'description', sortable: false },
  { title: '覆核等級', key: 'reviewLevel', sortable: true },
  { title: '發布時間', key: 'createDate', sortable: true },
  { title: '更新時間', key: 'updDate', sortable: true },
  { title: '操作', key: 'actions', sortable: false },
];

onMounted(async () => {
  await getGroups();
});

async function getGroups() {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/groups', {
      params: {
        groupName: searchFields.name,
        reviewLevel: searchFields.reviewLevel,
        page: pageable.pageNumber,
        pageSize: pageable.pageSize,
      }
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      userGroups.splice(0, userGroups.length, ...apiResponse.data.content);
      handlePageChange(apiResponse);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '載入群組失敗');
  } finally {
    loading.value = false;
  }
}

async function getGroup(id) {
  loading.value = true;
  try {
    const response = await axiosInstance.get(`/groups/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      Object.assign(group, apiResponse.data);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '載入群組失敗');
  } finally {
    loading.value = false;
  }
}

function handleAddGroup() {
  resetGroup();
  dialogAddGroup.value = true;
}

function handleEditGroup(id) {
  resetGroup();
  getGroup(id);
  dialogEditGroup.value = true;
}

function resetGroup() {
  group.id = null;
  group.groupName = '';
  group.description = '';
  group.reviewLevel = '';
}

async function addGroup() {
  dialogLoading.value = true;
  try {
    const response = await axiosInstance.post('/groups', { ...group });
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      dialogAddGroup.value = false;
      await getGroups();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '請求失敗，請稍後再試。');
  } finally {
    dialogLoading.value = false;
  }
}

async function editGroup() {
  dialogLoading.value = true;
  try {
    const response = await axiosInstance.put('/groups', { ...group });
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      dialogEditGroup.value = false;
      await getGroups();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '請求失敗，請稍後再試。');
  } finally {
    dialogLoading.value = false;
  }
}

async function deleteGroup(id) {
  loading.value = true;
  try {
    const response = await axiosInstance.delete(`/groups/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      await getGroups();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '請求失敗，請稍後再試。');
  } finally {
    loading.value = false;
  }
}

function showSnackbar(color, message) {
  snackbar.color = color;
  snackbar.message = message;
  snackbar.visible = true;
}

function handlePageChange(apiResponse) {
  pageable.totalPages = apiResponse.data.totalPages;
  pageable.pageNumber = apiResponse.data.number + 1;
  pageable.pageSize = apiResponse.data.size;
  pageable.totalElements = apiResponse.data.totalElements;
}
</script>

<template>
  <!-- 導覽列  -->
  <BreadcrumbBar :items="breadcrumbs" />
  <!-- 消息顯示  -->
  <MessageSnakeBar :message="snackbar.message" :color="snackbar.color" v-if="snackbar.visible" />
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2">
      <v-text-field
        v-model="searchFields.name"
        density="compact"
        label="群組名稱"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        single-line
        hide-details
      />
      <v-select
        v-model="searchFields.reviewLevel"
        :items="reviewLevels"
        item-title="text"
        item-value="value"
        hide-details
        label="審查等級"
        variant="solo-filled"
        density="compact"
        class="ml-2"
      />
      <v-btn class="button-query ml-2 outlined" size="large" density="compact" @click="getGroups">
        查詢
      </v-btn>
      <v-btn class="button-add ml-2 outlined" size="large" density="compact" @click="handleAddGroup">
        新增
      </v-btn>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :loading="loading"
      multi-sort
      :sort-by="[{ key: 'groupName', order: 'asc'}, { key: 'id', order: 'asc'}]"
      loading-text="載入資料中..."
      :items="userGroups"
      :items-per-page="pageable.pageSize"
      height="calc(100vh - 300px)"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>群組列表</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn class="me-2 mb-2 outlined button-edit" density="compact" @click="handleEditGroup(item.id)">
          編輯
        </v-btn>
        <v-btn class="me-2 mb-2 outlined button-delete" density="compact" @click="deleteGroup(item.id)">
          刪除
        </v-btn>
      </template>
      <template v-slot:bottom>
        <div class="text-center pt-2">
          <v-pagination
            v-model="pageable.pageNumber"
            :length="pageable.totalPages"
            total-visible="5"
            @update:modelValue="getGroups"
            rounded="circle"
            density="compact"
          />
        </div>
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="dialogAddGroup" persistent max-width="600px" transition="dialog-bottom-transition" width="auto">
    <v-card flat :loading="dialogLoading" loading-text="加載中...">
      <v-card-title>
        <span class="text-h5">新增群組</span>
      </v-card-title>
      <v-form @submit.prevent="addGroup">
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="group.groupName"
                  label="名稱"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="group.description"
                  label="描述"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="group.reviewLevel"
                  :items="reviewLevels"
                  item-title="text"
                  item-value="value"
                  label="權限"
                  clearable
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn type="submit" class="button-add me-2 mb-2">
            新增
          </v-btn>
          <v-btn class="button-cancel me-2 mb-2" @click="dialogAddGroup = false">
            取消
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogEditGroup" persistent max-width="600px" transition="dialog-bottom-transition" width="auto">
    <v-card flat :loading="dialogLoading" loading-text="加載中...">
      <v-card-title>
        <span class="text-h5">編輯群組</span>
      </v-card-title>
      <v-form @submit.prevent="editGroup">
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="group.groupName"
                  label="群組名稱"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="group.description"
                  label="群組描述"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="group.reviewLevel"
                  :items="reviewLevels"
                  item-title="text"
                  item-value="value"
                  label="權限"
                  clearable
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn type="submit" variant="tonal" class="button-edit me-2 mb-2">
            編輯
          </v-btn>
          <v-btn class="button-cancel me-2 mb-2" variant="tonal" @click="dialogEditGroup = false">
            取消
          </v-btn>
        </v-card-actions>
      </v-form>
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
