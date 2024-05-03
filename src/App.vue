<template>
  <component v-if="userStore.isLogin" :is="Default"></component>
  <component v-else :is="LoginPage"></component>
</template>

<script setup>
import Default from "@/layouts/default.vue";
import LoginPage from "@/pages/LoginPage.vue";
import {useUserStore} from "@/stores/user";

const userStore = useUserStore()

</script>
