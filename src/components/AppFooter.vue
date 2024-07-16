<script setup>
  import { ref } from 'vue'

  const value = ref(1)

  function goTo(url) {
    window.open(url, '_blank')
  }
</script>

<template>
  <v-bottom-navigation
    v-model="value"
    grow
  >
    <v-btn class="social-link" @click="goTo('https://github.com')">
      <v-icon>mdi-github</v-icon>GitHub
    </v-btn>
    <v-btn class="social-link" @click="goTo('https://linkedin.com')">
      <v-icon>mdi-linkedin</v-icon>LinkedIn
    </v-btn>
    <v-btn class="social-link" @click="goTo('https://stackoverflow.com')">
      <v-icon>mdi-stack-overflow</v-icon>Stack Overflow
    </v-btn>
    <v-btn class="social-link" @click="goTo('https://medium.com')">
      <v-icon>mdi-typewriter</v-icon>Medium
    </v-btn>
  </v-bottom-navigation>
</template>

<style scoped lang="sass">
  .social-link :deep(.v-icon)
    color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
    text-decoration: none
    transition: .2s ease-in-out
    &:hover
      color: var(--v-primary-base)
</style>
