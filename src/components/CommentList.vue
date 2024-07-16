<!-- src/components/CommentSection.vue -->
<template>
  <v-card-text>
    <v-virtual-scroll
      height="500"
      item-height="100"
      :items="comments"
    >
      <template v-slot:default="{ item, index }">
        <v-banner raised>
          <template v-slot:default>
            <div>
              <v-avatar color="grey lighten-3" size="36" class="mr-2">
                <span>{{ item.name.charAt(0) }}</span>
              </v-avatar>
            </div>
          </template>
          <template v-slot:text>
            <v-card-text>{{ item.content }}</v-card-text>
            <v-card-text class="text-caption grey--text ml-8">{{ index + 1 }} 樓</v-card-text>
            <v-card-text class="text-caption grey--text ml-8">評論時間: {{ item.createDate }}</v-card-text>
          </template>
          <template v-slot:icon>
            <v-icon color="green">{{ item.likes > 0 ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}</v-icon>
            <span>{{ item.likes }}</span>
            <v-icon color="red">{{ item.dislikes > 0 ? 'mdi-thumb-down' : 'mdi-thumb-down-outline' }}</v-icon>
            <span>{{ item.dislikes }}</span>
          </template>
          <template v-slot:actions>
            <v-btn @click="likeComment(item.id)">
              <v-icon>{{ commentLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}</v-icon>
            </v-btn>
            <span>{{ item.likes }}</span>
            <v-btn @click="dislikeComment(item.id)">
              <v-icon>{{ commentDisliked ? 'mdi-thumb-down' : 'mdi-thumb-down-outline' }}</v-icon>
            </v-btn>
            <span>{{ item.dislikes }}</span>
            <v-btn @click="$emit('edit-comment', item.id)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn @click="$emit('report-comment', item.id)">
              <v-icon>mdi-alert-circle-outline</v-icon>
            </v-btn>
            <v-btn @click="$emit('delete-comment', item.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-banner>
      </template>
    </v-virtual-scroll>
  </v-card-text>


</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue';
import axiosInstance from '@/utils/axiosHandler';

const props = defineProps({
  postId: {
    type: Number,
    required: true
  },
  dialogOpen: {
    type: Boolean,
    default: false
  }
});

defineEmits(['edit-comment', 'report-comment', 'delete-comment']);

const comments = ref([]);
const loading = ref(false);
const commentLiked = ref(false);
const commentDisliked = ref(false);

const snackBar = reactive({
  color: '',
  message: '',
  visible: false
});

watch(() => props.postId, (newPostId) => {
  getComments(newPostId);
});

watch(() => props.dialogOpen, (newDialogOpen) => {
  if (newDialogOpen) {
    getComments(props.postId);
  }
})

onMounted(() => {
  getComments(props.postId);
});

function showSnackbar(color, message) {
  snackBar.color = color;
  snackBar.message = message;
  snackBar.visible = true;
}

async function getComments(postId) {
  await axiosInstance.get(`/posts/${postId}/comments`).then((response) => {
    loading.value = true;
    const apiResponse = response.data;
    if (apiResponse.result) {
      comments.value = apiResponse.data;
    } else {
      showSnackbar('error', apiResponse.message);
    }
  }).catch(() => {
      showSnackbar('error', '發生錯誤,請稍後再試。');
  }).finally(() => {
      loading.value = false;
    }
  );
}

async function likeComment(id) {
    try {
        const response = await axiosInstance.put(`/comments/${id}/like`);
        const apiResponse = response.data;
        if (apiResponse.result) {
            commentLiked.value = !commentLiked.value;
        } else {
            showSnackbar('error', apiResponse.message);
        }
    } catch(error) {
        showSnackbar('error', '發生錯誤,請稍後再試。' + error.message);
    }
}

async function dislikeComment(id) {
    try {
        const response = await axiosInstance.delete(`/comments/${id}/dislike`);
        const apiResponse = response.data;
        if (apiResponse.result) {
            commentDisliked.value = !commentDisliked.value;
        } else {
            showSnackbar('error', apiResponse.message);
        }
    } catch(error) {
        showSnackbar('error', '發生錯誤,請稍後再試。' + error.message);
    }
}
</script>
