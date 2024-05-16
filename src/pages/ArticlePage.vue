<script setup>
  import {ref, onMounted} from 'vue'
  import axiosInstance from '@/utils/request'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/stores/user'
  import Swal from "sweetalert2";

  const userStore = useUserStore()
  const router = useRouter()

  const userInfo = sessionStorage.getItem('userInfo');
  const user = JSON.parse(userInfo);

  const reportReasons = ref([
    { text: '垃圾內容', value: '垃圾內容' },
    { text: '不適合內容', value: '不適合內容' },
    { text: '其他', value: '其他' },
  ])

  const dialogViewArticle = ref(false)
  const dialogAddArticle = ref(false)
  const dialogEditArticle = ref(false)
  const dialogReportComment = ref(false)

  const dialogAddComment = ref(false)
  const dialogEditComment = ref(false)

  const snackbar = ref(false)
  const snackbarColor = ref('')
  const receiveMessage = ref('')

  const title = ref('')
  const authorName = ref('')
  const loading = ref(false)
  const imageFile = ref(null)

  const liked = ref(false)
  const disliked = ref(false)
  const bookmarked = ref(false)
  const viewsCount = ref(0)
  const bookmarksCount = ref(0)
  const likesCount = ref(0)
  const dislikesCount = ref(0)

  const comments = ref([])
  const comment = ref({
    name: '',
    content: '',
    isReport: false,
    reason: '',
  })
  const commentLiked = ref(false)
  const commentDisliked = ref(false)

  const dialogLoading = ref(false)
  const breadcrumbs = ref([
    { text: '首頁', disabled: false, href: '/home' },
    { text: '文章管理', disabled: true, href: '/articles' },
  ])
  const search = ref({
    title: '',
    authorName: '',
    status: '',
    categoryId: '',
  })
  const pageable = ref({
    totalElements: Number(0),
    totalPages: Number(0),
    pageNumber: Number(1),
    pageSize: Number(10)
  })
  const articles = ref([])
  const article = ref({
    id: Number(''),
    title: '',
    authorName: '',
    content: '',
    description: '',
    status: '',
    categoryId: Number(''),
    tagIds: [],
    image: null,
    imageUrl: ''
  })
  const tags = ref([
    {
      id: Number(''),
      name: '',
    }
  ])
  const categories = ref([
    {
      id: Number(''),
      name: '',
    }
  ])
  const headers = [
    { title: '標題', key: 'title', sortable: true },
    { title: '作者', key: 'authorName', sortable: true},
    { title: '內文', key: 'content', sortable: false },
    { title: '描述', key: 'description', sortable: false },
    { title: '狀態', key: 'status', sortable: true },
    { title: '發布時間', key: 'createDate',sortable: true },
    { title: '更新時間', key: 'updDate',sortable: true },
    { title: '操作', key: 'actions',sortable: false },
  ]
  onMounted(async () => {
    await getArticles()
    await getCategories()
    await getTags()
  })

  function resetArticle() {
    article.value = {
      id: Number(''),
      title: '',
      authorName: '',
      content: '',
      description: '',
      status: '',
      categoryId: Number(''),
      tagIds: [],
      image: null,
      imageFile: null
    }
  }

  function resetComment() {
    comment.value = {
      name: '',
      content: '',
      isReport: false,
      reason: '',
    }
  }

  function openAddComment() {
    resetComment()
    dialogAddComment.value = true
  }

  function openEditComment(id) {
    resetComment()
    getComment(id)
    dialogEditComment.value = true
  }

  async function getComment(id) {
    await axiosInstance.get("/comments/" + id).then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        comment.value = apiResponse.data
      } else {
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    })
  }

  async function handleViewArticle(id) {
    resetArticle()
    await getArticle(id)
    await getComments(id)
    await getBookmarksCount(id)
    await getLikesCount(id)
    await getViewsCount(id)
    dialogViewArticle.value = true
  }

  function handleEditArticle(id) {
    resetArticle()
    getArticle(id)
    dialogEditArticle.value = true
  }

  function handleAddArticle() {
    resetArticle()
    dialogAddArticle.value = true
  }

  async function getArticles() {
    loading.value = true;
    await axiosInstance.get("/posts", {params:
      {
        title: search.value.title,
        authorName: search.value.authorName,
        page: pageable.value.pageNumber,
        pageSize: pageable.value.pageSize
      }
    }).then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        articles.value = apiResponse.data.content
        pageable.value.totalPages = apiResponse.data.totalPages
        pageable.value.totalElements = apiResponse.data.totalElements
        pageable.value.pageNumber = apiResponse.data.number + 1
        pageable.value.pageSize = apiResponse.data.size
        loading.value = false
      } else {
        loading.value = false
        snackbarColor.value = 'error'
        snackbar.value = true
        receiveMessage.value = apiResponse.message
      }
    }).catch(() => {
      loading.value = false
    })
  }
  async function getArticle(id) {
    loading.value = true
    await axiosInstance.get('/posts/' + Number(id)).then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        loading.value = false
        article.value = apiResponse.data
        if(article.value.categoryDto){
          article.value.categoryId = article.value.categoryDto.id
        }
        if(article.value.tagDtoList){
          article.value.tagIds = article.value.tagDtoList.map((tag) => tag.id)
        }
        addReview(id)
        addView(id)
      } else {
        loading.value = false
        snackbarColor.value = 'error'
        snackbar.value = true
        receiveMessage.value = apiResponse.message
      }
    }).catch(() => {
      loading.value = false
    })
  }

  async function getTags() {
    await axiosInstance.get('/tags/findList').then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        tags.value = apiResponse.data
        console.log(tags.value)
      }else {
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).catch(() => {
    })
  }

  async function getCategories() {
    await axiosInstance.get('/categories/findList').then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        categories.value = apiResponse.data
      }else {
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.data.message
        snackbar.value = true
      }
    }).catch(() => {
    })
  }

  async function addArticle() {
    loading.value = true
    if(imageFile.value !== null && imageFile.value instanceof File) {
      await uploadImg()
    }
    await axiosInstance.post('/posts', {
      title: article.value.title,
      authorName: article.value.authorName,
      content: article.value.content,
      description: article.value.description,
      categoryId: article.value.categoryId,
      tagIds: article.value.tagIds,
    }).then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        loading.value = false
        dialogAddArticle.value = false
        receiveMessage.value = apiResponse.message
        snackbarColor.value = 'success'
        snackbar.value = true
        getArticles()
      } else {
        loading.value = false
        receiveMessage.value = apiResponse.message
        snackbarColor.value = 'error'
        snackbar.value = true
      }
    }).catch(() => {
      loading.value = false
    }).finally(() => {
      getArticles()
    })
  }

  async function editArticle() {
    loading.value = true
    if(imageFile.value !== null && imageFile.value instanceof File) {
      await uploadImg()
    }
    await axiosInstance.put('/posts/' + Number(article.value.id),{
      title: article.value.title,
      authorName: article.value.authorName,
      content: article.value.content,
      description: article.value.description,
      status: article.value.status,
      categoryId: article.value.categoryId,
      tagIds: article.value.tagIds,
    }).then((response) => {
      const apiResponse = response.data
      if(apiResponse.result) {
        loading.value = false
        dialogEditArticle.value = true
        snackbarColor.value = 'success'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      } else {
        loading.value = false
        snackbarColor.value = 'error'
        snackbar.value = true
        receiveMessage.value = apiResponse.message
      }
    }).catch(() => {
      loading.value = false
    }).finally(() => {
      getArticles()
    })
  }

  async function uploadImg() {
      loading.value = true
      await axiosInstance.post('/posts/upload', {
          file: imageFile.value,
          id: Number(article.value.id)
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
      }).catch(() => {
          loading.value = false
      })
  }

  async function deleteArticle(id) {
    loading.value = true
    await Swal.fire({
      title: '確定要刪除嗎?',
      text: "刪除後將無法復原",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.delete('/posts/' + Number(id)).then((response) => {
          const apiResponse = response.data
          if(apiResponse.result) {
            loading.value = false
            receiveMessage.value = apiResponse.message
            snackbarColor.value = 'success'
            snackbar.value = true
          }
        }).catch(() => {
          loading.value = false
        }).finally(() => {
          getArticles()
        })
      }
    })
  }

  async function getComments() {
    loading.value = true;
    await axiosInstance.get('/posts/' + Number(article.value.id) + '/comments').then((response) => {
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

  async function addReview(id) {
    await axiosInstance.post('/recentViews', {
      postId: Number(id),
      userName: user.account,
      title: article.value.title
    }).then((response) => {
      const apiResponse = response.data
      if (apiResponse.result) {
          console.log(apiResponse.data)
      } else {
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).finally(() => {
      getViewsCount(id)
    })
  }

  async function addView(id) {
    loading.value = true
    await axiosInstance.post('/posts/' + Number(id) + '/views').then((response) => {
      const apiResponse = response.data
      if (apiResponse.result) {
        loading.value = false
      } else {
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).finally(() => {
      getViewsCount(id)
    })
  }

  async function getViewsCount(id) {
    await axiosInstance.get('/posts/' + Number(id) + '/viewsCount').then((response) => {
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

  async function getBookmarksCount(id) {
    await axiosInstance.get('/posts/' + Number(id) + '/bookmarksCount').then((response) => {
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
  async function addComment() {
    loading.value = true
    await axiosInstance.post('/posts/' + Number(article.value.id) + '/comments', {
      name: user.account,
      content: comment.value.content,
      postId: Number(article.value.id)
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
    }).catch(() => {
      loading.value = false
    }).finally(() => {
      getComments(article.value.id)
    })
  }

  async function editComment() {
    loading.value = true
    await axiosInstance.put('/posts/' + Number(article.value.id) + '/comments/' + Number(comment.value.id), {
      name: comment.value.name,
      content: comment.value.content,
      postId: Number(article.value.id)
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
      getComments(article.value.id)
    })
  }

  async function handleDeleteComment(id) {
    loading.value = true
    await axiosInstance.delete('/posts/' + Number(article.value.id) + '/comments/' + Number(id)).then((response) => {
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
    }).catch().finally(() => {
      getComments()
    })
  }

  async function handleReport(comment) {
    loading.value = true
    await axiosInstance.post('/posts/' + Number(article.value.id) + '/reports', {
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
      getComments()
    })
  }

  async function likeComment(id) {
    loading.value = true
    await axiosInstance.post('/posts/' + Number(article.value.id) + '/comments/' + id + '/likes').then((response) => {
      const apiResponse = response.data
      if (apiResponse.result) {
        loading.value = false
        getComments(article.value.id)
      } else {
        loading.value = false
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).finally(() => {
      getComments(article.value.id)
    })
  }

  async function dislikeComment(id) {
    loading.value = true
    await axiosInstance.delete('/posts/' + Number(article.value.id) + '/comments/' + id + '/likes').then((response) => {
      const apiResponse = response.data
      if (apiResponse.result) {
        loading.value = false
        getComments(article.value.id)
      } else {
        loading.value = false
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).finally(() => {
      getComments(article.value.id)
    })
  }

  async function toggleBookmark() {
    loading.value = true
    if (bookmarked.value === true) {
      await axiosInstance.delete('/posts/' + Number(article.value.id) + '/bookmarks').then((response) => {
        const apiResponse = response.data
        if (apiResponse.result) {
          cancelSubscription()
        } else {
          loading.value = false
          snackbarColor.value = 'error'
          receiveMessage.value = apiResponse.message
          snackbar.value = true
        }
      }).catch(() => {
        loading.value = false
      }).finally(() => {
        bookmarked.value = false
        getBookmarksCount()
      })
    }

    if (bookmarked.value === false) {
      await axiosInstance.post('/posts/' + Number(article.value.id) + '/bookmarks').then((response) => {
        const apiResponse = response.data
        if (apiResponse.result) {
          bookmarked.value = true
          setSubscription()
        } else {
          loading.value = false
          snackbarColor.value = 'error'
          receiveMessage.value = apiResponse.message
          snackbar.value = true
        }
      }).catch(() => {
        loading.value = false
      }).finally(() => {
        getBookmarksCount()
      })
    }
  }

  async function setSubscription() {
    loading.value = true
    await axiosInstance.post('/subscript/notification', {
      postId: article.value.id,
      username: user.account,
      authorName: article.value.authorName,
      email: article.value.authorEmail
    }).then((response) => {
      const apiResponse = response.data
      if (apiResponse.result) {
        loading.value = false
        receiveMessage.value = apiResponse.message
        snackbarColor.value = 'success'
        snackbar.value = true
      } else {
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).catch(() => {
      loading.value = false
    }).finally(() => {
      loading.value = false
    })
  }

  async function cancelSubscription() {
    loading.value = true
    await axiosInstance.delete('/subscript/notification', {
      postId: article.value.id,
      username: user.account,
      authorName: article.value.authorName,
      email: article.value.authorEmail
    }).then((response) => {
      const apiResponse = response.data
      if (apiResponse.result) {
        bookmarksCount.value = apiResponse.data
      } else {
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }})
    .catch(() => {
      loading.value = false
    }).finally(() => {
      loading.value = false
    })
  }

  async function getLikesCount() {
    await axiosInstance.get('/posts/' + Number(article.value.id) + '/likesCount').then((response) => {
      const apiResponse = response.data
      if (apiResponse.result) {
        likesCount.value = apiResponse.data
      } else {
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).catch(() => {
      loading.value = false
    })
  }

  async function getDislikeCount() {
    await axiosInstance.get('/posts/' + Number(article.value.id) + '/dislikesCount').then((response) => {
      const apiResponse = response.data
      if(apiResponse.result){
        dislikesCount.value = apiResponse.data
      } else {
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).catch(() => {
    })
  }

  async function like() {
    loading.value = true
    await axiosInstance.post('/posts/' + Number(article.value.id) + '/like').then((response) => {
      const apiResponse = response.data
      if (apiResponse.result) {
        loading.value = false
        snackbarColor.value = 'success'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
        liked.value = true
      } else {
        loading.value = false
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).catch(() => {
      loading.value = false
    }).finally(() => {
        getLikesCount()
    })
  }

  async function dislike() {
    loading.value = true
    await axiosInstance.delete('/posts/' + Number(article.value.id) + '/like').then((response) => {
      const apiResponse = response.data
      if (apiResponse.result) {
        loading.value = false
        snackbarColor.value = 'success'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
        liked.value = false
      } else {
        loading.value = false
        snackbarColor.value = 'error'
        receiveMessage.value = apiResponse.message
        snackbar.value = true
      }
    }).catch(() => {
      loading.value = false
    }).finally(() => {
       getDislikeCount()
    })
  }
</script>

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
      <v-card flat>
        <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-book"></v-icon> &nbsp;
        文章管理頁面
        <v-spacer></v-spacer>
          <v-select
              class="me-2 mb-2"
              v-model="search.status"
              density="compact"
              label="儲存狀態"
              variant="solo-filled"
              hide-details
              flat
              single-line
              :items="tags"
              :item-title="item => item.name"
              :item-value="item => item.id"
          >
          </v-select>
        <v-text-field
            v-model="search.title"
            density="compact"
            label="標題"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            flat
            single-line
            hide-details
            class="me-2 mb-2"
        ></v-text-field>
          <v-text-field
              v-model="search.authorName"
              density="compact"
              label="作者名稱"
              prepend-inner-icon="mdi-magnify"
              variant="solo-filled"
              flat
              single-line
              hide-details
              class="me-2 mb-2"
          ></v-text-field>
          <v-btn color="search" class="me-2 mb-2 outlined" density="compact" size="large" @click="getArticles">查詢</v-btn>
          <v-btn color="add" class="me-2 mb-2 outlined" density="compact" size="large" @click="handleAddArticle">新增</v-btn>
          </v-card-title>
          <v-data-table :headers="headers"
                        :loading="loading"
                        loading-text="載入資料中..."
                        :items="articles"
                        :items-per-page="pageable.pageSize"
                        height="calc(100vh - 300px)">
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
              <v-btn class="me-2 mb-2 outlined" density="compact" color="search" @click="handleViewArticle(item.id)">閱讀</v-btn>
              <v-btn v-show="userStore.userInfo.username === item.authorName" class="me-2 mb-2 outlined" density="compact" color="edit" @click="handleEditArticle(item.id)">編輯</v-btn>
              <v-btn v-show="userStore.userInfo.username === item.authorName" class="me-2 mb-2 outlined" density="compact" color="delete" @click="deleteArticle(item.id)">刪除</v-btn>
          </template>
          <template v-slot:bottom>
            <div class="text-center pt-2">
              <v-pagination
                  v-model="pageable.pageNumber"
                  :length="pageable.totalPages"
                  total-visible="5"
                  @update:modelValue="getArticles"
                  rounded="circle"
                  density="compact"
              ></v-pagination>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- 新增文章 -->
      <v-dialog v-model="dialogAddArticle" persistent fullscreen>
        <v-card>
          <v-card-title>
            <span class="text-h5">新增文章</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row >
              <v-col cols="12">
              <v-file-input accept="image/jpg ,image/jpeg" v-model="article.image" label="輸入圖片"></v-file-input>
              </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                <v-select v-model="article.categoryId"
                          :items="categories"
                          :item-title="item => item.name"
                          :item-value="item => item.id"
                          label="分類">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-folder-outline"></v-icon>
                  </template>
                </v-select>
                </v-col>
                <v-col cols="6">
                <v-select multiple v-model="article.tagIds" :items="tags"
                          :item-title="item => item.name"
                          :item-value="item => item.id" label="標籤">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-tag-multiple-outline"></v-icon>
                  </template>
                </v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="article.title"
                    label="標題"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="article.authorName"
                    label="作者"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="article.description"
                    label="簡要描述"
                    required
                  ></v-textarea>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="article.content"
                    label="內容"
                    required
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="add" variant="text" @click="addArticle">新增</v-btn>
            <v-btn color="cancel" variant="text" @click="dialogAddArticle = false">取消</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 編輯文章 -->
      <v-dialog v-model="dialogEditArticle" persistent fullscreen>
        <v-card :loading="dialogLoading" loading-text="加載中...">
          <v-card-title>
            <span class="text-h5">編輯文章</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row >
                <v-col cols="12">
                  <v-file-input accept="image/jpg ,image/jpeg" v-model="article.image" label="輸入圖片">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-paperclip"></v-icon>
                    </template>
                  </v-file-input>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-select v-model="article.categoryId"
                            :items="categories"
                            item-title="name"
                            item-value="id"
                            label="分類">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-folder-outline"></v-icon>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="6">
                  <v-select multiple v-model="article.tagIds" :items="tags"
                            :item-title="item => item.name"
                            :item-value="item => item.id" label="標籤">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-tag-multiple-outline"></v-icon>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                      v-model="article.title"
                      label="標題"
                      required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                      v-model="article.authorName"
                      label="作者"
                      required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea auto-grow clearable clear-icon="mdi-close-circle" rows="3" v-model="article.content">
                    <template v-slot:label>
                      <div>內容</div>
                    </template>
                  </v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="add" variant="text" @click="editArticle">編輯</v-btn>
            <v-btn color="cancel" variant="text" @click="dialogEditArticle = false">取消</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-snackbar v-model="snackbar" :position="'fixed'" :color="snackbarColor" timeout="1000">
        {{ receiveMessage }}
      </v-snackbar>

  <!-- 文章詳情 -->
  <v-dialog v-model="dialogViewArticle" persistent fullscreen>
    <v-card>
      <v-img :src="article.imageUrl ? article.imageUrl : '../assets/pic_default.png'"
             height="300px"
             gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
             alt="暫無圖片">
        <v-card-title>{{ article.title }}</v-card-title>
      </v-img>
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
            瀏覽數：{{ viewsCount }}
          </v-chip>
          <v-chip class="ma-2">
            <v-icon left>mdi-bookmark-multiple-outline</v-icon>
            收藏數：{{ bookmarksCount }}
          </v-chip>
          <v-chip class="ma-2">
            <v-icon left>mdi-heart</v-icon>
            按讚數：{{ likesCount }}
          </v-chip>
          <v-chip class="ma-2">
              <v-icon left>mdi-heart</v-icon>
              倒讚數：{{ dislikesCount }}
          </v-chip>
         <v-btn @click="like">
            <v-icon color="green">{{ liked === true ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
          </v-btn>
          <v-btn @click="dislike">
            <v-icon color="red">{{ disliked === true ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
          </v-btn>
          <v-btn @click="toggleBookmark">
            <v-icon>{{ bookmarked === true ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}</v-icon>
          </v-btn>
          <!-- 新增留言 -->
          <v-btn @click="openAddComment">
            <v-icon>mdi-message-text-outline</v-icon>
          </v-btn>
          <!-- 關閉按鈕 -->
          <v-btn @click="dialogViewArticle = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-actions>
      <v-divider thickness="3"></v-divider>
      <v-card-text>
        <v-virtual-scroll
            height="200px"
            item-height="100"
            :items="comments"
        >
          <template v-slot:default="{ item, index }">
            <v-banner raised>
              <!-- 留言內容  如果 留言被檢舉過 顯示已被檢舉 並且屏蔽內容 -->
              <template v-slot:default>
                <div>
                  <v-avatar color="grey lighten-3" size="36" class="mr-2">
                     <span>{{ item.name.charAt(0) }}</span>
                  </v-avatar>
                </div>
                <div>{{ item.content }}</div>
              </template>
              <template v-slot:actions>
                <v-btn icon @click="likeComment(item.id)">
                  <v-icon color="red">{{ commentLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}</v-icon>
                </v-btn>
                <span>{{ item.likes }}</span>
                <v-btn icon @click="dislikeComment(item.id)">
                  <v-icon color="blue">{{ commentDisliked ? 'mdi-thumb-down' : 'mdi-thumb-down-outline' }}</v-icon>
                </v-btn>
                <span>{{ item.dislikes }}</span>
                <v-btn icon @click="openAddComment()">
                  <v-icon color="green">mdi-pencil</v-icon>
                </v-btn>
                 <v-btn icon @click="openEditComment(item.id)">
                  <v-icon color="red">mdi-edit</v-icon>
                </v-btn>
                <v-btn icon @click="handleDeleteComment(item.id)">
                  <v-icon color="red">mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-banner>
          </template>
        </v-virtual-scroll>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogAddComment" persistent max-width="400px">
      <v-card>
        <v-card-title>新增留言</v-card-title>
        <v-card-text>
          <v-text-field
              v-model="user.account"
              label="名稱"
              placeholder="請輸入名稱"
              readonly="readonly"
          ></v-text-field>
          <v-text-field
              v-model="comment.content"
              label="內容"
              placeholder="請輸入內容"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="dialogAddComment = false">取消</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="addComment">送出</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEditComment" persistent max-width="400px">
      <v-card>
        <v-card-title>編輯留言</v-card-title>
        <v-card-text>
          <v-text-field
              v-model="user.account"
              label="名稱"
              placeholder="請輸入名稱"
              readonly="readonly"
          ></v-text-field>
          <v-text-field
              v-model="comment.content"
              label="內容"
              placeholder="請輸入內容"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="dialogEditComment = false">取消</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="editComment">送出</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogReportComment" persistent max-width="400px">
      <v-card>
        <v-card-title>編輯留言</v-card-title>
        <v-card-text>
          <v-text-field
              v-model="user.account"
              label="名稱"
              placeholder="請輸入名稱"
              readonly="readonly"
          ></v-text-field>
          <v-select
              v-model="comment.reason"
              :items="reportReasons"
              label="檢舉原因"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="dialogReportComment = false">取消</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="handleReport">送出</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :absolute="true" :top="true" :color="snackbarColor" timeout="1000">
      {{ receiveMessage }}
    </v-snackbar>
  </v-dialog>
</template>

<style scoped lang="sass">
.v-btn
  transition: background-color 0.3s ease
.v-btn:hover
  background-color: var(--v-primary-base)
.stats
  display: flex
  max-width: 100%
</style>
