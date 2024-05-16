<script setup>
    import axiosInstance from "@/utils/request";
    import { ref, onMounted } from 'vue';

    const breadcrumbs = ref([
        { text: '首頁', disabled: false, href: '/home' },
        { text: '分類管理', disabled: true, href: '/categories' },
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
    const categories = ref([])
    const dialogAddCategory = ref(false)
    const dialogEditCategory = ref(false)
    const headers = [
        { title: '序號', key: 'id', sortable: true},
        { title: '名稱', key: 'name', sortable: true},
        { title: '描述', key: 'description', sortable: false},
        { title: '發布時間', key: 'createDate',sortable: true},
        { title: '更新時間', key: 'updDate',sortable: true },
        { title: '操作', key: 'actions',sortable: false},
    ]
    const category = ref({
        id: Number(''),
        name: '',
        description: ''
    })
    onMounted(async () => {
        await getCategories()
    })
    async function getCategories() {
        loading.value = true
        await axiosInstance.get('/categories', {params: {
            name: search.value.name,
            page: pageable.value.pageNumber,
            pageSize: pageable.value.pageSize
          }}).then((response) => {
            const apiResponse = response.data;
            if (apiResponse.result) {
              categories.value = apiResponse.data.content
              pageable.value.totalPages = apiResponse.data.totalPages
              pageable.value.totalElements = apiResponse.data.totalElements
              pageable.value.pageNumber = apiResponse.data.number + 1
              pageable.value.pageSize = apiResponse.data.size
            } else {
              snackbarColor.value = 'error';
              receiveMessage.value = apiResponse.message;
              snackbar.value = true;
            }
        }).catch(() => {
            loading.value = false
        }).finally(() => {
            loading.value = false
        })
    }

    async function getCategory(id) {
        loading.value = true
        await axiosInstance.get('/categories/' + Number(id)).then((response) => {
            const apiResponse = response.data;
            if(apiResponse.result) {
                category.value = apiResponse.data
                loading.value = false
            }
        }).catch(() => {
            loading.value = false
        })
    }

    function handleAddCategory() {
        resetCategory()
        dialogAddCategory.value = true
    }

    function handleEditCategory(id) {
        resetCategory()
        getCategory(id)
        dialogEditCategory.value = true
    }

    function resetCategory() {
        category.value = {
            id: Number(''),
            name: '',
            description: ''
        }
    }

    async function addCategory() {
        await axiosInstance.post('/categories',{
              name: category.value.name,
              description: category.value.description
        }
        ).then((response) => {
            loading.value = true
            const apiResponse = response.data
            if(apiResponse.result) {
               dialogAddCategory.value = false
               snackbarColor.value = 'success'
               receiveMessage.value = apiResponse.message
               snackbar.value = true
            } else {
               snackbarColor.value = 'error'
               receiveMessage.value = apiResponse.message
               snackbar.value = true
            }
        }).catch(() => {
            loading.value = false
        }).finally(() => {
            loading.value = false
            getCategories()
        })
    }

    async function editCategory() {
       await axiosInstance.put('/categories', {
           id: category.value.id,
           name: category.value.name,
           description: category.value.description
       }).then((response) => {
           loading.value = true
           const apiResponse = response.data
           if(apiResponse.result) {
              dialogEditCategory.value = false
              snackbarColor.value = 'success'
              receiveMessage.value = apiResponse.message
              snackbar.value = true
           } else {
              snackbarColor.value = 'error'
              receiveMessage.value = apiResponse.message
              snackbar.value = true
           }
       }).catch(() => {
           loading.value = false
       }).finally(() => {
          loading.value = false
          getCategories()
       })
    }

    async function deleteCategory(id) {
       await axiosInstance.delete('/categories/' + Number(id)).then((response) => {
           loading.value = true
           const apiResponse = response.data
           if(apiResponse.result) {
             snackbarColor.value = 'success'
             receiveMessage.value = apiResponse.message
             snackbar.value = true
             dialogEditCategory.value = false
           } else {
              snackbarColor.value = 'error'
              receiveMessage.value = apiResponse.message
              snackbar.value = true
           }
       }).catch(() => {
           loading.value = false
       }).finally(() => {
          loading.value = false
          getCategories()
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
    <v-card flat full-width>
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-folder"></v-icon> &nbsp;
        分類管理頁面
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
        <v-btn :bordered="false" color="search" class="mr-2 outlined" size="large" density="compact" @click="getCategories">查詢</v-btn>
        <v-btn :bordered="false" color="add" class="ml-2 outlined" size="large"   density="compact" @click="handleAddCategory">新增</v-btn>
      </v-card-title>
      <v-data-table multi-sort
                    :sort-by="[{ key: 'name', order: 'asc'}, { key: 'id', order: 'asc'}]"
                    :headers="headers"
                    :loading="loading"
                    loading-text="載入資料中..."
                    :items="categories"
                    :items-per-page="pageable.pageSize"
                    height="calc(100vh - 300px)">
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>分頁列表</v-toolbar-title>
          </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
            <v-btn  class="mr-2 outlined" density="compact" color="edit" @click="handleEditCategory(item.id)">編輯</v-btn>
            <v-btn  class="mr-2 outlined" density="compact" color="delete" @click="deleteCategory(item.id)">刪除</v-btn>
        </template>
        <template v-slot:bottom>
          <div class="text-center pt-2">
            <v-pagination
                v-model="pageable.pageNumber"
                :length="pageable.totalPages"
                total-visible="5"
                @update:modelValue="getCategories"
                rounded="circle"
                density="compact"
            ></v-pagination>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogAddCategory" persistent max-width="600px">
      <v-card class="rounded-xl pa-5">
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
                    v-model="category.name"
                    label="名稱"
                    required
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                描述:
                <v-text-field
                    v-model="category.description"
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
              @click="addCategory()"
          >
            新增
          </v-btn>
          <v-btn
              color="cancel"
              variant="text"
              @click="dialogAddCategory = false"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEditCategory" persistent max-width="600px">
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
                    v-model="category.name"
                    label="名稱"
                    required
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12">
                描述:
                <v-text-field
                    v-model="category.description"
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
              @click="editCategory()"
          >
            編輯
          </v-btn>
          <v-btn
              color="cancel"
              variant="text"
              @click="dialogEditCategory = false"
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
