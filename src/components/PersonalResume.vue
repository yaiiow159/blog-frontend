<script setup>
  const resumeLink = ref('https://pda.104.com.tw/profile/edit?vno=75e7mg5od')
  const githubLink = ref('https://github.com/yaiiow159')
  const linkedinLink = ref('https://www.linkedin.com/in/timmy-chung-46a132289/')
  const mediumLink = ref('https://medium.com/@timmychung')
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-card class="mx-auto elevation-4" max-width="100%">
        <v-card-title class="text-h5 pa-3">個人介紹</v-card-title>
        <v-card-title class="text-h5">Timmy Chung(張宏文)</v-card-title>
        <v-card-subtitle class="px-4 pt-4">
          職業: 軟體工程師 | 興趣: 旅遊/看電影/爬山/跑步/健身等...
        </v-card-subtitle>
        <v-card-text class="px-4">
          擔任軟體工程師一年半時間,平時喜歡寫寫小作品增加自己的程式撰寫能力<br>
          當前正在學習 GCP/AWS 等 雲服務相關技術,在學習過程中充實自己且感到熱忱<br>
          未來希望能朝資深工程師前進,希望能在軟體領域獲得更多成長,讓自己邁向資深工程師的道路前進
        </v-card-text>
        <v-card-actions>
          <v-btn-group :density="$vuetify.display.mobile ? 'compact' : undefined" :theme="$vuetify.display.mobile ? 'dark' : undefined">
            <v-btn target="_blank" :href="resumeLink" >瀏覽履歷</v-btn>
            <v-btn target="_blank" :href="githubLink" >GitHub</v-btn>
            <v-btn target="_blank" :href="linkedinLink">LinkedIn</v-btn>
            <v-btn target="_blank" :href="mediumLink">Medium</v-btn>
          </v-btn-group>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>

</template>

<style scoped lang="sass">

</style>
