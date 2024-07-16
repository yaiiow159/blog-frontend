<script setup>
import { onMounted, ref, reactive } from 'vue';
import axiosInstance from '@/utils/axiosHandler';
import { useUserStore } from '@/stores/user';
import Swal from 'sweetalert2';
import BreadcrumbBar from '@/components/BreadcrumbBar.vue';
import MessageSnakeBar from '@/components/MessageSnakeBar.vue';
import CommentList from '@/components/CommentList.vue';
import { commonRules } from '@/utils/rules';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const reportReasons = ref([
  { text: '垃圾內容', value: '垃圾內容' },
  { text: '不適合內容', value: '不適合內容' },
  { text: '其他', value: '其他' }
]);

const loadingState = reactive({
  isAddCommentFormLoading: false,
  isEditCommentFormLoading: false,
  isAddArticleFormLoading: false,
  isEditArticleFormLoading: false,
  isDataTableLoading: false
})

const dialog = reactive({
  viewArticle: false,
  addArticle: false,
  editArticle: false,
  reportComment: false,
  addComment: false,
  editComment: false
});

const snackbar = reactive({
  visible: false,
  color: '',
  message: ''
});

const validation = reactive({
  isAddCommentFormValid: false,
  isEditCommentFormValid: false,
  isAddArticleFormValid: false,
  isEditArticleFormValid: false,
  isReportCommentFormValid: false
});

const articleState = reactive({
  liked: false,
  disliked: false,
  bookmarked: false,
  viewsCount: 0,
  bookmarksCount: 0,
  likesCount: 0,
  dislikesCount: 0,
  isSubscribe: false
});

const pageable = reactive({
  totalElements: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 10
});

const searchFields = reactive({
  title: '',
  authorName: '',
  authorEmail: ''
});

const articles = reactive([]);
const article = reactive({
  id: null,
  title: '',
  authorName: '',
  content: '',
  description: '',
  status: '',
  categoryId: null,
  tagIds: [],
  imageUrl: '',
  imageFile: null,
  categoryDto: {},
  tagDtoList: [],
  comments: [],
});

const tags = reactive([]);
const categories = reactive([]);
const comment = reactive({
  id: null,
  content: '',
  postId: null,
  description: '',
  name: '',
  isReported: false,
  likes: 0,
  dislikes: 0
});

const headers = [
  { title: '標題', key: 'title', sortable: true },
  { title: '作者', key: 'authorName', sortable: true },
  { title: '內文', key: 'content', sortable: false },
  { title: '描述', key: 'description', sortable: false },
  { title: '狀態', key: 'status', sortable: true },
  { title: '發布時間', key: 'createDate', sortable: true },
  { title: '更新時間', key: 'updDate', sortable: true },
  { title: '操作', key: 'actions', sortable: false }
];

const breadcrumbs = ref([
  { text: '首頁', disabled: false, href: '/home' },
  { text: '文章管理', disabled: true, href: '/articles' }
]);

onMounted(async () => {
  await getArticles();
  await getCategories();
  await getTags();
});

function resetArticle() {
  Object.assign(article, {
    id: null,
    title: '',
    authorName: '',
    content: '',
    description: '',
    status: '',
    categoryId: null,
    tagIds: [],
    file: null
  });
}

