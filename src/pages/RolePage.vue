<script setup>
import {onMounted, ref, reactive} from 'vue';
import axiosInstance from "@/utils/axiosHandler";
import BreadcrumbBar from "@/components/BreadcrumbBar.vue";
import MessageSnakeBar from "@/components/MessageSnakeBar.vue";

const breadcrumbs = ref([
  { text: '首頁', disabled: false, href: '/home' },
  { text: '角色管理', disabled: true, href: '/roles' },
]);

const loading = ref(false);
const dialogLoading = ref(false);
const snackbar = ref(false);
const snackbarColor = ref('');
const receiveMessage = ref('');
const roles = reactive([]);
const dialogAddRole = ref(false);
const dialogEditRole = ref(false);

const headers = [
  { title: '序號', key: 'id', sortable: true },
  { title: '名稱', key: 'roleName', sortable: true },
  { title: '描述', key: 'description', sortable: false },
  { title: '發布時間', key: 'createDate', sortable: true },
  { title: '更新時間', key: 'updDate', sortable: true },
  { title: '操作', key: 'actions', sortable: false },
];

const searchFieldName = ref('');

const pageable = reactive({
  totalElements: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 10,
});

const role = ref({
  id: null,
  roleName: '',
  description: '',
});

onMounted(getRoles);


function showSnackbar(color, message) {
  receiveMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

function handlePageChange(apiResponse) {
  pageable.totalElements = apiResponse.data.totalElements;
  pageable.totalPages = apiResponse.data.totalPages;
  pageable.pageNumber = apiResponse.data.number + 1;
  pageable.pageSize = apiResponse.data.size;
}

async function getRoles() {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/roles', {
      params: {
        name: searchFieldName.value,
        page: pageable.pageNumber,
        pageSize: pageable.pageSize,
      },
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      roles.value = apiResponse.data.content;
      handlePageChange(apiResponse);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', '發送請求時失敗，請稍後再試。');
  } finally {
    loading.value = false;
  }
}

async function getRole(id) {
  dialogLoading.value = true;
  try {
    const response = await axiosInstance.get(`/roles/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      role.value = apiResponse.data;
      dialogEditRole.value = true;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', '發送請求時失敗，請稍後再試。');
  } finally {
    dialogLoading.value = false;
  }
}

async function addRole() {
  try {
    loading.value = true;
    const response = await axiosInstance.post('/roles', {
      roleName: role.value.roleName,
      description: role.value.description,
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      dialogAddRole.value = false;
      await getRoles();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', '發送請求時失敗,請稍後再試。');
  } finally {
    loading.value = false;
  }
}

async function editRole(id) {
  try {
    loading.value = true;
    const response = await axiosInstance.put(`/roles/${id}`, {
      roleName: role.value.roleName,
      description: role.value.description,
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      dialogEditRole.value = false;
      await getRoles();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', '發送請求失敗,請稍後再試。');
  } finally {
    loading.value = false;
  }
}

async function deleteRole(id) {
  try {
    loading.value = true;
    const response = await axiosInstance.delete(`/roles/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      await getRoles();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', '發送請求時失敗,請稍後再試。');
  } finally {
    loading.value = false;
  }
}

function handleAddRole() {
  resetRole();
  dialogAddRole.value = true;
}

function handleEditRole(id) {
  resetRole();
  getRole(id);
}

function resetRole() {
  role.value = {
    id: null,
    roleName: '',
    description: '',
  };
}

</script>

<template>
  <!-- 導覽列 -->
  <BreadcrumbBar :items="breadcrumbs"></BreadcrumbBar>
  <!-- 消息顯示列 -->
  <MessageSnakeBar :message="receiveMessage" :color="snackbarColor"></MessageSnakeBar>

  <v-card flat>
    <v-card-title class="d-flex align-center pe-2">
      <v-text-field
        v-model="searchFieldName"
        density="compact"
        label="名稱"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        hide-details
        single-line
      ></v-text-field>
      <v-btn :bordered="false" color="search" class="ml-2 outlined" size="large" density="compact" @click="getRoles">
        查詢
      </v-btn>
      <v-btn :bordered="false" color="add" class="ml-2 outlined" size="large" density="compact" @click="handleAddRole">
        新增
      </v-btn>
    </v-card-title>
    <v-data-table
      :headers="headers"
      multi-sort
      :sort-by="[{ key: 'name', order: 'asc' }, { key: 'id', order: 'asc' }]"
      :loading="loading"
      loading-text="載入資料中..."
      :items="roles"
      :items-per-page="pageable.pageSize"
      height="calc(100vh - 300px)"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>角色列表</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn :bordered="false" class="me-2 mb-2 button-edit" density="compact" @click="handleEditRole(item.id)">
          編輯
        </v-btn>
        <v-btn :bordered="false" class="me-2 mb-2 button-delete" density="compact" @click="deleteRole(item.id)">
          刪除
        </v-btn>
      </template>
      <template v-slot:bottom>
        <div class="text-center pt-2">
          <v-pagination
            v-model="pageable.pageNumber"
            :length="pageable.totalPages"
            total-visible="5"
            rounded="circle"
            density="compact"
          ></v-pagination>
        </div>
      </template>
    </v-data-table>
  </v-card>

  <!-- 新增角色對話框 -->
  <v-dialog v-model="dialogAddRole" persistent width="auto" transition="dialog-bottom-transition">
    <v-card class="rounded-xl pa-5" :loading="loading" loading-text="加載中...">
      <v-card-title>
        <span class="text-h5">新增分類</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              名稱:
              <v-text-field v-model="role.roleName" label="名稱" required></v-text-field>
            </v-col>
            <v-col cols="12">
              描述:
              <v-text-field v-model="role.description" label="描述" required></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="button-add" variant="text" @click="addRole">新增</v-btn>
        <v-btn class="button-cancel" variant="text" @click="dialogAddRole = false">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 編輯角色對話框 -->
  <v-dialog v-model="dialogEditRole" persistent max-width="600px" transition="dialog-bottom-transition" width="auto">
    <v-card class="rounded-xl pa-5" :loading="dialogLoading" loading-text="加載中...">
      <v-card-title>
        <span class="text-h5">編輯分類</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              名稱:
              <v-text-field v-model="role.roleName" label="名稱" required></v-text-field>
            </v-col>
            <v-col cols="12">
              描述:
              <v-text-field v-model="role.description" label="描述" required></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="button-edit" variant="text" @click="editRole">新增</v-btn>
        <v-btn class="button-cancel" variant="text" @click="dialogAddRole = false">取消</v-btn>
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
