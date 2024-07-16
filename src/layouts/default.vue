<template>
  <v-responsive class="border rounded" min-height="100vh">
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
  </v-responsive>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from "@/components/AppFooter.vue";

</script>

<style scoped lang="sass">

</style>
