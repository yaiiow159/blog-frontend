<template>
  <v-row>
    <v-col cols="12">
      <v-toolbar flat>
        <v-toolbar-title class="text-h6 font-weight-bold">收藏文章</v-toolbar-title>
      </v-toolbar>
    </v-col>
    <v-col cols="12">
      <v-data-iterator
        :items="favoriteArticles"
        item-key="id"
        class="mb-4"
        content-class="pa-0"
      >
        <template v-slot:default="slotProps">
          <v-card elevation="2" rounded="lg" class="mb-4">
            <v-card-title class="bg-shades-transparent text-white py-3 px-4">
              <v-avatar color="white" size="36" class="mr-2">
                <span>{{ slotProps.item.authorName.charAt(0) }}</span>
              </v-avatar>
              <span class="text-h6 font-weight-bold">{{ slotProps.item.title }}</span>
            </v-card-title>
            <v-card-text class="py-3 px-4">
              <div class="text-body-1 mb-2">
                <strong>類別:</strong> {{ slotProps.item.categoryDto.name }}
              </div>
              <div class="text-body-1 mb-2">
                <strong>文章標籤:</strong>
                <v-chip-group>
                  <v-chip
                    v-for="tag in slotProps.item.tagDtoList"
                    :key="tag.id"
                    class="ma-1"
                    color="primary"
                    label
                    text-color="white"
                  >
                    <span>{{ tag.name || '無標籤' }}</span>
                  </v-chip>
                </v-chip-group>
              </div>
              <div class="text-body-1 mb-2">
                <strong>文章內文:</strong> {{ slotProps.item.content.substring(0, 100) }}...
              </div>
            </v-card-text>
            <v-card-actions class="px-4 pb-4">
              <v-btn color="primary" variant="tonal" @click="viewArticle(slotProps.item.id)">閱讀更多</v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-data-iterator>
    </v-col>
  </v-row>

  <v-dialog v-model="viewArticleDialog" persistent fullscreen scrollable transition="dialog-bottom-transition">
    <v-card class="article-dialog-card elevation-5">
      <v-card-title class="bg-primary text-white px-6 py-4">
        <span class="text-h5 font-weight-bold">{{ article.title }}</span>
      </v-card-title>
      <v-card-text class="px-6 py-4">
        <v-container>
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-h6 font-weight-bold mb-2">作者資訊</div>
                <div class="text-body-1">
                  <span class="font-weight-bold">作者:</span> {{ article.authorName }}
                </div>
                <div class="text-body-1">
                  <span class="font-weight-bold">作者郵箱:</span> {{ article.authorEmail }}
                </div>
              </div>
              <div class="article-content">
                <p class="text-body-1" v-html="article.content"></p>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions class="px-6 py-4">
        <v-spacer></v-spacer>
        <v-btn class="button-cancel" variant="outlined" @click="viewArticleDialog = false">
          返回
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axiosInstance from '@/utils/axiosHandler';

const favoriteArticles = reactive([]);
const snackbar = reactive({
  visible: false,
  color: '',
  message: ''
});
const loading = ref(false);
const article = reactive({});
const viewArticleDialog = ref(false);

onMounted(() => {
  getFavoriteArticles();
});

function showSnackbar(color, message) {
  snackbar.color = color;
  snackbar.message = message;
  snackbar.visible = true;
}

async function viewArticle(id) {
  try {
    loading.value = true;
    const response = await axiosInstance.get(`/posts/${id}`);
    const apiResponse = response.data;
    if (apiResponse.result) {
      Object.assign(article, apiResponse.data);
      viewArticleDialog.value = true;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', error.message);
  } finally {
    loading.value = false;
  }
}

async function getFavoriteArticles() {
  try {
    const response = await axiosInstance.get('/posts/favorite');
    const apiResponse = response.data;
    if (apiResponse.result) {
      favoriteArticles.splice(0, favoriteArticles.length, ...apiResponse.data);
    } else {
      showSnackbar('error', apiResponse.message);
    }
  } catch (error) {
    showSnackbar('error', error.message);
  }
}
</script>

<style scoped lang="sass">
.v-btn
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
  text-decoration: none
  transition: .2s ease-in-out
  &:hover
    color: var(--v-primary-base)

</style>
