<template>
  <component :is="checkComponent"></component>
</template>

<script setup>
import Default from "@/layouts/default.vue";
import LoginPage from "@/pages/LoginPage.vue";
import {useUserStore} from "@/stores/user";

const userStore = useUserStore()
const checkComponent = userStore.userInfo.token ? Default : LoginPage

</script>
