<script setup>
import axiosInstance from "@/utils/axiosHandler";
import BreadcrumbBar from "@/components/BreadcrumbBar.vue";
import MessageSnakeBar from "@/components/MessageSnakeBar.vue";
import { ref, onMounted, reactive } from 'vue';
import { commonRules } from "@/utils/rules";
import Swal from "sweetalert2";

const breadcrumbs = ref([
  { text: '首頁', disabled: false, href: '/home' },
  { text: '主題管理', disabled: true, href: '/categories' },
]);

const loading = ref(false);
const dialogLoading = ref(false);

const addCategoryForm = ref(null);
const editCategoryForm = ref(null);
const addCategoryFormValid = ref(false);
const editCategoryFormValid = ref(false);

const snackbar = reactive({
  visible: false,
  color: '',
  message: ''
});

const searchFields = reactive({
  name: '',
  description: '',
});

const pageable = reactive({
  totalElements: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 10,
});

const categories = reactive([]);
const category = reactive({
  id: null,
  name: '',
  description: ''
});

const dialogAddCategory = ref(false);
const dialogEditCategory = ref(false);

const headers = [
  { title: '序號', key: 'id', sortable: true },
  { title: '名稱', key: 'name', sortable: true },
  { title: '描述', key: 'description', sortable: false },
  { title: '發布時間', key: 'createDate', sortable: true },
  { title: '更新時間', key: 'updDate', sortable: true },
  { title: '操作', key: 'actions', sortable: false },
];

onMounted(async () => {
  await getCategories();
});

// 共用函數
function showSnackbar(color, message) {
  snackbar.visible = true;
  snackbar.color = color;
  snackbar.message = message;
}

function handlePageChange(apiResponse) {
  pageable.totalElements = apiResponse.totalElements;
  pageable.totalPages = apiResponse.totalPages;
  pageable.pageNumber = apiResponse.number + 1;
  pageable.pageSize = apiResponse.size;
}

function resetCategory() {
  Object.assign(category, {
    id: null,
    name: '',
    description: ''
  });
}

async function getCategories() {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/categories', {
      params: {
        name: searchFields.name,
        description: searchFields.description,
        page: pageable.pageNumber,
        pageSize: pageable.pageSize
      }
    });

    if (response.data.result) {
      categories.splice(0, categories.length, ...response.data.data.content);
      handlePageChange(response.data.data);
    } else {
      showSnackbar('error', response.data.message);
    }
  } catch (error) {
    showSnackbar('error', '請求時發生錯誤，請稍後再試。');
  } finally {
    loading.value = false;
  }
}

async function getCategory(id) {
  loading.value = true;
  try {
    const response = await axiosInstance.get(`/categories/${id}`);
    if (response.data.result) {
      Object.assign(category, response.data.data);
    } else {
      showSnackbar('error', response.data.message);
    }
  } catch (error) {
    showSnackbar('error', '請求時發生錯誤，請稍後再試。');
  } finally {
    loading.value = false;
  }
}

function handleEditCategory(id) {
  resetCategory();
  getCategory(id).then(() => {
    dialogEditCategory.value = true;
  });
}

function handleAddCategory() {
  resetCategory();
  dialogAddCategory.value = true;
}

async function addCategory() {
  try {
    dialogLoading.value = true;
    const response = await axiosInstance.post('/categories', category);
    if (response.data.result) {
      showSnackbar('success', response.data.message);
      await getCategories();
      dialogAddCategory.value = false;
    } else {
      showSnackbar('error', response.data.message);
    }
  } catch (error) {
    showSnackbar('error', error.message);
  } finally {
    dialogLoading.value = false;
  }
}

async function editCategory() {
  try {
    dialogLoading.value = true;
    const response = await axiosInstance.put(`/categories/${category.id}`, category);
    if (response.data.result) {
      showSnackbar('success', response.data.message);
      await getCategories();
      dialogEditCategory.value = false;
    } else {
      showSnackbar('error', response.data.message);
    }
  } catch (error) {
    showSnackbar('error', error.message);
  } finally {
    dialogLoading.value = false;
  }
}

