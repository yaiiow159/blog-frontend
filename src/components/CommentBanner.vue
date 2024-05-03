<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import {useUserStore} from "@/stores/user";

const props = defineProps({
  comments: Array,
  articleId: Number,
});

const userStore = useUserStore()

const dialogAddComment = ref(false)
const dialogEditComment = ref(false)
const dialogReport = ref(false)
const selectReportReason = ref([
  { text: '垃圾內容', value: '垃圾內容' },
  { text: '政治風氣', value: '政治風氣' },
  { text: '低俗色情', value: '低俗色情' },
  { text: '語言不當', value: '語言不當' },
  { text: '人身攻擊', value: '人身攻擊' },
  { text: '其他', value: '其他' },
])

const emits = defineEmits(
    ['add-comment',
      'edit-comment',
      'delete-comment',
      'report-comment',]);

const comment = ref(
    {
      name: '',
      content: '',
      isReport: false,
      reason: '',
      postId: props.articleId
    }
);

const addComment = () => {
  if (comment.value) {
    emits('add-comment', comment.value);
    resetComment();
  }
};

const reportComment = comment => {
  emits('report-comment', comment);
  resetComment();
};

const editComment = comment => {
  emits('edit-comment', comment);
  resetComment();
};

const deleteComment = id => {
  emits('delete-comment', id);
  resetComment();
};

function openAddComment() {
  dialogAddComment.value = true
}

function openEditComment(commentId) {
  dialogEditComment.value = true
}

function openReport(commentId) {
  dialogReport.value = true
}

function resetComment() {
  comment.value = {
    name: '',
    content: '',
    isReport: false,
    reason: '',
    postId: props.articleId
  }
}
</script>

<template>
  <div class="d-flex flex-column" style="height: 300px; overflow-y: auto;">
    <v-btn class="mb-2" color="add" @click="openAddComment">
      <v-icon>mdi-plus</v-icon>
      <span>新增留言</span>
    </v-btn>
    <v-banner
        v-for="(comment, index) in comments"
        :key="comment.id"
        single-line
        class="mb-2"
        dense
    >
      <template v-slot:prepend>
        <v-avatar color="grey lighten-2">
          <v-icon>mdi-account-circle</v-icon>
        </v-avatar>
      </template>
      {{ comment.name }}: {{ comment.content }}
      <template v-slot:actions>
        <v-btn icon @click="openEditComment(comment.id)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon @click="openReport(comment.id)">
          <v-icon>mdi-flag</v-icon>
        </v-btn>
        <v-btn icon @click="deleteComment(comment.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-banner>

    <v-dialog v-model="dialogAddComment" persistent max-width="600px">
      <v-card class="rounded-xl pa-5">
        <v-card-title>
          <span class="text-h5">新增留言</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                  cols="12"
                  sm="6"
                  md="4"
              >
                序號:
                <v-text-field
                    v-model="comment.id"
                    label="id"
                    required
                    hidden="hidden"
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12"
                  sm="6"
                  md="4"
              >
                評論者姓名:
                <v-text-field
                    v-model="comment.name"
                    label="內容"
                    required
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12"
                  sm="6"
                  md="4"
              >
                內容:
                <v-text-field
                    v-model="comment.content"
                    label="內容"
                    required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              class="mr-4"
              color="add"
              variant="text"
              @click="addComment"
          >
            新增
          </v-btn>
          <v-btn
              class="mr-4"
              color="cancel"
              variant="text"
              @click="dialogAddComment = false"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEditComment" persistent max-width="600px">
      <v-card class="rounded-xl pa-5" :loading="dialogLoading" loading-text="加載中...">
        <v-card-title>
          <span class="text-h5">編輯留言</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                  cols="12"
                  sm="6"
                  md="4"
              >
                序號:
                <v-text-field
                    v-model="comment.id"
                    label="id"
                    required
                    hidden="hidden"
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12"
                  sm="6"
                  md="4"
              >
                評論者姓名:
                <v-text-field
                    v-model="comment.name"
                    label="內容"
                    required
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12"
                  sm="6"
                  md="4"
              >
                內容:
                <v-text-field
                    v-model="comment.content"
                    label="內容"
                    required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              class="mr-4"
              color="edit"
              variant="text"
              @click="editComment"
          >
            編輯
          </v-btn>
          <v-btn
              class="mr-4"
              color="cancel"
              variant="text"
              @click="dialogEditComment = false"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogReport" persistent max-width="600px">
      <v-card class="rounded-xl pa-5">
        <v-card-title>
          <span class="text-h5">新增留言</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                  cols="12"
                  sm="6"
                  md="4"
              >
                檢舉人姓名:
                <v-text-field
                    v-model="userStore.userInfo.username"
                    label="內容"
                    required
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12"
                  sm="6"
                  md="4"
              >
                檢舉原因:
                <v-select
                    v-model="comment.reason"
                    :items="selectReportReason"
                    density="compact"
                    label="檢舉原因"
                    required
                    variant="underlined"
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              class="mr-4"
              color="add"
              variant="text"
              @click="reportComment"
          >
            檢舉
          </v-btn>
          <v-btn
              class="mr-4"
              color="cancel"
              variant="text"
              @click="dialogReport = false"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>



<style scoped>
</style>
