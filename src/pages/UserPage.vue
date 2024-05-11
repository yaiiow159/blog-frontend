<script setup>
import axiosInstance from "@/utils/request";
import { ref, onMounted,watch } from 'vue';

const breadcrumbs = ref([
  { text: '首頁', disabled: false, href: '/home' },
  { text: '使用者管理', disabled: true, href: '/users' },
])
const loading = ref(false)
const dialogLoading = ref(false)

const snackbar = ref(false)
const snackbarColor = ref('')
const receiveMessage = ref('')

const users = ref([])
const dialogAddUser = ref(false)
const dialogEditUser = ref(false)
const headers = [
  { title: '序號', key: 'id', sortable: true},
  { title: '名稱', key: 'userName', sortable: true },
  { title: '密碼', key: 'password', sortable: false},
  { title: '電子郵件', key: 'email',sortable: true },
  { title: '角色', key: 'roleNames', sortable: false },
  { title: '群組', key: 'groupName', sortable: false },
  { title: '狀態', key: 'status', sortable: true },
  { title: '發布時間', key: 'createDate', sortable: true },
  { title: '更新時間', key: 'updateDate',sortable: true },
  { title: '操作', key: 'actions',sortable: false },
]
const groups = ref([])
const roles = ref([])
const user = ref({
      id: Number(''),
      userName: '',
      password: '',
      email: '',
      phone: '',
      nickName: '',
      birthday: null,
      address: '',
      roleIds: Number([]),
      status: '',
      groupId: Number(''),
      userGroupDto: {

      }
    }
)
const search = ref({
  name: '',
  email: '',
})
const pageable = ref({
  totalElements: Number(0),
  totalPages: Number(0),
  pageNumber: Number(1),
  pageSize: Number(10)
})
onMounted(async () => {
  await getUsers()
  await getRoles()
  await getGroups()
})

function formatDate(date) {
  // 轉換成 YYYY-MM-DD:HH:mm:ss 格式
  return new Date(date).toISOString().split('T')[0]
}

