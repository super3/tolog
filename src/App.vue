<template>
  <v-app>
    <v-main style="overflow-y: auto !important;">
      <div class="settings-icon">
        <v-icon icon="mdi-cog" size="20"></v-icon>
      </div>
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

.settings-icon {
  position: fixed;
  top: 12px;
  right: 10px;
  z-index: 1000;
  cursor: pointer;
  color: #888;
}

.settings-icon:hover {
  color: #555;
}

/* Custom scrollbar styling */
.v-main::-webkit-scrollbar {
  width: 10px;
}

.v-main::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.v-main::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 0;
}

.v-main::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style> 