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
    <v-row class="mt-5 mb-5">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="搜尋文章"
          single-line
          hide-details
          clearable
          class="rounded-xl"
          append-icon="mdi-magnify"
          @click:append="searchArticles"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-card-title class="text-h5">最新文章區</v-card-title>
      <v-col
        cols="12"
        md="4"
        sm="6"
        v-for="article in latestArticles"
        :key="article.id"
      >
        <v-card class="mx-auto" max-width="344" outlined>
          <v-img :src="article.image" height="200px" class="white--text align-end" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)">
            <v-card-title>{{ article.title }}</v-card-title>
          </v-img>
          <v-card-subtitle class="pb-0">{{ article.authorName }}</v-card-subtitle>
          <v-card-text class="text--primary">
            <div>{{ article.content.substring(0, 100) + '...' }}</div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" text @click="viewArticle(article.id)">閱讀更多</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-divider thickness="2" class="my-3">
      <v-icon icon="mdi-arrow-down"></v-icon>
    </v-divider>
    <v-row>
      <v-card-title class="text-h5">熱門文章區</v-card-title>
      <v-col
        cols="12"
        md="4"
        sm="6"
        v-for="article in latestArticles"
        :key="article.id"
      >
        <v-card class="mx-auto" max-width="344" outlined>
          <v-img :src="article.image" height="200px" class="white--text align-end" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)">
            <v-card-title>{{ article.title }}</v-card-title>
          </v-img>
          <v-card-subtitle class="pb-0">{{ article.authorName }}</v-card-subtitle>
          <v-card-text class="text--primary">
            <div>{{ article.content.substring(0, 100) + '...' }}</div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" text @click="viewArticle(article.id)">閱讀更多</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-progress-circular size="64" indeterminate color="primary" v-if="loading"></v-progress-circular>

  <v-dialog v-model="viewArticleDialog" persistent fullscreen>
    <v-card class="pa-5 rounded-xl">
      <v-card-title class="text-h5">{{ article.title }}</v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" md="4">
              <v-img :src="article.image" aspect-ratio="4/3"></v-img>
              <v-list>
                <v-list-item>
                    <v-list-item-title>作者: {{ article.authorName }}</v-list-item-title>
                    <v-list-item-subtitle>作者郵箱: {{ article.authorEmail }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="8">
              <div class="article-content" style="max-height: 600px; overflow-y: auto;">
                {{ article.content }}
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="cancel" text="返回" @click="viewArticleDialog = false">返回</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import axiosInstance from "@/utils/request";

  const viewArticleDialog = ref(false);
  const snackbar = ref(false);
  const snackbarColor = ref('');
  const receiveMessage = ref('');
  const loading = ref(false);
  const search = ref('');
  const breadcrumbs = ref([
    { text: '首頁', disabled: false, href: '/' }
  ]);
  const latestArticles = ref([
  ]);
  const popularArticles = ref([
  ]);
  const article = ref({
    title: '',
    content: '',
    image: null,
    authorName: '',
    authorEmail: ''
  });
  onMounted(async () => {
    await getLatestArticles()
    await getPopularArticles()
  })

  async function searchArticles() {
    loading.value = true
    await axiosInstance.get('/posts/searchByKeyword', {params: {keyword: search.value}}).then((response) => {
      if(response.data.result) {
        loading.value = false
        snackbarColor.value = 'success'
        latestArticles.value = response.data.data
      }
    }).catch((error) => {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = error.response.data.message
      snackbar.value = true
    })
  }

  async function getLatestArticles() {
    loading.value = true
    await axiosInstance.get('/posts/latest').then((response) => {
       if(response.data.result) {
         loading.value = false
         snackbarColor.value = 'success'
         latestArticles.value = response.data.data
       }
    }).catch((error) => {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = error.response.data.message
      snackbar.value = true
    })
  }

  async function getPopularArticles() {
    loading.value = true
    await axiosInstance.get('/posts/popular').then((response) => {
       if(response.data.result) {
         loading.value = false
         popularArticles.value = response.data.data
       }
    }).catch(() => {
      loading.value = false
    })
  }

  async function viewArticle(id) {
    loading.value = true
    await axiosInstance.get('/posts/' + id).then((response) => {
       if(response.data.result) {
         loading.value = false
         article.value = response.data.data
         viewArticleDialog.value = true
       }
    }).catch(() => {
      loading.value = false
    })
  }

</script>

<style scoped lang="sass">
.v-btn
  transition: background-color 0.3s ease
.v-btn:hover
  background-color: var(--v-primary-base)

</style>