function formatePassword(password) {
  return '*'.repeat(password.length)
}
async function getUsers() {
  loading.value = true
  await axiosInstance.get('/users', {params:
        {
          name: search.value.name,
          email: search.value.email,
          page: pageable.value.pageNumber,
          pageSize: pageable.value.pageSize
        }
      }
    ).then((response) => {
    const apiResponse = response.data
    if(apiResponse.result) {
      users.value = apiResponse.data.content
      pageable.value.totalPages = apiResponse.data.totalPages
      pageable.value.pageNumber = apiResponse.data.number + 1
      pageable.value.pageSize = apiResponse.data.size
      pageable.value.totalElements = apiResponse.data.totalElements
      loading.value = false
    } else {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  }).catch(() => {
    loading.value = false
  })
}


async function getUser(id) {
  loading.value = true
  await axiosInstance.get('/users/' + Number(id)).then((response) => {
    const apiResponse = response.data
    if(apiResponse.result) {
      user.value = apiResponse.data
      loading.value = false
      // 如果roles包含 roleIds的id 則勾選
      user.value.roleIds = user.value.roles.map(role => role.id)
      user.value.groupId = user.value.userGroupDto.id
    } else {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  }).catch(() => {
    loading.value = false
  })
}

async function getRoles() {
  loading.value = true
  await axiosInstance.get('/roles/findList').then((response) => {
    const apiResponse = response.data
    if(apiResponse.result) {
      roles.value = apiResponse.data
      loading.value = false
    }else {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  }).catch(() => {
    loading.value = false
  })
}

async function getGroups() {
  loading.value = true
  await axiosInstance.get('/groups/findList').then((response) => {
    const apiResponse = response.data
    if(apiResponse.result) {
      groups.value = apiResponse.data
      loading.value = false
    }else {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  }).catch(() => {
    loading.value = false
  })
}

function handleAddUser() {
  resetUser()
  dialogAddUser.value = true
}

function handleEditTag(id) {
  resetUser()
  getUser(id)
  dialogEditUser.value = true
}

function resetUser() {
  user.value = {
    id: Number(''),
    userName: '',
    password: '',
    email: '',
    nickName: '',
    phone: '',
    birthday: null,
    address: '',
    roleIds: [],
    groupId: Number('')
  }
}
async function addUser() {
  await axiosInstance.post('/users', {
    groupId: user.value.groupId,
    userName: user.value.userName,
    password: user.value.password,
    email: user.value.email,
    nickName: user.value.nickName,
    birthday: user.value.birthday,
    address: user.value.address,
    roleIds: user.value.roleIds,
    phone: user.value.phone
  }).then((response) => {
    loading.value = true
    const apiResponse = response.data
    if(apiResponse.result) {
      loading.value = false
      snackbarColor.value = 'success'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
      dialogAddUser.value = false
    } else {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  }).catch(() => {
    loading.value = false
  }).finally(() => {
    dialogAddUser.value = false
    getUsers()
  })
}

async function editUser() {
  await axiosInstance.put('/users', {
    id: user.value.id,
    groupId: user.value.groupId,
    userName: user.value.userName,
    password: user.value.password,
    email: user.value.email,
    nickName: user.value.nickName,
    birthday: user.value.birthday,
    address: user.value.address,
    roleIds: user.value.roleIds,
    phone: user.value.phone
  }).then((response) => {
    loading.value = true
    const apiResponse = response.data
    if(apiResponse.result) {
      loading.value = false
      snackbarColor.value = 'success'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
      dialogEditUser.value = false
    } else {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  }).catch(() => {
    loading.value = false
  }).finally(() => {
    dialogEditUser.value = false
    getUsers()
  })
}

async function deleteCategory(id) {
  await axiosInstance.delete('/users/' + Number(id)).then((response) => {
    loading.value = true
    const apiResponse = response.data
    if(apiResponse.result) {
      snackbarColor.value = 'success'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
      loading.value = false
      dialogEditUser.value = false
    } else {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  }).catch(() => {
    loading.value = false
  }).finally(() => {
    getUsers()
  })
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
    <v-card flat>
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-tag"></v-icon> &nbsp;
        使用者管理頁面
        <v-spacer></v-spacer>
        <v-text-field
            class="w-25"
            v-model="search.name"
            density="compact"
            label="名稱"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            flat
            hide-details
            single-line
        ></v-text-field>
        <v-text-field
            class="ml-2 w-25"
            v-model="search.email"
            density="compact"
            label="信箱"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            flat
            hide-details
            single-line
        ></v-text-field>
        <v-btn :bordered="false" color="search" class="ml-2 outlined" size="large" density="compact" @click="getUsers">查詢</v-btn>
        <v-btn :bordered="false" color="add" class="ml-2 outlined" size="large" density="compact" @click="handleAddUser">新增</v-btn>
      </v-card-title>
      <v-data-table :headers="headers" multi-sort :sort-by="[{ key: 'userName', order: 'asc'},{ key: 'id', order: 'asc'}]"
                    :loading="loading" loading-text="載入資料中..." :items="users"
                    :items-per-page="pageable.pageSize"
                    height="calc(100vh - 300px)">
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>使用者列表</v-toolbar-title>
          </v-toolbar>
        </template>
        <template v-slot:item.password="{ item }">
          {{ formatePassword(item.password) }}
        </template>
        <template v-slot:item.roleNames="{ item }">
          <v-chip v-for="role in item.roleNames" class="me-2 ma-2" size="small" color="primary">
            {{ role }}
          </v-chip>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip prepend-icon="mdi-check" v-if="!item.status" class="me-2 mb-2" size="small" color="success">
            啟用
          </v-chip>
          <v-chip v-else prepend-icon="mdi-close" class="me-2 mb-2" size="small" color="error">
            停用
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
            <v-btn :bordered="false" class="me-2 mb-2 outlined" density="compact" color="edit" @click="handleEditTag(item.id)">編輯</v-btn>
            <v-btn :bordered="false" class="me-2 mb-2 outlined" density="compact" color="delete" @click="deleteCategory(item.id)">刪除</v-btn>
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
            ></v-pagination>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogAddUser" persistent max-width="600px">
      <v-card class="rounded-xl pa-5">
        <v-card-title>
          <span class="text-h5">新增用戶</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                群組:
                <v-select
                    v-model="user.groupId"
                    :items="groups"
                    :item-title="item => item.groupName"
                    :item-value="item => item.id"
                    label="選擇群組"
                    required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                角色:
                <v-select
                    v-model="user.roleIds"
                    :items="roles"
                    :item-title="item => item.roleName"
                    :item-value="item => item.id"
                    label="選擇角色"
                    multiple
                ></v-select>
              </v-col>
              <v-col
                  cols="12"
              >
                名稱:
                <v-text-field
                    v-model="user.userName"
                    label="名稱"
                    required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                    v-model="user.nickName"
                    label="暱稱"
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                密碼:
                <v-text-field
                    v-model="user.password"
                    label="密碼"
                    required
                    datatype="password"
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                電子郵件:
                <v-text-field
                    v-model="user.email"
                    label="電子郵件"
                    required
                    datatype="email"
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                地址:
                <v-text-field
                    v-model="user.address"
                    label="地址"
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                連絡電話:
                <v-text-field
                    v-model="user.phone"
                    label="連絡電話"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="add"
              variant="text"
              @click="addUser"
          >
            新增
          </v-btn>
          <v-btn
              color="cancel"
              variant="text"
              @click="dialogAddUser = false"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEditUser" persistent max-width="600px">
      <v-card class="rounded-xl pa-5" :loading="dialogLoading" loading-text="加載中...">
        <v-card-title>
          <span class="text-h5">編輯分類</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                群組:
                <v-select
                    v-model="user.groupId"
                    :items="groups"
                    :item-title="item => item.groupName"
                    :item-value="item => item.id"
                    label="選擇群組"
                    required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                角色:
                <v-select
                    v-model="user.roleIds"
                    :items="roles"
                    :item-title="item => item.roleName"
                    :item-value="item => item.id"
                    label="選擇角色"
                    multiple
                ></v-select>
              </v-col>
              <v-col
                  cols="12"
              >
                名稱:
                <v-text-field
                    v-model="user.userName"
                    label="名稱"
                    required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                    v-model="user.nickName"
                    label="暱稱"
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                密碼:
                <v-text-field
                    v-model="user.password"
                    label="密碼"
                    required
                    datatype="password"
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                電子郵件:
                <v-text-field
                    v-model="user.email"
                    label="電子郵件"
                    required
                    datatype="email"
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                地址:
                <v-text-field
                    v-model="user.address"
                    label="地址"
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                連絡電話:
                <v-text-field
                    v-model="user.phone"
                    label="連絡電話"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="add"
              variant="text"
              @click="editUser()"
          >
            編輯
          </v-btn>
          <v-btn
              color="cancel"
              variant="text"
              @click="dialogEditUser = false"
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

