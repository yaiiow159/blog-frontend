<template>
  <v-row class="mt-4">
    <v-col cols="12">
      <h2 class="text-h5 font-weight-bold mb-4">{{ title }}</h2>
    </v-col>
    <v-col cols="12" v-for="article in articles" :key="article.id" class="mb-4">
      <v-card elevation="2" flat>
        <v-card-title class="bg-primary text-white py-3 px-4">
          <v-avatar color="white" size="36" class="mr-2">
            <span>{{ article.authorName.charAt(0) }}</span>
          </v-avatar>
          <span class="text-h6 font-weight-bold">{{ article.title }}</span>
        </v-card-title>
        <v-card-text class="py-3 px-4">
          <div class="text-body-1 mb-2">
            <strong>類別:</strong> {{ article.categoryDto.name }}
          </div>
          <div class="text-body-1 mb-2">
            <strong>文章標籤:</strong>
            <v-chip-group>
              <v-chip
                v-for="tag in article.tagDtoList"
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
          <div class="text-body-1 mb-2">
            <strong>文章內文:</strong> {{ article.content.substring(0, 100) }}...
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn class="button-query" variant="outlined" @click="$emit('view-article', article.id)">閱讀更多</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import {defineProps, defineEmits} from 'vue';

defineProps({
  title: String,
  articles: Array
});

defineEmits(['view-article']);

</script>

<style scoped lang="scss">
.v-btn {
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity));
  text-decoration: none;
  transition: 0.2s ease-in-out;

  &:hover {
    color: var(--v-primary-base);
  }
}
</style>
