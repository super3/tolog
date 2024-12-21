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
          
          <v-list-item>
            <v-list-item-title>Font Size</v-list-item-title>
            <template v-slot:append>
              <div class="d-flex align-center">
                <v-btn
                  icon="mdi-minus"
                  variant="text"
                  size="small"
                  @click="decrementFontSize"
                  :disabled="fontSize <= 8"
                ></v-btn>
                <span class="mx-2">{{ fontSize }}</span>
                <v-btn
                  icon="mdi-plus"
                  variant="text"
                  size="small"
                  @click="incrementFontSize"
                  :disabled="fontSize >= 32"
                ></v-btn>
              </div>
            </template>
          </v-list-item>
          
          <v-list-item>
            <v-list-item-title>Theme</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <router-view :font-size="fontSize"></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      showSettings: false,
      fontSize: 16
    }
  },
  methods: {
    toggleSettings() {
      this.showSettings = !this.showSettings
    },
    incrementFontSize() {
      if (this.fontSize < 32) {
        this.fontSize += 1
        localStorage.setItem('fontSize', this.fontSize)
      }
    },
    decrementFontSize() {
      if (this.fontSize > 8) {
        this.fontSize -= 1
        localStorage.setItem('fontSize', this.fontSize)
      }
    }
  },
  mounted() {
    // Load saved font size from localStorage
    const savedFontSize = localStorage.getItem('fontSize')
    if (savedFontSize) {
      this.fontSize = parseInt(savedFontSize)
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