<script setup>
import { ref,onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {useUserStore} from "@/stores/user";
import axiosInstance from "@/utils/request";
import CommentBanner from "@/components/CommentBanner.vue";

const route = useRoute()
const userStore = useUserStore()

const articleId = route.params.articleId
const article = ref({})
const loading = ref(false)
const snackbar = ref(false)
const snackbarColor = ref('')
const receiveMessage = ref('')
const viewsCount = ref(0)
const bookmarksCount = ref(0)
const comments = ref([])
onMounted(async () => {
  await addReview(articleId)
  await getComments(articleId)
  await getArticle(articleId)
  await getViewsCount(articleId)
  await getBookmarksCount(articleId)
})
async function getArticle(articleId) {
  await axiosInstance.get('/posts/' + articleId).then((response) => {
    loading.value = true
    const apiResponse = response.data
    if (apiResponse.result) {
      article.value = apiResponse.data
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

async function getComments(articleId) {
  loading.value = true;
  await axiosInstance.get('/posts/' + articleId + '/comments').then((response) => {
    const apiResponse = response.data;
    if (apiResponse.result) {
      comments.value = apiResponse.data;
      loading.value = false;
    } else {
      loading.value = false;
      snackbarColor.value = 'error';
      receiveMessage.value = apiResponse.message;
      snackbar.value = true;
    }
  }).catch(() => {
    loading.value = false;
  })
}

async function addReview() {
  await axiosInstance.post('/recentViews/', {
      postId: articleId,
      userName: userStore.userInfo.username,
  }).then((response) => {
    const apiResponse = response.data
    if (apiResponse.result) {
        console.log("addReview", apiResponse)
    } else {
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  })
}

async function getViewsCount(articleId) {
  await axiosInstance.get('/posts/' + articleId + '/viewsCount').then((response) => {
    const apiResponse = response.data
    if (apiResponse.result) {
      viewsCount.value = apiResponse.data
    } else {
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  }).catch(() => {
    loading.value = false
  })
}

async function getBookmarksCount(articleId) {
  await axiosInstance.get('/posts/' + articleId + '/bookmarksCount').then((response) => {
    const apiResponse = response.data
    if (apiResponse.result) {
      bookmarksCount.value = apiResponse.data
    } else {
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  }).catch(() => {
     loading.value = false
  })
}
async function handleAddComment(comment) {
  loading.value = true
  await axiosInstance.post('/posts/' + articleId + '/comments', {
    name: comment.value.name,
    content: comment.value.content,
  }).then((response) => {
    const apiResponse = response.data
    if (apiResponse.result) {
      loading.value = false
      loading.value = false
      snackbarColor.value = 'success'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    } else {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  }).catch(() => {
    loading.value = false
  }).finally(() => {
     getComments(articleId)
  })
}

async function handleEditComment(comment) {
  loading.value = true
  await axiosInstance.put('/posts/' + articleId + '/comments/' + Number(comment.value.id), {
    name: comment.value.name,
    content: comment.value.content,
  }).then((response) => {
    const apiResponse = response.data
    if (apiResponse.result) {
      loading.value = false
      snackbarColor.value = 'success'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    } else {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  }).finally(() => {
    getComments(articleId)
  })
}

async function handleDeleteComment(id) {
  loading.value = true
  await axiosInstance.delete('/posts/' + articleId + '/comments/' + id).then((response) => {
    const apiResponse = response.data
    if (apiResponse.result) {
      loading.value = false
      getComments(articleId)
    } else {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  })
}

async function handleReport(comment) {
  loading.value = true
  await axiosInstance.post('/posts/' + articleId + '/reports', {
    reason: comment.value.reason
  }).then((response) => {
    const apiResponse = response.data
    if (apiResponse.result) {
      loading.value = false
    } else {
      loading.value = false
      snackbarColor.value = 'error'
      receiveMessage.value = apiResponse.message
      snackbar.value = true
    }
  }).catch(() => {
    loading.value = false
  }).finally(() => {
    getComments(articleId)
  })
}
</script>

<template>
  <v-container fluid>
    <v-card>
      <v-img :src="article.imageUrl" height="300px" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)">
        <v-card-title>{{ article.title }}</v-card-title>
      </v-img>
      <v-card-subtitle>
        <span>{{ article.authorName }}</span> |
        <span>{{ article.authorEmail }}</span>
      </v-card-subtitle>
      <v-card-text>
        {{ article.description }}
        <div class="stats">
          <v-chip class="ma-2" color="teal lighten-4">
            <v-icon left>mdi-eye</v-icon>
            瀏覽數：{{ viewsCount }}
          </v-chip>
          <v-chip class="ma-2" color="teal lighten-4">
            <v-icon left>mdi-bookmark-multiple-outline</v-icon>
            收藏數：{{ bookmarksCount }}
          </v-chip>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn icon @click="toggleLike">
          <v-icon>{{ liked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
        </v-btn>
        <v-btn icon @click="toggleBookmark">
          <v-icon>{{ bookmarked ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-divider></v-divider>
    <CommentBanner :article-id="Number(articleId)" :comments="comments"
                   @add-comment="handleAddComment"
                   @edit-comment="handleEditComment"
                   @delete-comment="handleDeleteComment"
                   @report-comment="handleReport" />
    <v-snackbar v-model="snackbar" :absolute="true" :top="true" :color="snackbarColor" timeout="1000">
      {{ receiveMessage }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.stats {
  display: flex;
  align-items: center;
}
</style>
