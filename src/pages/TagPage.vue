<script setup>
import axiosInstance from "@/utils/axiosHandler";
import { ref, reactive, onMounted } from 'vue';
import BreadcrumbBar from "@/components/BreadcrumbBar.vue";
import MessageSnakeBar from "@/components/MessageSnakeBar.vue";
import { commonRules } from "@/utils/rules";
import Swal from "sweetalert2";

const breadcrumbs = ref([
  { text: '首頁', disabled: false, href: '/home' },
  { text: '標籤管理', disabled: true, href: '/tags' },
]);

const loading = ref(false);
const dialogLoading = ref(false);
const snackbar = reactive({
  visible: false,
  color: '',
  message: ''
});

const searchFieldName = ref('');

const pageable = reactive({
  totalElements: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 10,
});

const headers = [
  { title: '序號', key: 'id', sortable: true },
  { title: '名稱', key: 'name', sortable: true },
  { title: '分類', key: 'categoryName', sortable: true },
  { title: '描述', key: 'description', sortable: false },
  { title: '發布時間', key: 'createDate', sortable: true },
  { title: '更新時間', key: 'updDate', sortable: true },
  { title: '操作', key: 'actions', sortable: false },
];

const tag = reactive({
  id: null,
  name: '',
  description: '',
  categoryId: null,
  categoryName: '',
});

const tags = reactive([]);
const categories = reactive([]);

const dialogAddTag = ref(false);
const dialogEditTag = ref(false);

onMounted(async () => {
  await getTags();
  await getCategories();
});

async function getCategories() {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/categories/findList');
    const apiResponse = response.data;
    if (apiResponse.result) {
      categories.value = apiResponse.data;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '請求時發生錯誤，請稍後再試。');
  } finally {
    loading.value = false;
  }
}

async function getTags() {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/tags', {
      params: {
        name: searchFieldName.value,
        page: pageable.pageNumber,
        pageSize: pageable.pageSize,
      },
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      tags.splice(0, tags.length, ...apiResponse.data.content);
      handlePageChange(apiResponse);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '請求時發生錯誤，請稍後再試。');
  } finally {
    loading.value = false;
  }
}

async function getTag(id) {
  dialogLoading.value = true;
  try {
    const response = await axiosInstance.get(`/tags/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      Object.assign(tag, apiResponse.data);
      tag.categoryId = apiResponse.data.category.id;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '請求時發生錯誤，請稍後再試。');
  } finally {
    dialogLoading.value = false;
  }
}

function handleAddTag() {
  resetTag();
  dialogAddTag.value = true;
}

function handleEditTag(id) {
  resetTag();
  getTag(id);
  dialogEditTag.value = true;
}

function resetTag() {
  Object.assign(tag, {
    id: null,
    name: '',
    description: '',
    categoryId: null,
    categoryName: '',
  });
}

function formateCategoryName(category) {
  return category ? category.name : '';
}

function handlePageChange(apiResponse) {
  pageable.totalElements = apiResponse.data.totalElements;
  pageable.totalPages = apiResponse.data.totalPages;
  pageable.pageNumber = apiResponse.data.number + 1;
  pageable.pageSize = apiResponse.data.size;
}

async function addTag() {
  dialogLoading.value = true;
  try {
    const response = await axiosInstance.post('/tags', {
      name: tag.name,
      description: tag.description,
      categoryId: tag.categoryId,
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      dialogAddTag.value = false;
      await getTags();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '請求時發生錯誤,請稍後再試。');
  } finally {
    dialogLoading.value = false;
  }
}

async function editTag() {
  dialogLoading.value = true;
  try {
    const response = await axiosInstance.put('/tags', {
      id: tag.id,
      name: tag.name,
      description: tag.description,
      categoryId: tag.categoryId,
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      dialogEditTag.value = false;
      await getTags();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '請求時發生錯誤,請稍後再試。');
  } finally {
    dialogLoading.value = false;
  }
}

async function deleteTag(id) {
  dialogLoading.value = true;
  try {
    const result = await Swal.fire({
      title: '確定要刪除嗎?',
      text: '刪除後將無法復原',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    });
    if(!result.isConfirmed) return;
    const response = await axiosInstance.delete(`/tags/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
      await getTags();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '請求時發生錯誤,請稍後再試。');
  } finally {
    dialogLoading.value = false;
  }
}

function showSnackbar(color, message) {
  snackbar.color = color;
  snackbar.message = message;
  snackbar.visible = true;
}
</script>

<template>
  <!-- 導覽列 -->
  <BreadcrumbBar :items="breadcrumbs" />
  <!-- 消息顯示列-->
  <MessageSnakeBar :message="snackbar.message" :color="snackbar.color" v-if="snackbar.visible" />

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
      />
      <v-divider class="mx-2" inset vertical />
      <v-btn class="mr-2 button-query" size="large" density="compact" @click="getTags">
        查詢
      </v-btn>
      <v-btn class="ml-2 button-add" size="large" density="compact" @click="handleAddTag">
        新增
      </v-btn>
    </v-card-title>
    <v-data-table :headers="headers"
                  multi-sort
                  :sort-by="[{ key: 'name', order: 'asc'}, { key: 'id', order: 'asc'}]"
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
        <v-btn class="me-2 mb-2 outlined" density="compact" color="edit" @click="handleEditTag(item.id)">編輯</v-btn>
        <v-btn class="me-2 mb-2 outlined" density="compact" color="delete" @click="deleteTag(item.id)">刪除</v-btn>
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

  <v-dialog v-model="dialogAddTag" persistent max-width="600px" transition="dialog-bottom-transition" width="auto">
    <v-card flat :loading="dialogLoading" loading-text="加載中...">
      <v-card-title>
        <span class="text-h5">新增標籤</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="tag.name" label="名稱" :rules="[commonRules.required]" required />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="tag.description" label="描述" />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="tag.categoryId"
                :items="categories"
                :item-title="item => item.name"
                :item-value="item => item.id"
                label="所屬分類"
                :rules="[commonRules.required]"
                required
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="add" variant="text" @click="addTag">新增</v-btn>
        <v-btn class="button-add me-2 mb-2" variant="outlined" @click="dialogAddTag = false">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogEditTag" persistent max-width="600px" transition="dialog-bottom-transition" width="auto">
    <v-card flat :loading="dialogLoading" loading-text="加載中...">
      <v-card-title>
        <span class="text-h5">編輯標籤</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="tag.name" label="名稱" :rules="[commonRules.required]" required />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="tag.description" label="描述" />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="tag.categoryId"
                :items="categories"
                :item-title="item => item.name"
                :item-value="item => item.id"
                label="所屬分類"
                :rules="[commonRules.required]"
                required
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn class="button-edit"  variant="text" @click="editTag">編輯</v-btn>
        <v-btn class="button-cancel" variant="text" @click="dialogEditTag = false">取消</v-btn>
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
