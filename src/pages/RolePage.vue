<script setup>
import axiosInstance from "@/utils/request";
import { ref, onMounted } from 'vue';

const breadcrumbs = ref([
  { text: '首頁', disabled: false, href: '/home' },
  { text: '角色管理', disabled: true, href: '/roles' },
])
const loading = ref(false)
const dialogLoading = ref(false)
const snackbar = ref(false)
const snackbarColor = ref('')
const receiveMessage = ref('')
const roles = ref([])
const dialogAddRole = ref(false)
const dialogEditRole = ref(false)
const headers = [
  { title: '序號', key: 'id', sortable: true},
  { title: '名稱', key: 'roleName', sortable: true },
  { title: '描述', key: 'description', sortable: false },
  { title: '發布時間', key: 'createDate',sortable: true },
  { title: '更新時間', key: 'updDate',sortable: true },
  { title: '操作', key: 'actions',sortable: false },
]
const search = ref({
  name: '',
})
const pageable = ref({
  totalElements: Number(0),
  totalPages: Number(0),
  pageNumber: Number(1),
  pageSize: Number(10)
})
const role = ref({
  id: Number(''),
  roleName: '',
  description: ''
})
onMounted(async () => {
  await getRoles()
})
async function getRoles() {
  loading.value = true
  await axiosInstance.get('/roles', {params:
    {
      name: search.value.name,
      page: pageable.value.pageNumber,
      pageSize: pageable.value.pageSize
    }
  }).then((response) => {
    const apiResponse = response.data
    if(apiResponse.result) {
      roles.value = apiResponse.data.content
      pageable.value.totalPages = apiResponse.data.totalPages
      pageable.value.page = apiResponse.data.number + 1
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

async function getRole(id) {
  loading.value = true
  await axiosInstance.get('/roles/' + id).then((response) => {
    const apiResponse = response.data
    if(apiResponse.result) {
      role.value = apiResponse.data
      loading.value = false
    }
  }).catch(() => {
    loading.value = false
  })
}

function handleAddRole() {
  resetRole()
  dialogAddRole.value = true
}

function handleEditRole(id) {
  resetRole()
  getRole(id)
  dialogEditRole.value = true
}

function resetRole() {
  role.value = {
    id: Number(''),
    roleName: '',
    description: ''
  }
}

async function addRole() {
  await axiosInstance.post('/roles', {
    roleName: role.value.roleName,
    description: role.value.description
  }).then((response) => {
    loading.value = true
    const apiResponse = response.data
    if(apiResponse.result) {
      snackbarColor.value = 'success'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
      dialogAddRole.value = false
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
    dialogAddRole.value = false
    getRoles()
  })
}

async function editRole() {
  await axiosInstance.put('/roles', {
    id: role.value.id,
    roleName: role.value.roleName,
    description: role.value.description
  }).then((response) => {
    loading.value = true
    const apiResponse = response.data
    if(apiResponse.result) {
      snackbarColor.value = 'success'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
      dialogEditRole.value = false
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
    dialogEditRole.value = false
    getRoles()
  })
}

async function deleteRole(id) {
  await axiosInstance.delete('/roles/' + Number(id)).then((response) => {
    loading.value = true
    const apiResponse = response.data
    if(apiResponse.result) {
      snackbarColor.value = 'success'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
      loading.value = false
      dialogEditRole.value = false
    } else {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  }).catch(() => {
    loading.value = false
  }).finally(() => {
    getRoles()
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
        <v-icon icon="mdi-account"></v-icon> &nbsp;
        角色管理頁面
        <v-spacer></v-spacer>
        <v-text-field
            v-model="search.name"
            density="compact"
            label="名稱"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            flat
            hide-details
            single-line
        ></v-text-field>
        <v-btn :bordered="false" color="search" class="ml-2 outlined" size="large" density="compact" @click="getRoles">查詢</v-btn>
        <v-btn :bordered="false" color="add" class="ml-2 outlined" size="large" density="compact" @click="handleAddRole">新增</v-btn>
      </v-card-title>
      <v-data-table :headers="headers"
                    multi-sort
                    :sort-by="[{ key: 'name', order: 'asc'}, { key: 'id', order: 'asc'}]"
                    :loading="loading" loading-text="載入資料中..."
                    :items="roles" :items-per-page="pageable.pageSize"
                    height="calc(100vh - 300px)">
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>角色列表</v-toolbar-title>
          </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
            <v-btn :bordered="false" class="me-2 mb-2 outlined" density="compact" color="edit" @click="handleEditRole(item.id)">編輯</v-btn>
            <v-btn :bordered="false" class="me-2 mb-2 outlined" density="compact" color="delete" @click="deleteRole(item.id)">刪除</v-btn>
        </template>
        <template v-slot:bottom>
          <div class="text-center pt-2">
            <v-pagination
                v-model="pageable.pageNumber"
                :length="pageable.totalPages"
                total-visible="5"
                @update:modelValue="getRoles"
                rounded="circle"
                density="compact"
            ></v-pagination>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogAddRole" persistent max-width="600px">
      <v-card class="rounded-xl pa-5" :loading="loading" loading-text="加載中...">
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
                名稱:
                <v-text-field
                    v-model="role.roleName"
                    label="名稱"
                    required
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                描述:
                <v-text-field
                    v-model="role.description"
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
              @click="addRole()"
          >
            新增
          </v-btn>
          <v-btn
              color="cancel"
              variant="text"
              @click="dialogAddRole = false"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEditRole" persistent max-width="600px">
      <v-card class="rounded-xl pa-5" :loading="dialogLoading" loading-text="加載中...">
        <v-card-title>
          <span class="text-h5">編輯分類</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                  cols="12"
                  sm="6"
                  md="4"
              >
                名稱:
                <v-text-field
                    v-model="role.roleName"
                    label="名稱"
                    required
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                描述:
                <v-text-field
                    :name="role.description"
                    v-model="role.description"
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
              @click="editRole()"
          >
            編輯
          </v-btn>
          <v-btn
              color="cancel"
              variant="text"
              @click="dialogEditRole = false"
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

