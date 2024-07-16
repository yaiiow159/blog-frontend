<template>

  <MessageSnakeBar :color="snackbar.color" :message="snackbar.message"></MessageSnakeBar>

  <v-row>
    <v-col cols="12">
      <v-toolbar flat>
        <v-toolbar-title class="text-h6 font-weight-bold">個人文章</v-toolbar-title>
      </v-toolbar>
    </v-col>
    <v-col cols="12">
      <v-data-iterator
        :items="personalArticles"
        :items-per-page="5"
        :item-key="'id'"
        content-class="pa-0"
      >
        <template v-slot:default="props">
          <v-banner raised class="mb-4">
            <template v-slot:default>
              <v-avatar color="grey lighten-3" size="36" class="mr-2">
                <span>{{ props.item.authorName.charAt(0) }}</span>
              </v-avatar>
            </template>
            <template v-slot:title>
              <div class="text-h6 font-weight-bold">{{ props.item.title }}</div>
            </template>
            <template v-slot:text>
              <div class="text-body-2 mb-2">
                類別: <strong>{{ props.item.categoryDto.name }}</strong>
              </div>
              <div class="text-body-2 mb-2">
                文章標籤:
                <v-chip-group>
                  <v-chip
                    v-for="tag in props.item.tagDtoList"
                    :key="tag.id"
                    class="ma-1"
                    color="primary"
                    label
                    text-color="white"
                  >
                    <span>{{ tag.name ? tag.name : '無標籤' }}</span>
                  </v-chip>
                </v-chip-group>
              </div>
              <div class="text-body-2 mb-2">
                文章內文: {{ props.item.content.substring(0, 100) }}...
              </div>
            </template>
            <template v-slot:actions>
              <v-btn color="primary" variant="tonal" @click="viewArticle(props.item.id)">閱讀更多</v-btn>
            </template>
          </v-banner>
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
        <v-container fluid>
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
        <v-btn class="button-cancel" variant="tonal" @click="viewArticleDialog = false">返回</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {ref, onMounted,reactive} from "vue";
import axiosInstance from "@/utils/axiosHandler";

const snackbar = reactive({
  visible: false,
  color: '',
  message: ''
})
const personalArticles = reactive([]);

const viewArticleDialog = ref(false);
const loading = ref(false);
const article = reactive({});

onMounted(() => {
  getPersonalArticles();
})

function showSnackbar(color,message) {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.visible = true;
}

async function viewArticle(id) {
  loading.value = true;
  try {
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

async function getPersonalArticles() {
  try {
    const response = await axiosInstance.get('posts/personal');
    const apiResponse = response.data;
    if (apiResponse.result) {
      personalArticles.splice(0, personalArticles.length, ...apiResponse.data);
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

.article-dialog-card
  max-width: 800px
  margin: auto

.article-content
  max-height: 600px
  overflow-y: auto
  padding: 10px 20px
  border: 1px solid var(--v-primary-base)
  border-radius: 5px
  margin-top: 20px

  & p
    white-space: pre-wrap
    word-wrap: break-word
    margin-top: 10px
</style>
