<script setup>
import axiosInstance from "@/utils/axiosHandler";
import { ref, reactive, onMounted } from 'vue';
import BreadcrumbBar from "@/components/BreadcrumbBar.vue";
import MessageSnakeBar from "@/components/MessageSnakeBar.vue";

const breadcrumbs = ref([
  { text: '首頁', disabled: false, href: '/home' },
  { text: '使用者管理', disabled: true, href: '/users' },
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
  email: ''
});

const pageable = reactive({
  totalElements: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 10,
});

const users = reactive([]);
const groups = reactive([]);
const roles = reactive([]);
const user = reactive({
  id: null,
  userName: '',
  password: '',
  email: '',
  phoneNumber: '',
  nickName: '',
  birthday: null,
  address: '',
  roleIds: [],
  groupId: null,
  userGroupDto: {}
});

const dialogAddUser = ref(false);
const dialogEditUser = ref(false);

const headers = [
  { title: '序號', key: 'id', sortable: true },
  { title: '名稱', key: 'userName', sortable: true },
  { title: '密碼', key: 'password', sortable: false },
  { title: '電子郵件', key: 'email', sortable: true },
  { title: '角色', key: 'roleNames', sortable: false },
  { title: '群組', key: 'groupName', sortable: false },
  { title: '狀態', key: 'isLocked', sortable: true },
  { title: '發布時間', key: 'createDate', sortable: true },
  { title: '更新時間', key: 'updDate', sortable: true },
  { title: '操作', key: 'actions', sortable: false },
];

onMounted(async () => {
  await getUsers();
  await getRoles();
  await getGroups();
});

function formatePassword(password) {
  return '*'.repeat(password.length);
}

async function getUsers() {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/users', {
      params: {
        name: searchFields.name,
        email: searchFields.email,
        page: pageable.pageNumber,
        pageSize: pageable.pageSize,
      }
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      users.splice(0, users.length, ...apiResponse.data.content);
      pageable.totalPages = apiResponse.data.totalPages;
      pageable.pageNumber = apiResponse.data.number + 1;
      pageable.pageSize = apiResponse.data.size;
      pageable.totalElements = apiResponse.data.totalElements;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '載入使用者失敗');
  } finally {
    loading.value = false;
  }
}

async function getUser(id) {
  loading.value = true;
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      Object.assign(user, apiResponse.data);
      user.roleIds = user.roles.map(role => role.id);
      user.groupId = user.userGroupDto.id;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '載入使用者失敗');
  } finally {
    loading.value = false;
  }
}

async function getRoles() {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/roles/findList');
    const apiResponse = response.data;
    if (apiResponse.result) {
      roles.splice(0, roles.length, ...apiResponse.data);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '載入角色失敗');
  } finally {
    loading.value = false;
  }
}

async function getGroups() {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/groups/findList');
    const apiResponse = response.data;
    if (apiResponse.result) {
      groups.splice(0, groups.length, ...apiResponse.data);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '載入群組失敗');
  } finally {
    loading.value = false;
  }
}

function handleAddUser() {
  resetUser();
  dialogAddUser.value = true;
}

function handleEditUser(id) {
  resetUser();
  getUser(id);
  dialogEditUser.value = true;
}

function resetUser() {
  Object.assign(user, {
    id: null,
    userName: '',
    password: '',
    email: '',
    phoneNumber: '',
    nickName: '',
    birthday: null,
    address: '',
    roleIds: [],
    groupId: null,
    userGroupDto: {}
  });
}

async function addUser() {
  dialogLoading.value = true;
  try {
    const response = await axiosInstance.post('/users', { ...user });
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      dialogAddUser.value = false;
      await getUsers();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '新增使用者失敗');
  } finally {
    dialogLoading.value = false;
  }
}

async function editUser() {
  dialogLoading.value = true;
  try {
    const response = await axiosInstance.put('/users', { ...user });
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      dialogEditUser.value = false;
      await getUsers();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '編輯使用者失敗');
  } finally {
    dialogLoading.value = false;
  }
}

async function deleteUser(id) {
  loading.value = true;
  try {
    const response = await axiosInstance.delete(`/users/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      await getUsers();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '刪除使用者失敗');
  } finally {
    loading.value = false;
  }
}

async function handleEnable(id) {
  try {
    const response = await axiosInstance.post(`/users/unlocked/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      await getUsers();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '啟用使用者失敗');
  }
}

