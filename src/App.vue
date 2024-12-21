<template>
  <v-app>
    <v-main style="overflow-y: auto !important;">
      <div class="settings-icon" @click="toggleSettings">
        <v-icon icon="mdi-cog" size="16"></v-icon>
      </div>
      
      <!-- Settings Sidebar -->
      <v-navigation-drawer
        v-model="showSettings"
        location="right"
        temporary
        width="300"
      >
        <v-list>
          <v-list-item>
            <v-list-item-title>Settings</v-list-item-title>
            <template v-slot:append>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click="showSettings = false"
              ></v-btn>
            </template>
          </v-list-item>
          
          <v-divider></v-divider>
          
          <!-- Add your settings options here -->
          <v-list-item>
            <v-list-item-title>Theme</v-list-item-title>
          </v-list-item>
          
          <v-list-item>
            <v-list-item-title>Font Size</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      showSettings: false
    }
  },
  methods: {
    toggleSettings() {
      this.showSettings = !this.showSettings
    }
  }
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
  top: 5px;
  right: 7px;
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

.v-navigation-drawer {
  z-index: 1000;
}
</style> 