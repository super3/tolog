<template>
  <div class="editor">
    <h2>{{ formattedDate }}</h2>
    <textarea
      ref="textarea"
      v-model="content"
      :style="{ color: textColor }"
      @input="handleInput"
      placeholder="Start typing..."
    ></textarea>
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
      content: '',
      lastSavedContent: ''
    }
  },
  computed: {
    formattedDate() {
      const date = new Date()
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).replace(/(\d+)(?=(,\s\d+)$)/, (match) => {
        const suffix = ['th', 'st', 'nd', 'rd'][(match > 3 && match < 21) || match % 10 > 3 ? 0 : match % 10]
        return match + suffix
      })
    },
    filename() {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}_${month}_${day}.md`
    }
  },
  methods: {
    handleInput() {
      this.saveContent()
    },
    async saveContent() {
      const journalPath = localStorage.getItem('journalPath')
      if (!journalPath || this.content === this.lastSavedContent) return

      try {
        const filePath = path.join(journalPath, this.filename)
        await fs.promises.writeFile(filePath, this.content, 'utf8')
        this.lastSavedContent = this.content
        console.log('Saved to:', filePath)
      } catch (err) {
        console.error('Failed to save file:', err)
      }
    }
  },
  async mounted() {
    // Load existing content when component mounts
    const journalPath = localStorage.getItem('journalPath')
    if (journalPath) {
      try {
        const filePath = path.join(journalPath, this.filename)
        if (fs.existsSync(filePath)) {
          this.content = await fs.promises.readFile(filePath, 'utf8')
          this.lastSavedContent = this.content
        }
      } catch (err) {
        console.error('Failed to load file:', err)
      }
    }
  }
}
</script>

<style scoped>
.editor {
  height: 100%;
  padding: 40px 20px 20px 20px;
}

h2 {
  margin-bottom: 0.5rem;
  color: #93A1A1;
  font-size: 2rem;
}

textarea {
  width: 100%;
  height: calc(100% - 60px);
  background: transparent;
  border: none;
  outline: none;
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  padding: 0;
}
</style>
