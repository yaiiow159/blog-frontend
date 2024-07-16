<template>
<v-breadcrumbs :items="items" divider="/">
    <template v-slot:prepend>
     

   <v-icon icon="mdi-home" size="small"></v-icon>
    </template>
    <template v-slot:item="{ item }">
        <v-breadcrumbs-item
        :title="item.text"
        :href="item.disabled ? null : item.href"
        :disabled="item.disabled"
        ></v-breadcrumbs-item>
    </template>
    </v-breadcrumbs>
</template>  
<script setup>
import { defineProps } from 'vue'

defineProps({
    items: {
        type: Array,
        required: true
    }
})
</script>

<style scoped ; lang="sass">
.v-breadcrumbs--divider
    color: #999
</style>