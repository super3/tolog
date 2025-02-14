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
      entries: [],
      initialized: false
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
    getDefaultJournalPath() {
      const homedir = require('os').homedir();
      return path.join(homedir, 'journal');
    },
    async loadEntries() {
      let journalPath = localStorage.getItem('journalPath');
      
      // If no path is set, use default path
      if (!journalPath) {
        journalPath = this.getDefaultJournalPath();
        localStorage.setItem('journalPath', journalPath);
      }

      try {
        // Create directory if it doesn't exist
        if (!fs.existsSync(journalPath)) {
          await fs.promises.mkdir(journalPath, { recursive: true });
        }

        // Always create today's file first
        const todayFile = this.getTodayFilename()
        const todayPath = path.join(journalPath, todayFile)
        await fs.promises.writeFile(todayPath, '', { flag: 'a' }) // 'a' flag will create if not exists

        // Read all files
        const files = await fs.promises.readdir(journalPath)
        let mdFiles = files
          .filter(file => file.endsWith('.md'))
          .sort()
          .reverse()

        // Ensure today's file is included and at the top
        mdFiles = mdFiles.filter(file => file !== todayFile)
        mdFiles.unshift(todayFile)

        // Force Vue to recognize the change by creating a new array
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

        this.initialized = true

        // Force textarea resize after entries are loaded
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
  async mounted() {
    await this.loadEntries()

    // Watch for file changes only after initial load
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
  padding-bottom: 3rem;
  border-bottom: 1px solid rgba(147, 161, 161, 0.5);
}

.entry:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

h2 {
  margin-bottom: 0.5rem;
  color: #93A1A1;
  font-size: 2.5rem;
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
