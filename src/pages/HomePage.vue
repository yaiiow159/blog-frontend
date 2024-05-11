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
    <v-col cols="12">
      <v-chip-group column>
          <v-chip
              v-for="tag in tags"
              :key="tag.id"
              :text="tag.name"
              class="ma-2"
              color="teal-lighten-2"
              label
              @click="getArticlesByTagId(tag.id)"
          >
          </v-chip>
      </v-chip-group>
    </v-col>
  </v-row>

  <!-- 最新文章區 -->
  <v-row>
    <v-col cols="6">
      <v-switch
          color="switch"
          inset
        v-model="openLatestArticles"
        label="最新文章"
        @change="getLatestArticles"
      ></v-switch>
    </v-col>
      <v-col v-show="openLatestArticles" cols="12">
        <v-card-title class="text-h5">最新文章區</v-card-title>
      </v-col>
      <v-col v-show="openLatestArticles" cols="4" v-for="article in latestArticles" :key="article.id">
        <v-card class="mx-auto elevation-2" max-width="400" max-height="600"  outlined :class="{'hover:elevation-6': true}">
          <v-card-subtitle class="pb-2 pa-2">{{ article.categoryDto.name }}</v-card-subtitle>
          <v-img :src="article.image ? article.image : '../assets/pic_default.jpg'" height="200px" class="white--text align-end" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)">
            <v-card-title>{{ article.title }}</v-card-title>
          </v-img>
          <v-card-subtitle class="pb-0 mt-2">{{ article.authorName }}</v-card-subtitle>
          <v-card-text class="text--primary">
            <div>{{ article.content.substring(0, 100) + '...' }}</div>
            <v-chip-group>
              <v-chip v-for="tag in article.tagDtoList" :key="tag.id" class="ma-1" color="primary" label text-color="white">
                {{ tag.name }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" text @click="viewArticle(article.id)">閱讀更多</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
  </v-row>

  <v-divider class="my-5"></v-divider>

  <!-- 熱門文章區 -->
  <v-row>
    <v-col cols="6">
      <v-switch
          color="switch"
          inset
          v-model="openPopularArticles"
          label="熱門文章"
          @change="getPopularArticles"
      ></v-switch>
    </v-col>
      <v-col v-show="openPopularArticles" cols="12">
        <v-card-title class="text-h5">熱門文章區</v-card-title>
      </v-col>
      <v-col v-show="openPopularArticles" cols="4" v-for="article in popularArticles" :key="article.id">
        <v-card class="mx-auto elevation-2" max-width="400" max-height="600" outlined :class="{'hover:elevation-6': true}">
          <v-card-subtitle class="pb-2 pa-2">{{ article.categoryDto.name }}</v-card-subtitle>
          <v-img :src="article.imageUrl ? article.imageUrl : '../assets/pic_default.jpg'" height="200px" class="white--text align-end" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)">
            <v-card-title>{{ article.title }}</v-card-title>
          </v-img>
          <v-card-subtitle class="pb-0 mt-2">{{ article.authorName }}</v-card-subtitle>
          <v-card-text class="text--primary">
            <div>{{ article.content.substring(0, 100) + '...' }}</div>
            <v-chip-group>
              <v-chip v-for="tag in article.tagDtoList" :key="tag.id" class="ma-1" color="primary" label text-color="white">
                {{ tag.name }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" text @click="viewArticle(article.id)">閱讀更多</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
  </v-row>


  <v-divider class="my-5"></v-divider>

    <v-row>
        <v-col v-if="keyWordArticles.length > 0" cols="12">
            <v-card-title class="text-h5">搜尋結果</v-card-title>
        </v-col>
        <v-col v-if="keyWordArticles.length > 0" cols="4" v-for="article in keyWordArticles" :key="article.id">
            <v-card class="mx-auto elevation-2" max-width="400" max-height="600" outlined :class="{'hover:elevation-6': true}">
                <v-card-subtitle class="pb-2 pa-2">{{ article.categoryDto.name }}</v-card-subtitle>
                <v-img :src="article.imageUrl ? article.imageUrl : '../assets/pic_default.jpg'" height="200px" class="white--text align-end" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)">
                    <v-card-title>{{ article.title }}</v-card-title>
                </v-img>
                <v-card-subtitle class="pb-0 mt-2">{{ article.authorName }}</v-card-subtitle>
                <v-card-text class="text--primary">
                    <div>{{ article.content.substring(0, 100) + '...' }}</div>
                    <v-chip-group>
                        <v-chip v-for="tag in article.tagDtoList" :key="tag.id" class="ma-1" color="primary" label text-color="white">
                            {{ tag.name }}
                        </v-chip>
                    </v-chip-group>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" text @click="viewArticle(article.id)">閱讀更多</v-btn>
                </v-card-actions>
            </v-card>
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
              <v-img
                  :src="article.imageUrl ? article.imageUrl : '../assets/no-image-available.jfif'"
                  aspect-ratio="4/3"
                  class="elevation-2"
                  @error="article.imageUrl = '../assets/no-image-available.jfif'">
              </v-img>
            </v-col>
            <v-col cols="12" md="6">
              <v-list dense>
                <v-list-item>
                    <v-list-item-title class="text-h5 font-weight-bold ma-2">標題: {{ article.title }}</v-list-item-title>
                    <v-list-item-title class="font-weight-bold mb-2">作者: {{ article.authorName }}</v-list-item-title>
                    <v-list-item-subtitle class="mb-2">作者郵箱: {{ article.authorEmail }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <div style="max-height: 600px; overflow-y: auto; margin-left: 10px">
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

  const articles = ref([]);
  const tags = ref([]);
  const keyWordArticles = ref([]);

  const openPopularArticles = ref(true);
  const openLatestArticles = ref(true);
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
    await getTags()
  })

  async function getTags() {
    await axiosInstance.get('/tags/findList').then((response) => {
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
         for (let i = 0; i < latestArticles.value.length; i++) {
           // 轉換byte[] 為 file
           latestArticles.value[i].image =
             lastArticles.value[i].imageBytes ? new File([latestArticles.value[i].imageBytes], latestArticles.value[i].imageFileName) : null
         }
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
         for (let i = 0; i < popularArticles.value.length; i++) {
           // 轉換byte[] 為 file
           popularArticles.value[i].image =
             lastArticles.value[i].imageBytes ? new File([popularArticles.value[i].imageBytes], popularArticles.value[i].imageFileName) : null
         }
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

