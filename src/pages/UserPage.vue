<script setup>
import axiosInstance from "@/utils/request";
import { ref, onMounted } from 'vue';

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
  { title: '密碼', key: 'password', sortable: false,type:'password'},
  { title: '電子郵件', key: 'email',sortable: true },
  { title: '暱稱', key: 'nickName',sortable: true },
  { title: '出生年月日', key: 'birthday',sortable: true },
  { title: '地址', key: 'address',sortable: false },
  { title: '電話', key: 'phone', sortable: false },
  { title: '角色', key: 'roles', sortable: false },
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
      nickName: '',
      birthday: Date.now(),
      address: '',
      roleIds: Number([]),
      status: '',
      groupId: Number('')
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
      user.value.groupId = user.value.group.id
      if(roles.value.length > 0) {
        roles.value.forEach(role => {
          if(user.value.roleIds.includes(role.id)) {
            role.checked = true
          }
        })
      }
      if(groups.value.length > 0) {
        groups.value.forEach(group => {
          if(user.value.groupId == group.id) {
            group.checked = true
          }
        })
      }
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
    birthday: Date.now(),
    address: '',
    roleIds: [],
    groupId: Number('')
  }
}
async function addUser() {
  await axiosInstance.post('/users', {
    user
  }).then((response) => {
    loading.value = true
    const apiResponse = response.data
    if(apiResponse.result) {
      user.value = apiResponse.data
      dialogAddUser.value = false
      loading.value = false
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

async function editUser() {
  await axiosInstance.put('/users/' + Number(user.value.id), {user}).then((response) => {
    loading.value = true
    const apiResponse = response.data
    if(apiResponse.result) {
      user.value = apiResponse.data
      dialogEditUser.value = false
      loading.value = false
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
                    item-text="groupName"
                    item-value="id"
                    label="選擇群組"
                    required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                角色:
                <v-select
                    v-model="user.roleIds"
                    :items="roles"
                    item-text="roleName"
                    item-value="id"
                    label="選擇角色"
                    multiple
                ></v-select>
              </v-col>
              <v-col
                  cols="12"
                  sm="6"
                  md="4"
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
                  cols="6">
                地址:
                <v-text-field
                    v-model="user.address"
                    label="地址"
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                出生年月日:
                <v-date-picker v-model="user.birthday" landscape></v-date-picker>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="add"
              variant="text"
              @click="addUser()"
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
                    item-text="groupName"
                    item-value="id"
                    label="選擇群組"
                    required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                角色:
                <v-select
                    v-model="user.roleIds"
                    :items="roles"
                    item-text="roleName"
                    item-value="id"
                    label="選擇角色"
                    multiple
                ></v-select>
              </v-col>
              <v-col
                  cols="12"
                  sm="6"
                  md="4"
              >
                名稱:
                <v-text-field
                    v-model="user.id"
                    label="id"
                    required
                    hidden="hidden"
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12"
                  sm="6"
                  md="4"
              >
                描述:
                <v-text-field
                    :name="user.name"
                    v-model="user.name"
                    label="名稱"
                    required
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                <v-text-field
                    :name="user.description"
                    v-model="user.description"
                    label="描述"
                    required
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