async function handleDisable(id) {
  try {
    const response = await axiosInstance.post(`/users/locked/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('error', apiResponse.message);
      await getUsers();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '停用使用者失敗');
  }
}

function showSnackbar(color, message) {
  snackbar.color = color;
  snackbar.message = message;
  snackbar.visible = true;
}
</script>

<template>
  <!-- 麵包屑導覽列 -->
  <BreadcrumbBar :items="breadcrumbs" />
  <!-- 訊息顯示列-->
  <MessageSnakeBar :message="snackbar.message" :color="snackbar.color" />

  <v-card flat>
    <v-card-title class="d-flex align-center pe-2">
      <v-text-field
        class="w-25"
        v-model="searchFields.name"
        density="compact"
        label="名稱"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        hide-details
        single-line
      />
      <v-text-field
        class="ml-2 w-25"
        v-model="searchFields.email"
        density="compact"
        label="信箱"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        hide-details
        single-line
      />
      <v-btn class="ml-2 button-query" size="large" density="compact" @click="getUsers">
        查詢
      </v-btn>
      <v-btn class="ml-2 button-add" size="large" density="compact" @click="handleAddUser">
        新增
      </v-btn>
    </v-card-title>
    <v-data-table
      :headers="headers"
      multi-sort
      :sort-by="[{ key: 'userName', order: 'asc' }, { key: 'id', order: 'asc' }]"
      :loading="loading"
      loading-text="載入資料中..."
      :items="users"
      :items-per-page="pageable.pageSize"
      height="calc(100vh - 300px)"
    >
      <template v-slot:top>
        <v-toolbar>
          <v-toolbar-title>使用者列表</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:item.password="{ item }">
        {{ formatePassword(item.password) }}
      </template>
      <template v-slot:item.roleNames="{ item }">
        <v-chip v-for="role in item.roleNames" :key="role" class="me-2 mb-2" size="small">
          {{ role }}
        </v-chip>
      </template>
      <template v-slot:item.isLocked="{ item }">
        <v-chip prepend-icon="mdi-check" v-if="item.isLocked !== 1" class="me-2 mb-2" size="small" color="success">
          啟用
        </v-chip>
        <v-chip v-else prepend-icon="mdi-close" class="me-2 mb-2" size="small" color="error">
          停用
        </v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn class="me-2 mb-2 button-edit" dense density="compact" @click="handleEditUser(item.id)">
          編輯
        </v-btn>
        <v-btn class="me-2 mb-2 button-delete" dense density="compact" @click="deleteUser(item.id)">
          刪除
        </v-btn>
        <v-btn-toggle :model-value="item.isLocked">
          <v-btn class="me-2 mb-2 button-add" dense density="compact" @click="handleEnable(item.id)">
            啟用
          </v-btn>
          <v-btn class="me-2 mb-2 button-delete" dense density="compact" @click="handleDisable(item.id)">
            停用
          </v-btn>
        </v-btn-toggle>
      </template>
      <template v-slot:bottom>
        <div class="text-center pt-2">
          <v-pagination
            v-model="pageable.pageNumber"
            :length="pageable.totalPages"
            total-visible="5"
            @update:modelValue="getUsers"
            rounded="circle"
            density="compact"
          />
        </div>
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="dialogAddUser" persistent max-width="600px" transition="dialog-bottom-transition" width="auto">
    <v-card flat>
      <v-card-title>
        <span class="text-h5">新增用戶</span>
      </v-card-title>
      <v-form @submit.prevent="addUser">
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="user.groupId"
                  :items="groups"
                  item-title="groupName"
                  item-value="id"
                  label="選擇群組"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="user.roleIds"
                  :items="roles"
                  item-title="roleName"
                  item-value="id"
                  label="選擇角色"
                  multiple
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6" sm="4">
                <v-text-field
                  v-model="user.userName"
                  label="名稱"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6" sm="4">
                <v-text-field
                  v-model="user.nickName"
                  label="暱稱"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6" sm="4">
                <v-text-field
                  v-model="user.password"
                  label="密碼"
                  required
                  type="password"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6" sm="4">
                <v-text-field
                  v-model="user.email"
                  label="電子郵件"
                  required
                  type="email"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6" sm="4">
                <v-text-field
                  v-model="user.address"
                  label="地址"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6" sm="4">
                <v-text-field
                  v-model="user.phoneNumber"
                  label="連絡電話"
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
          <v-btn class="button-cancel me-2 mb-2" @click="dialogAddUser = false">
            取消
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogEditUser" persistent max-width="600px" transition="dialog-bottom-transition" width="auto">
    <v-card flat :loading="dialogLoading" loading-text="加載中...">
      <v-card-title>
        <span class="text-h5">編輯用戶</span>
      </v-card-title>
      <v-form @submit.prevent="editUser">
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="4" md="6">
                <v-select
                  v-model="user.groupId"
                  :items="groups"
                  item-title="groupName"
                  item-value="id"
                  label="選擇群組"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="12" sm="4" md="6">
                <v-select
                  v-model="user.roleIds"
                  :items="roles"
                  item-title="roleName"
                  item-value="id"
                  label="選擇角色"
                  multiple
                  clearable
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="user.userName"
                  label="名稱"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="user.nickName"
                  label="暱稱"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="user.password"
                  label="密碼"
                  required
                  type="password"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="user.email"
                  label="電子郵件"
                  required
                  type="email"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="user.address"
                  label="地址"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="user.phoneNumber"
                  label="連絡電話"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn type="submit" class="button-edit outlined me-2 mb-2">
            編輯
          </v-btn>
          <v-btn class="button-cancel outlined me-2 mb-2" @click="dialogEditUser = false">
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
