<template>
  <v-app>
    <AppNavbar/>
    <AppSidebar />
    <v-main class="bg-transparent" :scrollable="true">
      <v-container fluid>
        <router-view :key="$route.path">
        </router-view>
      </v-container>
    </v-main>
    <AppFooter />
  </v-app>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppFooter from "@/components/AppFooter.vue";
</script>

<style scoped lang="sass">

</style>