async function deleteCategory(id) {
  try {
    const result = await Swal.fire({
      title: '確定要刪除嗎?',
      text: '刪除後將無法復原',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    });
    if (!result.isConfirmed) return;

    loading.value = true;
    const response = await axiosInstance.delete(`/categories/${id}`);
    if (response.data.result) {
      showSnackbar('success', response.data.message);
      await getCategories();
    } else {
      showSnackbar('error', response.data.message);
    }
  } catch (error) {
    showSnackbar('error', error.message);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <!-- 導覽列 -->
  <BreadcrumbBar :items="breadcrumbs" />
  <!-- 消息顯示 -->
  <MessageSnakeBar :color="snackbar.color" :message="snackbar.message" v-if="snackbar.visible" />

  <!-- 主題管理 -->
  <v-card flat>
    <v-card-title class="d-flex align-center justify-space-between px-4 py-2">
      <div class="d-flex align-center">
        <v-text-field
          v-model="searchFields.name"
          density="compact"
          label="名稱"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          class="mr-2"
        />
        <v-text-field
          v-model="searchFields.description"
          density="compact"
          label="描述"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          class="mr-2"
        />
        <v-btn
          color="primary"
          variant="tonal"
          @click="getCategories"
          class="mr-2"
        >
          查詢
        </v-btn>
        <v-btn
          class="button-add"
          variant="tonal"
          @click="handleAddCategory"
        >
          新增
        </v-btn>
      </div>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="categories"
      :loading="loading"
      :items-per-page="pageable.pageSize"
      @update:options="getCategories"
    >
      <template v-slot:item.actions="{ item }">
        <v-btn class="mr-2 button-edit" variant="outlined" density="compact" @click="handleEditCategory(item.id)">編輯</v-btn>
        <v-btn class="mr-2 button-delete" variant="outlined" density="compact" @click="deleteCategory(item.id)">刪除</v-btn>
      </template>
    </v-data-table>
  </v-card>

  <!-- 新增分類 -->
  <v-dialog v-model="dialogAddCategory" persistent width="auto" transition="dialog-bottom-transition">
    <v-card class="px-5 py-5" :loading="dialogLoading">
      <v-card-title class="bg-primary text-white px-5 py-3">
        <span class="text-h5 font-weight-bold">新增分類</span>
      </v-card-title>
      <v-form ref="addCategoryForm" v-model="addCategoryFormValid" validation-on="lazy blur"
              @submit.prevent="addCategory">
        <v-card-text class="px-5 py-3">
          <v-container>
            <v-row>
              <v-col cols="12" sm="4" md="6" class="py-2">
                <v-text-field
                  v-model="category.name"
                  label="名稱"
                  :rules="[commonRules.required]"
                  required
                  density="compact"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" sm="4" md="6" class="py-2">
                <v-text-field
                  v-model="category.description"
                  label="描述"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn
            class="add-button"
            variant="tonal"
            type="submit"
            :disabled="!addCategoryFormValid"
          >
            新增
          </v-btn>
          <v-btn
            class="button-cancel"
            variant="tonal"
            @click="dialogAddCategory = false"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <!-- 編輯分類 -->
  <v-dialog v-model="dialogEditCategory" persistent width="auto" transition="dialog-bottom-transition">
    <v-card class="px-5 py-5" :loading="dialogLoading">
      <v-card-title class="bg-primary text-white px-5 py-3">
        <span class="text-h5 font-weight-bold">編輯分類</span>
      </v-card-title>
      <v-form ref="editCategoryForm" v-model="editCategoryFormValid" validation-on="blur">
        <v-card-text class="px-5 py-3">
          <v-container>
            <v-row>
              <v-col cols="12" sm="4" md="6" class="py-2">
                <v-text-field
                  v-model="category.name"
                  label="名稱"
                  :rules="[commonRules.required]"
                  required
                  density="compact"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" sm="4" md="6" class="py-2">
                <v-text-field
                  v-model="category.description"
                  label="描述"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn
            class="button-edit"
            variant="tonal"
            @click="editCategory"
            :disabled="!editCategoryFormValid"
          >
            編輯
          </v-btn>
          <v-btn
            class="button-cancel"
            variant="tonal"
            @click="dialogEditCategory = false"
          >
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
