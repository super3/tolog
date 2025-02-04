<template>
  <div class="titlebar"></div>
  <v-app>
    <v-main style="overflow-y: auto !important;" :style="{ background: selectedTheme }">
      <div class="settings-icon" @click="toggleSettings">
        <v-icon icon="mdi-cog" size="16" :style="{ color: getTextColor }"></v-icon>
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
            <v-list-item-title>Themes</v-list-item-title>
            <template v-slot:append>
              <div class="d-flex align-center">
                <div 
                  v-for="theme in themes" 
                  :key="theme.color"
                  class="theme-circle"
                  :style="{ backgroundColor: theme.color }"
                  :class="{ 'selected': selectedTheme === theme.color }"
                  @click="selectTheme(theme.color)"
                ></div>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <router-view :font-size="fontSize" :text-color="getTextColor"></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      showSettings: false,
      fontSize: 16,
      selectedTheme: '#ffffff',
      themes: [
        { color: '#ffffff', textColor: '#000000' }, // white theme with black text
        { color: '#002B36', textColor: '#93A1A1' }, // solarized dark
        { color: '#1A237E', textColor: '#C5CAE9' }, // dark blue with light blue text
        { color: '#4A148C', textColor: '#E1BEE7' }  // dark purple with light purple text
      ]
    }
  },
  computed: {
    getTextColor() {
      const theme = this.themes.find(t => t.color === this.selectedTheme)
      return theme ? theme.textColor : '#000000'
    },
    getScrollbarColor() {
      const theme = this.themes.find(t => t.color === this.selectedTheme)
      const color = theme ? theme.textColor : '#000000'
      // Convert hex to rgb with opacity
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, 0.2)`
    }
  },
  methods: {
    toggleSettings() {
      this.showSettings = !this.showSettings
    },
    incrementFontSize() {
      if (this.fontSize < 32) {
        this.fontSize += 2
        localStorage.setItem('fontSize', this.fontSize)
      }
    },
    decrementFontSize() {
      if (this.fontSize > 8) {
        this.fontSize -= 2
        localStorage.setItem('fontSize', this.fontSize)
      }
    },
    selectTheme(color) {
      this.selectedTheme = color
      localStorage.setItem('theme', color)
    }
  },
  mounted() {
    // Load saved font size from localStorage
    const savedFontSize = localStorage.getItem('fontSize')
    if (savedFontSize) {
      this.fontSize = parseInt(savedFontSize)
    }
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      this.selectedTheme = savedTheme
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
  background: transparent;
}

.v-main::-webkit-scrollbar-thumb {
  background: v-bind('getScrollbarColor');
  border-radius: 0;
}

.v-main::-webkit-scrollbar-thumb:hover {
  background: v-bind('getScrollbarColor').replace('0.2', '0.3');
}

.v-navigation-drawer {
  z-index: 1000;
}

.theme-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin: 0 4px;
  cursor: pointer;
  border: 2px solid #ddd;
  transition: border-color 0.2s ease;
}

.theme-circle:hover {
  border-color: #666;
}

.theme-circle.selected {
  border-color: #000;
}

/* Add this to your <style> section */
.titlebar {
  -webkit-app-region: drag;
  height: 30px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: transparent;
}

/* Make all interactive elements in the header non-draggable */
.header,
.header *,
.settings-icon,
button,
input,
select,
a {
  -webkit-app-region: no-drag !important;
}
</style> 