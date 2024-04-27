<template>
  <v-breadcrumbs bg-color="transparent" color="white" active-color="primary" :items="breadcrumbs" divider=">" >
    <template v-slot:prepend>
      <v-icon icon="mdi-home" size="small"></v-icon>
    </template>
    <template v-slot:item="{ item }">
      <v-breadcrumbs-item :title="item.text" :href="item.href" :disabled="item.disabled">
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
  <v-container fluid>
    <v-row class="search-bar">
      <v-col cols="12" sm="8" offset-sm="2">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="搜尋文章"
          single-line
          hide-details
        ></v-text-field>
        <v-btn translate="yes" color="search" @click="searchArticles">搜尋</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="7" offset-sm="1">
        <h2>最新文章</h2>
        <v-row>
          <v-col
            cols="12"
            sm="6"
            md="4"
            v-for="article in latestArticles"
            :key="article.id"
          >
            <v-card>
              <v-img :src="article.image" aspect-ratio="4/3"></v-img>
              <v-card-title>{{ article.title }}</v-card-title>
              <v-card-subtitle>{{ article.authorName }}</v-card-subtitle>
              <v-card-text>{{ article.content.substring(0, 100) + '...' }}</v-card-text>
              <v-card-actions>
                <v-btn translate="yes" color="primary" text="檢閱" @click="viewArticle(article.id)">檢閱</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" sm="7" offset-sm="1">
        <h2>熱門文章</h2>
        <v-row>
          <v-col
            cols="12"
            sm="6"
            md="4"
            v-for="article in popularArticles"
            :key="article.id"
          >
            <v-card class="article-card" elevation="2">
                <v-img :src="article.image" aspect-ratio="4/3" alt="article image" ></v-img>
                <v-card-title>{{ article.title }}</v-card-title>
                <v-card-subtitle>{{ article.authorName }}</v-card-subtitle>
                <v-card-text>{{ article.content.substring(0, 100) + '...' }}</v-card-text>
                <v-card-actions>
                    <v-btn translate="yes" color="primary" text="檢視" @click="viewArticle(article.id)">檢視</v-btn>
                </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="viewArticleDialog" persistent fullscreen>
    <v-card color="transparent" class="mx-auto pa-5 rounded-xl">
      <v-card-title class="text-h5">{{ article.title }}</v-card-title>
      <v-card-text>
        <v-container fluid>
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

  <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor" top absolute >
    {{ receiveMessage }}
  </v-snackbar>

  <v-overlay :opacity="0.8" :model-value="loading" z-index="999" absolute>
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </v-overlay>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import axiosInstance from "@/utils/request";

  const viewArticleDialog = ref(false);
  const article = ref({});
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
         snackbarColor.value = 'success'
         popularArticles.value = response.data.data
       }
    }).catch((error) => {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = error.response.data.message
      snackbar.value = true
    })
  }

  async function viewArticle(id) {
    loading.value = true
    await axiosInstance.get('/posts/' + id).then((response) => {
       if(response.data.result) {
         loading.value = false
         snackbarColor.value = 'success'
         article.value = response.data.data
         viewArticleDialog.value = true
       }
    }).catch((error) => {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = error.response.data.message
      snackbar.value = true
    })
  }

</script>

<style scoped lang="sass">
.search-bar
  position: relative
  margin-bottom: 20px
  .v-text-field
    max-width: 300px
    margin: 0 auto
.v-img
  transition: transform 0.5s ease
  cursor: pointer

.v-img:hover
  transform: scale(1.05)
.v-card-title, .v-card-text
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
h2
  font-size: 2em
  font-weight: bold
  color: #333
  position: relative
  text-align: center
  margin-bottom: 1.5em
  background: -webkit-linear-gradient(45deg, var(--v-theme-primary), var(--v-theme-secondary))
  -webkit-background-clip: text
  -webkit-text-fill-color: transparent
  text-shadow: 2px 2px 8px var(--v-theme-primary)

  &:after
    content: ''
    display: block
    width: 60%
    height: 4px
    background: -webkit-linear-gradient(45deg, var(--v-theme-primary), var(--v-theme-secondary))
    margin: 20px auto
    border-radius: 2px
    transition: width 0.3s
    @media (hover: hover)
      &:hover
        width: 100%

  @media (max-width: 768px)
    font-size: 1.5em
@keyframes fadeIn
  from
    opacity: 0
    transform: translateY(20px)
  to
    opacity: 1
    transform: translateY(0)
.article-card
  animation: fadeIn 0.8s ease-out
  opacity: 0
.article-content
  white-space: pre-wrap
  word-break: break-all
  overflow-y: auto
</style>

