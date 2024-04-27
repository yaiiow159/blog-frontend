<script setup>

</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <h1 class="display-2 mb-3">404</h1>
        <h2 class="subtitle-1 mb-5">找不到訪問頁面。</h2>
        <v-btn color="primary" large @click="$router.push('/')">
          回到首頁
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="sass">

</style>
