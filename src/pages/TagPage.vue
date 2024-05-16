<script setup>
  import axiosInstance from "@/utils/request";
  import { ref, onMounted } from 'vue';

  const breadcrumbs = ref([
    { text: '首頁', disabled: false, href: '/home' },
    { text: '標籤管理', disabled: true, href: '/tags' },
  ])
  const name = ref('')
  const loading = ref(false)
  const dialogLoading = ref(false)
  const snackbar = ref(false)
  const snackbarColor = ref('')
  const receiveMessage = ref('')

  const search = ref({
    name: '',
  })
  const pageable = ref({
    totalElements: Number(0),
    totalPages: Number(0),
    pageNumber: Number(1),
    pageSize: Number(10)
  })

  const headers = [
    { title: '序號', key: 'id', sortable: true},
    { title: '名稱', key: 'name', sortable: true },
    { title: '分類', key: 'categoryName', sortable: true },
    { title: '描述', key: 'description', sortable: false },
    { title: '發布時間', key: 'createDate',sortable: true },
    { title: '更新時間', key: 'updDate',sortable: true },
    { title: '操作', key: 'actions',sortable: false },
  ]
  const tag = ref({
    id: Number(''),
    name: '',
    description: '',
    categoryId: Number(''),
    categoryName: '',
  })
  const tags = ref([])
  const categories = ref([])
  const dialogAddTag = ref(false)
  const dialogEditTag = ref(false)

  onMounted(async () => {
    await getTags()
    await getCategories()
  })

  async function getCategories() {
    loading.value = true
    await axiosInstance.get('/categories/findList').then((response) => {
    const apiResponse = response.data;
    if(apiResponse.result) {
      categories.value = apiResponse.data
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
    })
  }
  async function getTags() {
    loading.value = true
    await axiosInstance.get('/tags', {params:
        {
          name: search.value.name,
          page: pageable.value.pageNumber,
          pageSize: pageable.value.pageSize
        }
  }).then((response) => {
    const apiResponse = response.data;
    if(apiResponse.result) {
      tags.value = apiResponse.data.content
      pageable.value.totalElements = apiResponse.data.totalElements
      pageable.value.totalPages = apiResponse.data.totalPages
      pageable.value.pageNumber = apiResponse.data.number + 1
      pageable.value.pageSize = apiResponse.data.size
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
    })
  }

  async function getTag(id) {
    loading.value = true
    await axiosInstance.get('/tags/' + Number(id)).then((response) => {
      const apiResponse = response.data;
      if(apiResponse.result) {
        tag.value = apiResponse.data
        tag.value.categoryId = apiResponse.data.category.id
        loading.value = false
        console.log(tag.value)
      } else {
        loading.value = false
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).catch(() => {
      loading.value = false
    }).finally(() => {
      loading.value = false
    })
  }

  function handleAddTag() {
    resetTag()
    dialogAddTag.value = true
  }

  function handleEditTag(id) {
    resetTag()
    getTag(id)
    dialogEditTag.value = true
  }

  function resetTag() {
    tag.value = {
      id: Number(''),
      name: '',
      description: ''
    }
  }

  function formateCategoryName(category) {
    if(category) {
      return category.name
    }
  }

  async function addTag() {
    await axiosInstance.post('/tags', {
      name: tag.value.name,
      description: tag.value.description,
      categoryId: tag.value.categoryId
    }).then((response) => {
      loading.value = true
      const apiResponse = response.data
      if(apiResponse.result) {
        snackbarColor.value = 'success'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
        loading.value = false
        dialogAddTag.value = false
      } else {
        loading.value = false
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).catch(() => {
      loading.value = false
    }).finally(() => {
      getTags()
    })
  }

  async function editTag() {
    await axiosInstance.put('/tags', {
      id: tag.value.id,
      name: tag.value.name,
      description: tag.value.description,
      categoryId: tag.value.categoryId
    }).then((response) => {
      loading.value = true
      const apiResponse = response.data
      if(apiResponse.result) {
        dialogEditTag.value = false
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
      dialogEditTag.value = false
      getTags()
    })
  }

  async function deleteCategory(id) {
    await axiosInstance.delete('/tags/' + Number(id)).then((response) => {
      loading.value = true
      const apiResponse = response.data
      if(apiResponse.result) {
        dialogEditTag.value = false
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
      getTags()
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
        標籤管理頁面
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
        <v-divider class="mx-2" inset vertical></v-divider>
        <v-btn :bordered="false" color="search" class="mr-2 outlined" size="large" density="compact" @click="getTags">查詢</v-btn>
        <v-btn :bordered="false" color="add" class="ml-2 outlined" size="large" density="compact" @click="handleAddTag">新增</v-btn>
      </v-card-title>
      <v-data-table :headers="headers"
                    multi-sort
                    :sort-by="[{ key: 'name', order: 'asc'},{ key: 'id', order: 'asc'}]"
                    :loading="loading"
                    loading-text="載入資料中..."
                    :items="tags"
                    :items-per-page="pageable.pageSize"
                    height="calc(100vh - 300px)">
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>標籤列表</v-toolbar-title>
          </v-toolbar>
        </template>
        <template v-slot:item.categoryName="{ item }">
          {{ formateCategoryName(item.category) }}
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
                @update:modelValue="getTags"
                rounded="circle"
                density="compact"
            ></v-pagination>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogAddTag" persistent max-width="600px">
      <v-card class="rounded-xl pa-5">
        <v-card-title>
          <span class="text-h5">新增標籤</span>
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
                    v-model="tag.name"
                    label="名稱"
                    required
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12"
                  sm="6"
                  md="4">
                描述:
                <v-text-field
                    v-model="tag.description"
                    label="描述"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-select
                    v-model="tag.categoryId"
                    :items="categories"
                    :item-title="item => item.name"
                    :item-value="item => item.id"
                    label="所屬分類"
                    required
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
              @click="addTag()"
          >
            新增
          </v-btn>
          <v-btn
              color="cancel"
              variant="text"
              @click="dialogAddTag = false"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEditTag" persistent max-width="600px">
      <v-card class="rounded-xl pa-5" :loading="dialogLoading" loading-text="加載中...">
        <v-card-title>
          <span class="text-h5">編輯標籤</span>
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
                    :name="tag.name"
                    v-model="tag.name"
                    label="名稱"
                    required
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                描述:
                <v-text-field
                    :name="tag.description"
                    v-model="tag.description"
                    label="描述"
                ></v-text-field>
              </v-col>
            </v-row>
            <row>
              <v-col cols="12">
                <v-select
                    :item-title="item => item.name"
                    :item-value="item => item.id"
                    v-model="tag.categoryId"
                    :items="categories"
                    label="所屬分類"
                    required
                ></v-select>
              </v-col>
            </row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="edit"
              variant="text"
              @click="editTag()"
          >
            編輯
          </v-btn>
          <v-btn
              color="cancel"
              variant="text"
              @click="dialogEditTag = false"
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
