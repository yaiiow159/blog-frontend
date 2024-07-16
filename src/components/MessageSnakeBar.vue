<template>
  <v-snackbar v-model="snackbar" :timeout="timeout" :color="color">
    {{ message }}
    <template v-slot:action="{ attrs }">
      <v-btn color="white" variant="plain" v-bind="attrs" @click="snackbar = false">
        關閉
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'success'
  },
  timeout: {
    type: Number,
    default: 2000
  }
});

const snackbar = ref(false);

watch(() => props.message, (newVal) => {
  if (newVal) {
    snackbar.value = true;
  }
});
</script>

<style scoped lang="sass">
.v-snackbar__wrapper
  position: fixed
  bottom: 20px
  right: 20px
  z-index: 1000
</style>
