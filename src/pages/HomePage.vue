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

   <!-- 輪播圖片區 -->
    <v-carousel
      cycle
      height="600"
      show-arrows-on-hover
    >
      <v-carousel-item
        v-for="(item, i) in items"
        :key="i"
        :lazy-src="item.src"
      ></v-carousel-item>
    </v-carousel>

  <!-- 搜尋文章區 -->
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
      <v-col cols="6">
        <v-btn-toggle v-model="displaySection" mandatory>
          <v-btn value="latest">最新文章</v-btn>
          <v-btn value="popular">熱門文章</v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col cols="6">
        <v-chip-group column>
          <v-chip
              v-for="tag in tags"
              :key="tag.id"
              :value="tag.name"
              @click="getArticlesByTagId(tag.id)"
          >
            {{ tag.name }}
          </v-chip>
        </v-chip-group>
      </v-col>
    </v-row>
  <!-- 最新文章區 -->
  <v-row v-show="displaySection === 'latest'">
      <v-col cols="12">
        <v-card-title class="text-h5">最新文章區</v-card-title>
      </v-col>
      <v-col cols="12" v-for="article in latestArticles" :key="article.id">
          <v-banner
                  raised
                  class="my-1"
          >
              <template v-slot:default>
                  <v-avatar color="grey lighten-3" size="36" class="mr-2">
                      <span>{{ article.authorName.charAt(0) }}</span>
                  </v-avatar>
              </template>
              <template v-slot:title>
                  <div class="text-h6 font-weight-bold">{{ article.title }}</div>
              </template>
              <template v-slot:text>
                  <div class="text-body-2 mb-2">
                      類別: <strong>{{ article.categoryDto.name }}</strong>
                  </div>
                  <div class="text-body-2 mb-2">
                      文章標籤:
                      <v-chip-group>
                          <v-chip
                                  v-for="tag in article.tagDtoList"
                                  :key="tag.id"
                                  class="ma-1"
                                  color="primary"
                                  label
                                  text-color="white"
                          >
                              <span>{{ tag.name ? tag.name : '無標籤' }}></span>
                          </v-chip>
                      </v-chip-group>
                  </div>
                  <div class="text-body-2 mb-2">
                      文章內文: {{ article.content.substring(0, 100) }}...
                  </div>
              </template>
              <template v-slot:actions>
                  <v-btn color="primary" text @click="viewArticle(article.id)"
                  >閱讀更多</v-btn
                  >
              </template>
          </v-banner>
      </v-col>
  </v-row>
  <!-- 熱門文章區 -->
  <v-row v-show="displaySection === 'popular'">
      <v-col cols="12">
        <v-card-title class="text-h5">熱門文章區</v-card-title>
      </v-col>
    <v-col cols="12" v-for="article in popularArticles" :key="article.id">
        <v-banner
          raised
          class="my-1"
        >
          <template v-slot:default>
              <v-avatar color="grey lighten-3" size="36" class="mr-2">
                  <span>{{ article.authorName.charAt(0) }}</span>
            </v-avatar>
          </template>
          <template v-slot:title>
            <div class="text-h6 font-weight-bold">{{ article.title }}</div>
          </template>
          <template v-slot:text>
            <div class="text-body-2 mb-2">
              類別: <strong>{{ article.categoryDto.name }}</strong>
            </div>
            <div class="text-body-2 mb-2">
              文章標籤:
              <v-chip-group>
                <v-chip
                  v-for="tag in article.tagDtoList"
                  :key="tag.id"
                  class="ma-1"
                  color="primary"
                  label
                  text-color="white"
                >
                  {{ tag.name }}
                </v-chip>
              </v-chip-group>
            </div>
            <div class="text-body-2 mb-2">
              文章內文: {{ article.content.substring(0, 100) }}...
            </div>
          </template>
          <template v-slot:actions>
            <v-btn color="primary" text @click="viewArticle(article.id)"
            >閱讀更多</v-btn
            >
          </template>
        </v-banner>
    </v-col>
  </v-row>
  <v-row>
    <v-col v-if="keyWordArticles.length > 0" cols="12">
        <v-card-title class="text-h5">搜尋結果</v-card-title>
    </v-col>
    <v-col cols="12" v-for="article in keyWordArticles" :key="article.id">
        <v-banner
          raised
          class="my-1"
        >
          <template v-slot:default>
            <div>
              <v-avatar color="grey lighten-3" size="36" class="mr-2">
                <span>{{ article.authorName.charAt(0) }}</span>
              </v-avatar>
            </div>
          </template>
          <template v-slot:title>
            <div class="text-h6 font-weight-bold">{{ article.title }}</div>
          </template>
          <template v-slot:text>
            <div class="text-body-2 mb-2">
              類別: <strong>{{ article.categoryDto.name }}</strong>
            </div>
            <div class="text-body-2 mb-2">
              文章標籤:
              <v-chip-group>
                <v-chip
                  v-for="tag in article.tagDtoList"
                  :key="tag.id"
                  class="ma-1"
                  color="primary"
                  label
                  text-color="white"
                >
                  {{ tag.name }}
                </v-chip>
              </v-chip-group>
            </div>
            <div class="text-body-2 mb-2">
              文章內文: {{ article.content.substring(0, 100) }}...
            </div>
          </template>
          <template v-slot:actions>
            <v-btn color="primary" text @click="viewArticle(article.id)"
            >閱讀更多</v-btn
            >
          </template>
        </v-banner>
    </v-col>
  </v-row>

  <!-- 介紹關於我的區域 -->
  <PersonalResume/>

  <v-progress-circular size="64" indeterminate color="primary" v-if="loading"></v-progress-circular>


  <v-dialog v-model="viewArticleDialog" persistent fullscreen>
    <v-card class="pa-5 rounded-xl elevation-5">
      <v-card-text>
        <v-container fluid>
          <v-row>
            <v-col cols="12" md="6">
              <v-list dense>
                <v-list-item>
                    <v-list-item-title class="text-h5 font-weight-bold mb-2">標題: {{ article.title }}</v-list-item-title>
                    <v-list-item-title class="font-weight-bold mb-2">作者: {{ article.authorName }}</v-list-item-title>
                    <v-list-item-subtitle class="mb-2">作者郵箱: {{ article.authorEmail }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <div style="max-height: 600px; overflow-y: auto; margin-left: 20px;">
                <span class="text-h6 font-weight-bold">文章内容:</span>
                <p>{{ article.content }}</p>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="cancel" text @click="viewArticleDialog = false">返回</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import axiosInstance from "@/utils/request";

  const items = ref([
    { src: 'https://cdn.vuetifyjs.com/images/carousel/squirrel.jpg'},
    { src: 'https://cdn.vuetifyjs.com/images/carousel/sky.jpg'},
    { src: 'https://cdn.vuetifyjs.com/images/carousel/bird.jpg'},
    { src: 'https://cdn.vuetifyjs.com/images/carousel/planet.jpg'},
    { src: 'https://cdn.vuetifyjs.com/images/carousel/hulk.jpg'},
  ]);

  const articles = ref([]);
  const tags = ref([]);
  const keyWordArticles = ref([]);

  const viewArticleDialog = ref(false);

  const snackbar = ref(false);
  const snackbarColor = ref('');
  const receiveMessage = ref('');
  const loading = ref(false);
  const displaySection = ref('latestArticles');

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
    await getHotTags()
  })

  async function getHotTags() {
    await axiosInstance.get('/tags/findHotTag').then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        tags.value = apiResponse.data
      }else {
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).catch((error) => {
      console.log(error)
    })
  }

  async function getArticlesByTagId(tagId) {
    loading.value = true
    await axiosInstance.get('/posts/searchByTag/' + Number(tagId)).then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        keyWordArticles.value = apiResponse.data
        loading.value = false
      } else {
        loading.value = false
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).catch(() => {
      loading.value = false
    })
  }

  async function getArticles() {
    loading.value = true
    await axiosInstance.get('/posts', {params: {page: page.value}}).then((response) => {
      const apiResponse = response.data
       if(apiResponse.result) {
         loading.value = false
         articles.value = apiResponse.data
       } else {
         loading.value = false
         snackbarColor.value = 'error'
         receiveMessage.value = apiResponse.message
         snackbar.value = true
    }
  }).catch(() => {
      loading.value = false
    })
  }

  async function searchArticles() {
    loading.value = true
    await axiosInstance.get('/posts/searchByKeyword', {params:
          {keyword: search.value}}
    ).then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        loading.value = false
        snackbarColor.value = 'success'
        keyWordArticles.value = apiResponse.data
      } else {
        loading.value = false
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).catch(() => {
      loading.value = false
    })
  }

  async function getLatestArticles() {
    loading.value = true
    await axiosInstance.get('/posts/latest').then((response) => {
      const apiResponse = response.data
       if(apiResponse.result) {
         loading.value = false
         snackbarColor.value = 'success'
         latestArticles.value = apiResponse.data
       } else {
         loading.value = false
         snackbarColor.value = 'error'
         receiveMessage.value = apiResponse.message
         snackbar.value = true
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
      const apiResponse = response.data
       if(apiResponse.result) {
         loading.value = false
         popularArticles.value = apiResponse.data
       } else {
         loading.value = false
         snackbarColor.value = 'error'
         receiveMessage.value = apiResponse.message
         snackbar.value = true
       }
    }).catch(() => {
      loading.value = false
    })
  }

  async function viewArticle(id) {
    loading.value = true
    await axiosInstance.get('/posts/' + id).then((response) => {
       const apiResponse = response.data
       if(apiResponse.result) {
         loading.value = false
         article.value = apiResponse.data
         viewArticleDialog.value = true
       } else {
         loading.value = false
         snackbarColor.value = 'error'
         receiveMessage.value = apiResponse.message
         snackbar.value = true
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

.elevation-2
  margin-top: 20px
  box-shadow: 0 2px 6px rgba(0,0,0,0.2)
.elevation-5
  box-shadow: 0 5px 15px rgba(0,0,0,0.3)
.font-weight-bold
  font-weight: bold

</style>

