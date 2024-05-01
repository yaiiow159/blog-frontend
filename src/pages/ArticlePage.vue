<script setup>
  import {ref, onMounted} from 'vue'
  import axiosInstance from '@/utils/request'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/stores/user'
  import Swal from "sweetalert2";

  const userStore = useUserStore()
  const router = useRouter()
  const dialogAddArticle = ref(false)
  const dialogEditArticle = ref(false)
  const snackbar = ref(false)
  const snackbarColor = ref('')
  const receiveMessage = ref('')
  const title = ref('')
  const authorName = ref('')
  const loading = ref(false)
  const dialogLoading = ref(false)
  const breadcrumbs = ref([
    { text: '首頁', disabled: false, href: '/home' },
    { text: '文章管理', disabled: true, href: '/articles' },
  ])
  const search = ref({
    title: '',
    authorName: '',
    status: '',
    categoryId: '',
  })
  const pageable = ref({
    totalElements: Number(0),
    totalPages: Number(0),
    pageNumber: Number(1),
    pageSize: Number(10)
  })
  const articles = ref([])
  const article = ref({
    id: Number(''),
    title: '',
    authorName: '',
    content: '',
    description: '',
    status: '',
    categoryId: Number(''),
    tagIds: [],
  })
  const tags = ref([])
  const categories = ref([])
  const headers = [
    { title: '標題', key: 'title', sortable: true },
    { title: '作者', key: 'authorName', sortable: true},
    { title: '內文', key: 'content', sortable: false },
    { title: '描述', key: 'description', sortable: false },
    { title: '發布時間', key: 'createDate',sortable: true },
    { title: '更新時間', key: 'updateDate',sortable: true },
    { title: '操作', key: 'actions',sortable: false },
  ]
  onMounted(async () => {
    await getArticles()
    await getCategories()
    await getTags()
  })

  function resetArticle() {
    article.value = {}
  }

  function handleEditArticle(id) {
    resetArticle()
    getArticle(id)
    dialogEditArticle.value = true
  }

  function openAddArticle() {
    resetArticle()
    dialogAddArticle.value = true
  }

  async function getArticles() {
    await axiosInstance.get("/posts", {params:
      {
        title: search.value.title,
        authorName: search.value.authorName,
        page: pageable.value.pageNumber,
        pageSize: pageable.value.pageSize
      }
    }).then((response) => {
      loading.value = true;
      const apiResponse = response.data
      if(apiResponse.data.result) {
        articles.value = apiResponse.data.content
        pageable.value.totalPages = apiResponse.data.totalPages
        pageable.value.totalElements = apiResponse.data.totalElements
        pageable.value.pageNumber = apiResponse.data.number + 1
        pageable.value.pageSize = apiResponse.data.size
        loading.value = false
      } else {
        loading.value = false
        article.value = {}
        snackbarColor.value = 'error'
        snackbar.value = true
        receiveMessage.value = apiResponse.data.message
      }
    }).catch(() => {
      loading.value = false
    })
  }
  async function getArticle(id) {
    loading.value = true
    await axiosInstance.get('/posts/' + Number(id)).then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        loading.value = false
        article.value = apiResponse.data
      } else {
        loading.value = false
        article.value = {}
        snackbarColor.value = 'error'
        snackbar.value = true
        receiveMessage.value = apiResponse.message
      }
    }).catch(() => {
      loading.value = false
    })
  }

  async function getTags() {
    await axiosInstance.get('/tags/findList').then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        tags.value = apiResponse.data
      }else {
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).catch(() => {
    })
  }

  async function getCategories() {
    await axiosInstance.get('/categories/findList').then((response) => {
      const apiResponse = response.data
      if(apiResponse.data.result) {
        categories.value = apiResponse.data
      }else {
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.data.message
        snackbar.value = true
      }
    }).catch(() => {
    })
  }

  async function handleAddArticle() {
    loading.value = true
    await axiosInstance.post('/posts', {
      title: article.value.title,
      authorName: article.value.authorName,
      content: article.value.content,
      description: article.value.description,
      categoryId: article.value.categoryId
    }).then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        loading.value = false
        dialogAddArticle.value = false
        receiveMessage.value = apiResponse.message
        snackbarColor.value = 'success'
        snackbar.value = true
        getArticles()
      } else {
        loading.value = false
        receiveMessage.value = apiResponse.message
        snackbarColor.value = 'error'
        snackbar.value = true
      }
    }).catch(() => {
      loading.value = false
    }).finally(() => {
      getArticles()
    })
  }

  async function editArticle(id) {
    loading.value = true
    await axiosInstance.put('/posts/' + Number(id)).then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        loading.value = false
        dialogEditArticle.value = true
        article.value = apiResponse.data
      } else {
        loading.value = false
        snackbarColor.value = 'error'
        snackbar.value = true
        receiveMessage.value = apiResponse.message
      }
    }).catch(() => {
      loading.value = false
    }).finally(() => {
      getArticles()
    })
  }

  async function deleteArticle(id) {
    loading.value = true
    await Swal.fire({
      title: '確定要刪除嗎?',
      text: "刪除後將無法復原",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.delete('posts/' + Number(id)).then((response) => {
          const apiResponse = response.data
          if(apiResponse.result) {
            loading.value = false
            receiveMessage.value = apiResponse.message
            snackbarColor.value = 'success'
            snackbar.value = true
          }
        }).catch(() => {
          loading.value = false
        }).finally(() => {
          getArticles()
        })
      }
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
        <v-icon icon="mdi-book"></v-icon> &nbsp;
        文章管理頁面
        <v-spacer></v-spacer>
          <v-select
              v-model="search.status"
              density="compact"
              label="儲存狀態"
              variant="solo-filled"
              flat
              hide-details
              single-line
              :items="tags"
          ></v-select>
        <v-text-field
            v-model="search.title"
            density="compact"
            label="標題"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            flat
            hide-details
            single-line
            class="me-2 mb-2"
        ></v-text-field>
          <v-text-field
              v-model="search.authorName"
              density="compact"
              label="作者名稱"
              prepend-inner-icon="mdi-magnify"
              variant="solo-filled"
              flat
              hide-details
              single-line
              class="me-2 mb-2"
          ></v-text-field>
          <v-btn color="search" class="me-2 mb-2 outlined" density="compact" size="large" @click="getArticles">查詢</v-btn>
          <v-btn color="add" class="me-2 mb-2 outlined" density="compact" size="large" @click="openAddArticle">新增</v-btn>
        </v-card-title>
        <v-data-table :headers="headers"
                      :loading="loading"
                      loading-text="載入資料中..."
                      :items="articles"
                      :items-per-page="pageable.pageSize"
                      height="calc(100vh - 300px)">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>文章列表</v-toolbar-title>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ item }">
              <v-btn class="me-2 mb-2 outlined" density="compact" color="search" @click="viewArticle(item.id)">查看</v-btn>
              <v-btn v-show="userStore.userInfo.username === item.authorName" class="me-2 mb-2 outlined" density="compact" color="edit" @click="editArticle(item.id)">編輯</v-btn>
              <v-btn v-show="userStore.userInfo.username === item.authorName" class="me-2 mb-2 outlined" density="compact" color="delete" @click="deleteArticle(item.id)">刪除</v-btn>
          </template>
          <template v-slot:bottom>
            <div class="text-center pt-2">
              <v-pagination
                  v-model="pageable.pageNumber"
                  :length="pageable.totalPages"
                  total-visible="5"
                  @update:modelValue="getArticles"
                  rounded="circle"
                  density="compact"
              ></v-pagination>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <v-dialog v-model="dialogAddArticle" persistent fullscreen>
        <v-card>
          <v-card-title>
            <span class="text-h5">新增文章</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row >
              <v-col cols="12">
              <v-file-input accept="image/png" v-model="article.image" label="輸入圖片">
                <template v-slot:prepend>
                  <v-icon icon="mdi-paperclip"></v-icon>
                </template>
              </v-file-input>
              </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                <v-select v-model="article.categoryId"
                          :items="categories"
                          item-title="name"
                          item-value="id"
                          label="分類">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-folder-outline"></v-icon>
                  </template>
                </v-select>
                </v-col>
                <v-col cols="6">
                <v-select multiple v-model="article.tagIds" :items="tags" item-title="name" item-value="id" label="標籤">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-tag-multiple-outline"></v-icon>
                  </template>
                  <template v-slot:item="{ item }">
                    <v-chip class="mx-1" color="primary" label>
                      {{ item.name }}
                    </v-chip>
                  </template>
                  <template v-slot:selection="{ item }">
                    <v-chip class="mx-1" color="primary" label>
                      {{ item.name }}
                    </v-chip>
                  </template>
                </v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="article.title"
                    label="標題"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="article.authorName"
                    label="作者"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea auto-grow clearable clear-icon="mdi-close-circle" rows="3"v-model="article.content">
                    <template v-slot:label>
                      <div>內容</div>
                    </template>
                  </v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" variant="text" @click="dialogAddArticle = false">取消</v-btn>
            <v-btn color="blue-darken-1" variant="text" @click="handleAddArticle">新增</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogEditArticle" persistent fullscreen>
        <v-card :loading="dialogLoading" loading-text="加載中...">
          <v-card-title>
            <span class="text-h5">編輯文章</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row >
                <v-col cols="12">
                  <v-file-input accept="image/png" v-model="article.image" label="輸入圖片">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-paperclip"></v-icon>
                    </template>
                  </v-file-input>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-select v-model="article.categoryId"
                            :items="categories"
                            item-title="name"
                            item-value="id"
                            label="分類">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-folder-outline"></v-icon>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="6">
                  <v-select multiple v-model="article.tagIds" :items="tags" item-title="name" item-value="id" label="標籤">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-tag-multiple-outline"></v-icon>
                    </template>
                    <template v-slot:item="{ item }">
                      <v-chip class="mx-1" color="primary" label>
                        {{ item.name }}
                      </v-chip>
                    </template>
                    <template v-slot:selection="{ item }">
                      <v-chip class="mx-1" color="primary" label>
                        {{ item.name }}
                      </v-chip>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                      v-model="article.title"
                      label="標題"
                      required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                      v-model="article.authorName"
                      label="作者"
                      required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea auto-grow clearable clear-icon="mdi-close-circle" rows="3" v-model="article.content">
                    <template v-slot:label>
                      <div>內容</div>
                    </template>
                  </v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" variant="text" @click="dialogAddArticle = false">取消</v-btn>
            <v-btn color="blue-darken-1" variant="text" @click="handleAddArticle()">新增</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="snackbar" :position="'fixed'" :color="snackbarColor" timeout="1000">
        {{ receiveMessage }}
      </v-snackbar>
</template>

<style scoped lang="sass">
.v-btn
  transition: background-color 0.3s ease
.v-btn:hover
  background-color: var(--v-primary-base)
</style>
