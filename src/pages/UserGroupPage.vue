<script setup>
import axiosInstance from "@/utils/request";
import { ref, onMounted } from 'vue';

const breadcrumbs = ref([
  { text: '首頁', disabled: false, href: '/home' },
  { text: '群組管理', disabled: true, href: '/groups' },
])
const reviewLevel = ref([
  { text: '管理員', value: 'ADMIN' },
  { text: '使用者', value: 'USER' },
  { text: '查詢', value:'SEARCH_ONLY'},
])
const name = ref('')
const loading = ref(false)
const dialogLoading = ref(false)
const snackbar = ref(false)
const snackbarColor = ref('')
const receiveMessage = ref('')
const userGroups = ref([])
const dialogAddGroup = ref(false)
const dialogEditGroup = ref(false)
const search = ref({
  groupName: '',
  reviewLevel: '',
})
const pageable = ref({
  totalElements: Number(0),
  totalPages: Number(0),
  pageNumber: Number(1),
  pageSize: Number(10)
})
const headers = [
  { title: '序號', key: 'id', sortable: true},
  { title: '群組名稱', key: 'groupName', sortable: true },
  { title: '描述', key: 'description', sortable: false },
  { title: '覆核等級', key: 'reviewLevel',sortable: true },
  { title: '發布時間', key: 'createDate',sortable: true },
  { title: '更新時間', key: 'updateDate',sortable: true },
  { title: '操作', key: 'actions',sortable: false },
]
const group = ref({
  id: Number(''),
  groupName: '',
  description: '',
  reviewLevel: '',
})
onMounted(async () => {
  await getGroups()
})
async function getGroups() {
  loading.value = true
  await axiosInstance.get('/groups', {params:
    {
      groupName: search.value.groupName,
      reviewLevel: search.value.reviewLevel,
      page: pageable.value.pageNumber,
      pageSize: pageable.value.pageSize
    }
  }).then((response) => {
    const apiResponse = response.data
    if(apiResponse.result) {
      userGroups.value = apiResponse.data.content
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

async function getGroup(id) {
  loading.value = true
  await axiosInstance.get('/groups/' + Number(id)).then((response) => {
    const apiResponse = response.data
    if(apiResponse.result) {
      group.value = apiResponse.data
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

function handleAddGroup() {
  resetGroup()
  dialogAddGroup.value = true
}

function handleEditTag(id) {
  resetGroup()
  getGroup(id)
  dialogEditGroup.value = true
}

function resetGroup() {
  group.value = {
    id: Number(''),
    name: '',
    description: '',
    reviewLevel: [],
  }
}

async function addGroup() {
  await axiosInstance.post('/groups', {
    groupName: group.value.groupName,
    description: group.value.description,
    reviewLevel: group.value.reviewLevel
  }).then((response) => {
    loading.value = true
    const apiResponse = response.data
    if(apiResponse.result) {
      group.value = apiResponse.data
      dialogAddGroup.value = false
      snackbarColor.value = 'success'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
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
    dialogAddGroup.value = false
    getGroups()
  })
}

async function editGroup() {
  await axiosInstance.put('/groups/' + Number(group.value.id), {
    groupName: group.value.groupName,
    description: group.value.description,
    reviewLevel: group.value.reviewLevel
  }).then((response) => {
    loading.value = true
    const apiResponse = response.data
    if(apiResponse.result) {
      group.value = apiResponse.data
      snackbarColor.value = 'success'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
      dialogEditGroup.value = false
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
    dialogEditGroup.value = false
    getGroups()
  })
}

async function deleteGroup(id) {
  await axiosInstance.delete('/groups/' + Number(id)).then((response) => {
    loading.value = true
    const apiResponse = response.data
    if(apiResponse.result) {
      snackbarColor.value = 'success'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
      loading.value = false
      dialogEditGroup.value = false
    } else {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  }).catch(() => {
    loading.value = false
  }).finally(() => {
    getGroups()
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
        <v-icon icon="mdi-group"></v-icon> &nbsp;
        群組管理頁面
        <v-spacer></v-spacer>
        <v-text-field
            v-model="search.groupName"
            density="compact"
            label="名稱"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            flat
            hide-details
            single-line
        ></v-text-field>
        <v-text-field
            class="ml-2"
            v-model="search.reviewLevel"
            density="compact"
            label="名稱"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            flat
            hide-details
            single-line
        ></v-text-field>
        <v-btn :bordered="false" color="search" class="ml-2 outlined" size="large" density="compact" @click="getGroups">查詢</v-btn>
        <v-btn :bordered="false" color="add" class="ml-2 outlined" size="large" density="compact" @click="handleAddGroup">新增</v-btn>
      </v-card-title>
      <v-data-table :headers="headers"
                    :loading="loading"
                    multi-sort
                    :sort-by="[{ key: 'groupName', order: 'asc'}, { key: 'id', order: 'asc'}]"
                    loading-text="載入資料中..."
                    :items="userGroups" :items-per-page="pageable.pageSize"
                    height="calc(100vh - 300px)">
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>群組列表</v-toolbar-title>
          </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
            <v-btn :bordered="false" class="me-2 mb-2 outlined" density="compact" color="edit" @click="handleEditTag(item.id)">編輯</v-btn>
            <v-btn :bordered="false" class="me-2 mb-2 outlined" density="compact" color="delete" @click="deleteGroup(item.id)">刪除</v-btn>
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
            ></v-pagination>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogAddGroup" persistent max-width="600px">
      <v-card class="rounded-xl pa-5" >
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
                群組名稱:
                <v-text-field
                    v-model="group.name"
                    label="名稱"
                    required
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                群組描述:
                <v-text-field
                    v-model="group.description"
                    label="描述"
                    required
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                群組權限:
                <v-select
                    v-model="group.reviewLevelName"
                    :items="reviewLevel"
                    label="權限"
                    chips
                    clearable
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="add"
              variant="text"
              @click="addGroup()"
          >
            新增
          </v-btn>
          <v-btn
              color="cancel"
              variant="text"
              @click="dialogAddGroup = false"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEditGroup" persistent max-width="600px">
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
                群組名稱:
                <v-text-field
                    v-model="group.groupName"
                    label="群組名稱"
                    required
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                群組描述:
                <v-text-field
                    :name="group.description"
                    v-model="group.description"
                    label="群組描述"
                    required
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                群組權限:
                <v-select
                    v-model="group.reviewLevelName"
                    :items="reviewLevel"
                    label="權限"
                    chips
                    clearable
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="add"
              variant="text"
              @click="editGroup()"
          >
            編輯
          </v-btn>
          <v-btn
              color="cancel"
              variant="text"
              @click="dialogEditGroup = false"
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