async function checkIfSubscribe(id) {
  try {
    const response = await axiosInstance.get('/subscript/checkSubscription', {
      params: { postId: id, username: userInfo.username },
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      articleState.isSubscribe = apiResponse.data;
      articleState.bookmarked = articleState.isSubscribe;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', error.message);
  }
}

async function handleViewArticle(id) {
  resetArticle();
  await getArticle(id);
  await getBookmarksCount(id);
  await getLikesCount(id);
  await getViewsCount(id);
  await getDislikesCount(id);
  await checkIfSubscribe(id);
  dialog.viewArticle = true;
}

// 如果 有點讚 或是 點擊不喜歡 則取得最新的按讚數 以及倒讚數
watch(() => [articleState.liked, articleState.disliked], async () => {
  await getLikesCount(article.id);
  await getDislikesCount(article.id);
})

async function getTags() {
  try {
    const response = await axiosInstance.get('/tags/findList');
    const apiResponse = response.data;
    if (apiResponse.result) {
      tags.splice(0, tags.length, ...apiResponse.data);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '獲取標籤失敗');
  }
}

async function getCategories() {
  try {
    const response = await axiosInstance.get('/categories/findList');
    const apiResponse = response.data;
    if (apiResponse.result) {
      categories.splice(0, categories.length, ...apiResponse.data);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '獲取分類失敗');
  }
}

async function getArticles() {
  try {
    const response = await axiosInstance.get('/posts', {
      params: {
        title: searchFields.title,
        authorName: searchFields.authorName,
        authorEmail: searchFields.authorEmail,
        page: pageable.pageNumber,
        pageSize: pageable.pageSize
      }
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      articles.splice(0, articles.length, ...apiResponse.data.content);
      handlePageChange(apiResponse.data);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '獲取文章失敗');
  }
}

async function getArticle(id) {
  try {
    const response = await axiosInstance.get(`/posts/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      Object.assign(article, apiResponse.data);
      article.categoryId = article.categoryDto?.id || null;
      article.tagIds = article.tagDtoList?.map(tag => tag.id) || [];
      await addReview(id);
      await addView(id);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '獲取文章詳情失敗');
  }
}

async function addArticle() {
  const formData = new FormData();
  formData.append('title', article.title);
  formData.append('authorName', article.authorName);
  formData.append('content', article.content);
  formData.append('description', article.description);
  formData.append('status', article.status);
  formData.append('imageFile', article.imageFile);
  formData.append('categoryId', article.categoryId);
  formData.append('tagIds', article.tagIds);

  try {
    const response = await axiosInstance.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      dialog.addArticle = false;
      showSnackbar('success', apiResponse.message);
      await getArticles();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '新增文章失敗');
  }
}

async function editArticle() {
  const formData = new FormData();
  formData.append('imageFile', article.imageFile);
  formData.append('title', article.title);
  formData.append('authorName', article.authorName);
  formData.append('content', article.content);
  formData.append('description', article.description);
  formData.append('status', article.status);
  formData.append('categoryId', article.categoryId);
  formData.append('tagIds', article.tagIds);

  try {
    const response = await axiosInstance.put(`/posts/${article.id}`, formData,{
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      dialog.editArticle = false;
      showSnackbar('success', apiResponse.message);
      await getArticles();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '編輯文章失敗');
  }
}

async function deleteArticle(id) {
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
    if (result.isConfirmed) {
      const response = await axiosInstance.delete(`/posts/${id}`);
      const apiResponse = response.data;
      if (apiResponse.result) {
        showSnackbar('success', apiResponse.message);
        await getArticles();
      } else {
        showSnackbar('error', apiResponse.message);
      }
    }
  } catch {
    showSnackbar('error', '刪除文章失敗');
  }
}

async function addReview(id) {
  try {
    const response = await axiosInstance.post('/recentViews', {
      postId: id,
      userName: userInfo.username,
      title: article.title
    });
    const apiResponse = response.data;
    if (!apiResponse.result) {
      showSnackbar('error', apiResponse.message);
    }
    await getViewsCount(id);
  } catch {
    showSnackbar('error', '新增瀏覽失敗');
  }
}

async function addView(id) {
  try {
    const response = await axiosInstance.post(`/posts/${id}/views`);
    const apiResponse = response.data;
    if (!apiResponse.result) {
      showSnackbar('error', apiResponse.message);
    }
    await getViewsCount(id);
  } catch {
    showSnackbar('error', '新增瀏覽次數失敗');
  }
}

async function getViewsCount(id) {
  try {
    const response = await axiosInstance.get(`/posts/${id}/viewsCount`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      articleState.viewsCount = apiResponse.data;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '獲取瀏覽次數失敗');
  }
}

async function getDislikesCount(id) {
  try {
    const response = await axiosInstance.get(`/posts/${id}/dislikesCount`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      articleState.dislikesCount = apiResponse.data;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '獲取不喜歡次數失敗');
  }
}

async function getBookmarksCount(id) {
  try {
    const response = await axiosInstance.get(`/posts/${id}/bookmarksCount`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      articleState.bookmarksCount = apiResponse.data;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '獲取收藏次數失敗');
  }
}

async function toggleBookmark() {
  try {
    if (articleState.bookmarked) {
      await axiosInstance.delete(`/posts/${article.id}/bookmarks`);
      await cancelSubscription();
      articleState.bookmarked = false;
    } else {
      await axiosInstance.post(`/posts/${article.id}/bookmarks`);
      await setSubscription();
      articleState.bookmarked = true;
    }
    await getBookmarksCount(article.id);
  } catch {
    showSnackbar('error', '切換收藏失敗');
  }
}

function handlePageChange(apiResponse) {
  pageable.pageNumber = apiResponse.number + 1;
  pageable.pageSize = apiResponse.size;
  pageable.totalPages = apiResponse.totalPages;
  pageable.totalElements = apiResponse.totalElements;
}

async function setSubscription() {
  try {
    const response = await axiosInstance.post('/subscript/notification', {
      postId: article.id,
      username: userInfo.username,
      authorName: article.authorName,
      email: article.authorEmail
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      showSnackbar('success', apiResponse.message);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '設置訂閱失敗');
  }
}

async function cancelSubscription() {
  try {
    const response = await axiosInstance.delete('/subscript/notification', {
      data: {
        postId: article.id,
        username: userInfo.username,
        authorName: article.authorName,
        email: article.authorEmail
      }
    });
    const apiResponse = response.data;
    if (apiResponse.result) {
      articleState.bookmarksCount = apiResponse.data;
      showSnackbar('success', apiResponse.message);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '取消訂閱失敗');
  }
}

async function getLikesCount() {
  try {
    const response = await axiosInstance.get(`/posts/${article.id}/likesCount`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      articleState.likesCount = apiResponse.data;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '獲取喜歡次數失敗');
  }
}

async function getDislikeCount() {
  try {
    const response = await axiosInstance.get(`/posts/${article.id}/dislikesCount`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      articleState.dislikesCount = apiResponse.data;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '獲取不喜歡次數失敗');
  }
}

async function like() {
  try {
    const response = await axiosInstance.post(`/posts/${article.id}/like`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      articleState.liked = true;
      showSnackbar('success', apiResponse.message);
      await getLikesCount();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '點贊文章失敗');
  }
}

async function dislike() {
  try {
    const response = await axiosInstance.delete(`/posts/${article.id}/like`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      articleState.disliked = false;
      showSnackbar('success', apiResponse.message);
      await getDislikeCount();
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch {
    showSnackbar('error', '不喜歡點讚失敗');
  }
}

function openAddComment() {

}

function openEditComment() {

}


function showSnackbar(color, message) {
  snackbar.color = color;
  snackbar.message = message;
  snackbar.visible = true;
}
</script>

<template>
  <!-- 麵包屑導覽列 -->
  <BreadcrumbBar :items="breadcrumbs"></BreadcrumbBar>
  <!-- 訊息顯示列-->
  <MessageSnakeBar :color="snackbar.color" :message="snackbar.message"></MessageSnakeBar>

  <!-- 文章管理頁面 -->
  <v-card flat>
    <v-card-title class="d-flex align-center justify-space-between px-4 py-2">
      <div class="d-flex align-center">
        <v-text-field v-model="searchFields.title" density="compact" label="標題" prepend-inner-icon="mdi-title" variant="outlined" hide-details class="mr-2"></v-text-field>
        <v-text-field v-model="searchFields.authorName" density="compact" label="作者名稱" prepend-inner-icon="mdi-account" variant="outlined" hide-details class="mr-2"></v-text-field>
        <v-text-field v-model="searchFields.authorEmail" density="compact" label="作者郵箱" prepend-inner-icon="mdi-email" variant="outlined" hide-details></v-text-field>
      </div>
      <div class="d-flex align-center">
        <v-btn class="button-query mr-2" variant="tonal" @click="getArticles">查詢</v-btn>
        <v-btn class="button-add" variant="tonal" @click="dialog.addArticle = true">新增</v-btn>
      </div>
    </v-card-title>
    <v-data-table :headers="headers" :loading="loadingState.isDataTableLoading" loading-text="載入資料中..." :items="articles" :items-per-page="pageable.pageSize" height="calc(100vh - 300px)">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>文章列表</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip :color="item.status === '已發佈' ? 'success' : 'warning'">{{ item.status }}</v-chip>
      </template>
      <template v-slot:item.content="{ item }">
        <div class="max-25" v-html="item.content.substring(0, 100) + '...'"></div>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn class="me-2 mb-2 button-query" variant="tonal" density="compact" @click="handleViewArticle(item.id)">閱讀</v-btn>
        <v-btn v-show="userStore.userInfo.username === item.authorName" class="me-2 mb-2 button-edit" variant="tonal" density="compact" @click="handleEditArticle(item.id)">編輯</v-btn>
        <v-btn v-show="userStore.userInfo.username === item.authorName" class="me-2 mb-2 button-delete" variant="tonal" density="compact" @click="deleteArticle(item.id)">刪除</v-btn>
      </template>
      <template v-slot:bottom>
        <div class="text-center pt-2">
          <v-pagination v-model="pageable.pageNumber" :length="pageable.totalPages" total-visible="5" @update:modelValue="getArticles" rounded="circle" density="compact"></v-pagination>
        </div>
      </template>
    </v-data-table>
  </v-card>

  <!-- 新增文章 -->
  <v-dialog v-model="dialog.addArticle" persistent fullscreen scrollable transition="dialog-bottom-transition">
    <v-card flat>
      <v-card-title>
        <span class="text-h5">新增文章</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="addArticleForm" v-model="validation.isAddArticleFormValid" validate-on-blur>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-file-input accept="image/png" v-model="article.imageFile" label="輸入圖片" error-messages="請選擇圖片檔案" show-size>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-image-outline"></v-icon>
                  </template>
                </v-file-input>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-select v-model="article.categoryId" :items="categories" item-title="name" item-value="id" label="分類" :rules="[commonRules.required]">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-folder-outline"></v-icon>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="6">
                <v-select multiple v-model="article.tagIds" :items="tags" item-title="name" item-value="id" label="標籤" :rules="[commonRules.required]">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-tag-multiple-outline"></v-icon>
                  </template>
                </v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="article.title" label="標題" :rules="[commonRules.required]" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="article.authorName" label="作者" :rules="[commonRules.required]" required></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-textarea v-model="article.description" label="簡要描述"></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-textarea v-model="article.content" label="內容" :rules="[commonRules.required]" required></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="button-add" variant="text" @click="addArticle">新增</v-btn>
        <v-btn class="button-cancel" variant="text" @click="dialog.addArticle = false">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 編輯文章 -->
  <v-dialog v-model="dialog.editArticle" persistent fullscreen scrollable transition="dialog-bottom-transition">
    <v-card flat>
      <v-card-title>
        <span class="text-h5">編輯文章</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="editArticleForm" v-model="validation.isEditArticleFormValid" validate-on-blur>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-file-input accept="image/png" v-model="article.imageFile" label="輸入圖片" error-messages="請選擇圖片檔案" show-size>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-image-outline"></v-icon>
                  </template>
                </v-file-input>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-select v-model="article.categoryId" :items="categories" item-title="name" item-value="id" label="分類" :rules="[commonRules.required]">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-folder-outline"></v-icon>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="6">
                <v-select multiple v-model="article.tagIds" :items="tags" item-title="name" item-value="id" label="標籤" :rules="[commonRules.required]">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-tag-multiple-outline"></v-icon>
                  </template>
                </v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="article.title" label="標題" :rules="[commonRules.required]" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="article.authorName" label="作者" :rules="[commonRules.required]" required></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-textarea v-model="article.description" label="簡要描述"></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-textarea v-model="article.content" label="內容" :rules="[commonRules.required]" required></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="button-add" variant="text" @click="editArticle">保存</v-btn>
        <v-btn class="button-cancel" variant="text" @click="dialog.editArticle = false">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 文章詳情 -->
  <v-dialog v-model="dialog.viewArticle" persistent fullscreen scrollable transition="dialog-bottom-transition" width="auto">
    <v-card flat>
      <v-card-subtitle>
        <span>作者名稱: {{ article.authorName }}</span><br>
        <span>作者郵箱: {{ article.authorEmail }}</span>
      </v-card-subtitle>
      <v-card-text>
        <span>{{ article.description }}</span>
        <p class="mt-2" v-html="article.content"></p>
      </v-card-text>
      <v-card-actions>
        <div class="stats">
          <v-chip class="ma-2">
            <v-icon left>mdi-eye</v-icon>
            瀏覽數：{{ articleState.viewsCount }}
          </v-chip>
          <v-chip class="ma-2">
            <v-icon left>mdi-bookmark-multiple-outline</v-icon>
            收藏數：{{ articleState.bookmarksCount }}
          </v-chip>
          <v-chip class="ma-2">
            <v-icon left>mdi-heart</v-icon>
            喜歡：{{ articleState.likesCount }}
          </v-chip>
          <v-chip class="ma-2">
            <v-icon left>mdi-heart</v-icon>
            不喜歡：{{ articleState.dislikesCount }}
          </v-chip>
          <v-btn @click="like">
            <v-icon color="green">{{ articleState.liked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
          </v-btn>
          <v-btn @click="dislike">
            <v-icon color="red">{{ articleState.disliked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
          </v-btn>
          <v-btn @click="toggleBookmark">
            <v-icon>{{ articleState.bookmarked ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}</v-icon>
          </v-btn>
          <v-btn @click="openComment">
            <v-icon>mdi-message-text-outline</v-icon>
          </v-btn>
          <v-btn @click="dialog.viewArticle = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-actions>
      <v-divider thickness="3"></v-divider>
      <CommentList :postId="article.id" @edit-comment="openEditComment" @report-comment="openReportComment" @delete-comment="handleDeleteComment" />
    </v-card>
  </v-dialog>

  <!-- 新增留言 -->
  <v-dialog v-model="dialog.addComment" persistent max-width="400">
    <v-card flat>
      <v-card-title class="bg-primary text-white px-6 py-4">
        <span class="text-h6 font-weight-bold">新增留言</span>
      </v-card-title>
      <v-card-text class="px-6 py-4">
        <v-form ref="addCommentForm" v-model="validation.isAddCommentFormValid" validate-on-blur>
          <v-text-field v-model="userInfo.username" label="名稱" readonly dense></v-text-field>
          <v-textarea v-model="comment.content" label="內容" rows="3" outlined :rules="[commonRules.required]"></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions class="px-6 py-4">
        <v-spacer></v-spacer>
        <v-btn color="error" @click="dialog.addComment = false">取消</v-btn>
        <v-btn color="primary" :disabled="!validation.isAddCommentFormValid" @click="addComment">送出</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 編輯留言 -->
  <v-dialog v-model="dialog.editComment" persistent max-width="400">
    <v-card flat>
      <v-card-title class="bg-primary text-white px-6 py-4">
        <span class="text-h6 font-weight-bold">編輯留言</span>
      </v-card-title>
      <v-form ref="editCommentForm" v-model="validation.isEditCommentFormValid" validate-on="lazy blur">
      <v-card-text class="px-6 py-4">

          <v-text-field v-model="userInfo.username" label="名稱" readonly dense></v-text-field>
          <v-textarea v-model="comment.content" label="內容" rows="3" outlined :rules="[commonRules.required]"></v-textarea>
      </v-card-text>
      <v-card-actions class="px-6 py-4">
        <v-spacer></v-spacer>
        <v-btn class="button-add" :disabled="!validation.isEditCommentFormValid" @click="editComment">送出</v-btn>
        <v-btn class="button-cancel" @click="dialog.editComment = false">取消</v-btn>
      </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <!-- 檢舉留言 -->
  <v-dialog v-model="dialog.reportComment" persistent max-width="400px">
    <v-card flat>
      <v-card-title class="bg-primary text-white px-6 py-4">
        <span class="text-h6 font-weight-bold">檢舉留言</span>
      </v-card-title>
      <v-card-text class="px-6 py-4">
        <v-form ref="reportCommentForm" v-model="validation.isReportCommentFormValid" lazy-validation>
          <v-text-field v-model="userInfo.username" label="名稱" readonly dense></v-text-field>
          <v-select v-model="comment.reason" :items="reportReasons" label="檢舉原因" outlined :rules="[v => !!v || '請選擇檢舉原因']"></v-select>
        </v-form>
      </v-card-text>
      <v-card-actions class="px-6 py-4">
        <v-spacer></v-spacer>
        <v-btn color="error" @click="dialog.reportComment = false">取消</v-btn>
        <v-btn color="primary" :disabled="!validation.isReportCommentFormValid" @click="handleReportComment(comment.id)">送出</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<style scoped lang="scss">
.v-btn {
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity));
  text-decoration: none;
  transition: .2s ease-in-out;

  &:hover {
    color: var(--v-primary-base);
  }
}

.stats {
  display: flex;
  max-width: 100%;
}
</style>

