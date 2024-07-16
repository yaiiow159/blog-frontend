<template>
  <!-- 導覽列 -->
  <BreadcrumbBar :items="breadcrumbs" />

  <!-- 訊息顯示列 -->
  <MessageSnakeBar :color="snackbar.color" :message="snackbar.message" />

  <!-- 搜尋文章區 -->
  <v-row class="mt-5 mb-5">
    <v-col cols="12" md="6">
      <v-text-field
        v-model="keyWord"
        label="搜尋文章"
        single-line
        hide-details
        clearable
        class="rounded-xl"
        append-icon="mdi-magnify"
        @click:append="searchArticles"
      />
    </v-col>
  </v-row>

  <!-- 熱門標籤區 -->
  <v-row>
    <v-col cols="12">
      <h2 class="text-h5 font-weight-bold mb-4">熱門標籤</h2>
      <v-chip-group column>
        <v-chip
          v-for="tag in tags"
          :key="tag.id"
          :value="tag.name"
          @click="getArticlesByTagId(tag.id)"
          class="ma-1"
          color="primary"
          label
          text-color="white"
        >
          {{ tag.name }}
        </v-chip>
      </v-chip-group>
    </v-col>
  </v-row>

  <!-- 文章區 -->
  <v-row>
    <v-col cols="12" md="6" lg="4">
      <v-card>
        <v-tabs
          v-model="displaySection"
          grow
          bg-color="transparent"
        >
          <v-tab value="one">最新文章</v-tab>
          <v-tab value="two">熱門文章</v-tab>
        </v-tabs>

        <v-card-text>
          <v-tabs-window v-model="displaySection">
            <v-tabs-window-item value="latest">
              <ArticleList :articles="latestArticles" title="最新文章" @view-article="viewArticle" />
            </v-tabs-window-item>
            <v-tabs-window-item value="popular">
              <ArticleList :articles="popularArticles" title="熱門文章" @view-article="viewArticle" />
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- 搜尋結果區 -->
  <ArticleSection
    v-if="keyWordArticles.length > 0"
    :articles="keyWordArticles"
    title="搜尋結果"
    @view-article="viewArticle"
  />

  <!-- 文章詳情對話框 -->
  <v-dialog v-model="viewArticleDialog" persistent fullscreen transition="dialog-bottom-transition">
    <div class="article-container">
      <div class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <h2 class="article-author">作者: {{ article.authorName }}</h2>
        <h3 class="article-email">作者郵箱: {{ article.authorEmail }}</h3>
      </div>
      <div class="article-content">
        <h4>文章内容:</h4>
        <p v-html="article.content"></p>
      </div>
      <div class="article-actions">
        <button @click="viewArticleDialog = false" class="button-cancel" variant="outlined">返回</button>
      </div>
    </div>
  </v-dialog>
</template>

<script setup>
import BreadcrumbBar from '@/components/BreadcrumbBar.vue';
import MessageSnakeBar from '@/components/MessageSnakeBar.vue';
import ArticleSection from '@/components/ArticleList.vue';
import { ref, onMounted, reactive } from 'vue';
import axiosInstance from "@/utils/axiosHandler";

const tags = reactive([]);
const keyWordArticles = reactive([]);
const latestArticles = reactive([]);
const popularArticles = reactive([]);
const article = reactive({
  title: '',
  content: '',
  image: null,
  authorName: '',
  authorEmail: ''
});

const breadcrumbs = ref([{ text: '首頁', disabled: false, href: '/' }]);
const displaySection = ref('latest');
const keyWord = ref('');
const snackbar = reactive({
  visible: false,
  color: '',
  message: ''
});
const loading = ref(false);
const viewArticleDialog = ref(false);

onMounted(() => {
  getLatestArticles();
  getPopularArticles();
  getHotTags();
});

async function getHotTags() {
  try {
    const response = await axiosInstance.get('/tags/findHotTag');
    if (response.data.result) {
      tags.splice(0, tags.length, ...response.data.data);
    } else {
      showSnackbar(response.data.message, 'error');
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function getArticlesByTagId(tagId) {
  loading.value = true;
  try {
    const response = await axiosInstance.get(`/posts/searchByTag/${tagId}`);
    if (response.data.result) {
      keyWordArticles.splice(0, keyWordArticles.length, ...response.data.data);
    } else {
      showSnackbar(response.data.message, 'error');
    }
  } catch (error) {
    showSnackbar(error.message, 'error');
  } finally {
    loading.value = false;
  }
}

async function searchArticles() {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/posts/searchByKeyword', {
      params: { keyword: keyWord.value }
    });
    if (response.data.result) {
      keyWordArticles.splice(0, keyWordArticles.length, ...response.data.data);
    } else {
      showSnackbar(response.data.message, 'error');
    }
  } catch (error) {
    showSnackbar(error.message, 'error');
  } finally {
    loading.value = false;
  }
}

async function getLatestArticles() {
  await fetchArticles('/posts/latest', latestArticles);
}

async function getPopularArticles() {
  await fetchArticles('/posts/popular', popularArticles);
}

async function fetchArticles(url, articlesArray) {
  loading.value = true;
  try {
    const response = await axiosInstance.get(url);
    if (response.data.result) {
      articlesArray.splice(0, articlesArray.length, ...response.data.data);
    } else {
      showSnackbar(response.data.message, 'error');
    }
  } catch (error) {
    showSnackbar(error.message, 'error');
  } finally {
    loading.value = false;
  }
}

async function viewArticle(id) {
  loading.value = true;
  try {
    const response = await axiosInstance.get(`/posts/${id}`);
    if (response.data.result) {
      Object.assign(article, response.data.data);
      viewArticleDialog.value = true;
    } else {
      showSnackbar(response.data.message, 'error');
    }
  } catch (error) {
    showSnackbar(error.message, 'error');
  } finally {
    loading.value = false;
  }
}

function showSnackbar(message, color) {
  snackbar.color = color;
  snackbar.message = message;
  snackbar.visible = true;
}
</script>

<style scoped lang="sass">
.v-btn
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
  text-decoration: none
  transition: .2s ease-in-out

  &:hover
    color: var(--v-primary-base)

.article-container
  max-width: 800px
  margin: 0 auto
  padding: 20px
  background-color: #fff
  border-radius: 10px
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1)

.article-header
  margin-bottom: 20px

.article-title
  font-size: 2em
  font-weight: bold
  margin-bottom: 10px

.article-author,
.article-email
  font-size: 1.2em
  margin-bottom: 5px

.article-content
  max-height: 600px
  overflow-y: auto
  padding-right: 10px
  margin-bottom: 20px

.article-content h4
  font-size: 1.5em
  font-weight: bold
  margin-bottom: 10px

.article-content p
  line-height: 1.6

.article-actions
  text-align: right

.button-cancel
  background-color: #ff5252
  color: #fff
  border: none
  padding: 10px 20px
  border-radius: 5px
  cursor: pointer
  transition: all 0.3s ease-in-out

  &:hover
    background-color: #e53935
</style>
