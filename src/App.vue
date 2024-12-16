<template>
  <v-app>
    <v-main style="overflow: hidden !important;">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html, body {
  overflow: hidden !important;
}

.v-application {
  overflow: hidden !important;
}

.v-main {
  overflow: hidden !important;
}

</style> 