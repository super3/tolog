<template>
  <div class="editor">
    <div v-for="entry in entries" :key="entry.date" class="entry">
      <h2>{{ formatDate(entry.date) }}</h2>
      <textarea
        v-model="entry.content"
        :style="{ color: textColor }"
        @input="autoResize($event); saveEntry(entry)"
        placeholder="Start typing..."
      ></textarea>
    </div>
  </div>
</template>

<script>
const fs = require('fs')
const path = require('path')

export default {
  name: 'Editor',
  props: {
    textColor: String
  },
  data() {
    return {
      entries: []
    }
  },
  methods: {
    formatDate(filename) {
      const [year, month, day] = filename.replace('.md', '').split('_')
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).replace(/(\d+)(?=(,\s\d+)$)/, (match) => {
        const suffix = ['th', 'st', 'nd', 'rd'][(match > 3 && match < 21) || match % 10 > 3 ? 0 : match % 10]
        return match + suffix
      })
    },
    getTodayFilename() {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}_${month}_${day}.md`
    },
    async loadEntries() {
      const journalPath = localStorage.getItem('journalPath')
      if (!journalPath) return

      try {
        // Create today's file if it doesn't exist
        const todayFile = this.getTodayFilename()
        const todayPath = path.join(journalPath, todayFile)
        if (!fs.existsSync(todayPath)) {
          await fs.promises.writeFile(todayPath, '', 'utf8')
        }

        // Read all files
        const files = await fs.promises.readdir(journalPath)
        const mdFiles = files
          .filter(file => file.endsWith('.md'))
          .sort()
          .reverse()

        this.entries = await Promise.all(
          mdFiles.map(async file => {
            const filePath = path.join(journalPath, file)
            const content = await fs.promises.readFile(filePath, 'utf8')
            return {
              date: file,
              content: content
            }
          })
        )

        // After loading entries, resize all textareas
        this.$nextTick(() => {
          document.querySelectorAll('textarea').forEach(textarea => {
            this.autoResize({ target: textarea })
          })
        })
      } catch (err) {
        console.error('Failed to load entries:', err)
      }
    },
    async saveEntry(entry) {
      const journalPath = localStorage.getItem('journalPath')
      if (!journalPath) return

      try {
        const filePath = path.join(journalPath, entry.date)
        await fs.promises.writeFile(filePath, entry.content, 'utf8')
      } catch (err) {
        console.error('Failed to save entry:', err)
      }
    },
    autoResize(event) {
      const textarea = event.target
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  },
  mounted() {
    this.loadEntries()

    // Watch for file changes
    const journalPath = localStorage.getItem('journalPath')
    if (journalPath) {
      fs.watch(journalPath, (eventType, filename) => {
        if (filename && filename.endsWith('.md')) {
          this.loadEntries()
        }
      })
    }
  }
}
</script>

<style scoped>
.editor {
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 40px 20px 20px 20px;
  overflow-y: auto;
}

.entry {
  margin-bottom: 3rem;
}

h2 {
  margin-bottom: 0.5rem;
  color: #93A1A1;
  font-size: 1.5rem;
}

textarea {
  width: 100%;
  min-height: 1.5em;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  padding: 0;
  overflow: hidden;
}
</style>
