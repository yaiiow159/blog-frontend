<template>
  <v-app>
    <AppNavbar/>
    <v-main class="bg-transparent main-content" :scrollable="true">
      <v-container :fluid="true">
        <router-view>
        </router-view>
      </v-container>
    </v-main>
    <AppFooter />
  </v-app>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from "@/components/AppFooter.vue";
</script>

<style scoped lang="sass">
  .main-content
    // 距離左邊300px
    padding-left: 300px

  @media only screen and (max-width: 600px)
    .main-content
      padding-left: 10px
</style>
