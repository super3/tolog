<template>
  <div class="editor">
    <div v-for="entry in entries" :key="entry.date" class="entry">
      <h2>{{ formatDate(entry.date) }}</h2>
      <textarea
        v-model="entry.displayContent"
        :style="{ color: textColor }"
        @input="handleInput($event, entry)"
        @keydown="handleKeydown($event, entry)"
        placeholder="Start typing..."
        class="markdown-textarea"
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
    
    // Convert markdown bullets to visual bullets for display
    toDisplayFormat(content) {
      // Replace markdown bullet with Unicode bullet character for display only
      return content.replace(/^- /gm, '• ');
    },
    
    // Convert visual bullets back to markdown for storage
    toStorageFormat(content) {
      // Replace Unicode bullet with markdown bullet for storage
      return content.replace(/^• /gm, '- ');
    },
    
    handleInput(event, entry) {
      this.autoResize(event);
      
      // Update the storage content with markdown format
      entry.content = this.toStorageFormat(entry.displayContent);
      
      // Save the entry with markdown format
      this.saveEntry(entry);
    },
    
    handleKeydown(event, entry) {
      // If Enter key is pressed
      if (event.key === 'Enter') {
        event.preventDefault();
        
        const textarea = event.target;
        const cursorPosition = textarea.selectionStart;
        const displayContent = textarea.value;
        
        // Find the start of the current line
        let lineStart = displayContent.lastIndexOf('\n', cursorPosition - 1) + 1;
        if (lineStart === 0) lineStart = 0;
        
        // Check if the current line starts with a bullet (visual bullet in this case)
        const currentLine = displayContent.substring(lineStart, cursorPosition);
        const bulletMatch = currentLine.match(/^• (.*)$/);
        
        if (bulletMatch) {
          // If the line has a bullet and only whitespace after it, remove the line
          if (!bulletMatch[1].trim()) {
            const newDisplayContent = displayContent.substring(0, lineStart) + displayContent.substring(cursorPosition);
            entry.displayContent = newDisplayContent;
            
            // Update the storage content
            entry.content = this.toStorageFormat(newDisplayContent);
            this.saveEntry(entry);
            
            // Set cursor position to the beginning of the next line
            setTimeout(() => {
              textarea.selectionStart = lineStart;
              textarea.selectionEnd = lineStart;
            }, 0);
          } else {
            // Insert a new bullet point
            const newDisplayContent = displayContent.substring(0, cursorPosition) + '\n• ' + displayContent.substring(cursorPosition);
            entry.displayContent = newDisplayContent;
            
            // Update the storage content
            entry.content = this.toStorageFormat(newDisplayContent);
            this.saveEntry(entry);
            
            // Set cursor position after the new bullet
            setTimeout(() => {
              const newPosition = cursorPosition + 3; // \n• (3 characters)
              textarea.selectionStart = newPosition;
              textarea.selectionEnd = newPosition;
            }, 0);
          }
        } else {
          // Just insert a new line if there's no bullet
          const newDisplayContent = displayContent.substring(0, cursorPosition) + '\n' + displayContent.substring(cursorPosition);
          entry.displayContent = newDisplayContent;
          
          // Update the storage content
          entry.content = this.toStorageFormat(newDisplayContent);
          this.saveEntry(entry);
          
          // Set cursor position at the new line
          setTimeout(() => {
            const newPosition = cursorPosition + 1; // \n
            textarea.selectionStart = newPosition;
            textarea.selectionEnd = newPosition;
          }, 0);
        }
      }
      
      // Add Tab handling to create indented bullet points
      else if (event.key === 'Tab') {
        // Don't switch focus to next element
        event.preventDefault();
        
        const textarea = event.target;
        const cursorPosition = textarea.selectionStart;
        const displayContent = textarea.value;
        
        // Find the start of the current line
        let lineStart = displayContent.lastIndexOf('\n', cursorPosition - 1) + 1;
        if (lineStart === 0) lineStart = 0;
        
        // If cursor is at the beginning of a line, insert a bullet point
        if (cursorPosition === lineStart) {
          const newDisplayContent = 
            displayContent.substring(0, lineStart) + 
            '• ' + 
            displayContent.substring(cursorPosition);
          
          entry.displayContent = newDisplayContent;
          
          // Update storage content
          entry.content = this.toStorageFormat(newDisplayContent);
          this.saveEntry(entry);
          
          // Move cursor after bullet
          setTimeout(() => {
            textarea.selectionStart = lineStart + 2;
            textarea.selectionEnd = lineStart + 2;
          }, 0);
        }
        // Otherwise just insert a tab
        else {
          const newDisplayContent = 
            displayContent.substring(0, cursorPosition) + 
            '    ' + 
            displayContent.substring(cursorPosition);
          
          entry.displayContent = newDisplayContent;
          
          // Update storage content
          entry.content = this.toStorageFormat(newDisplayContent);
          this.saveEntry(entry);
          
          // Move cursor after the inserted tab
          setTimeout(() => {
            textarea.selectionStart = cursorPosition + 4;
            textarea.selectionEnd = cursorPosition + 4;
          }, 0);
        }
      }
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
        
        // Check if today's file exists and is empty
        let todayContent = ''
        if (fs.existsSync(todayPath)) {
          todayContent = await fs.promises.readFile(todayPath, 'utf8')
        }
        
        // If file is empty, initialize with bullet point
        if (!todayContent) {
          todayContent = '- '
          await fs.promises.writeFile(todayPath, todayContent, 'utf8')
        }

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
            let content = await fs.promises.readFile(filePath, 'utf8')
            
            // If content is empty, add a bullet point
            if (!content.trim()) {
              content = '- '
            }
            
            return {
              date: file,
              content: content,
              displayContent: this.toDisplayFormat(content)
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
      console.log('🚀 saveEntry is being called with:', entry, journalPath);
      
      // If content is empty or just whitespace, add a bullet point
      if (!entry.content.trim()) {
        entry.content = '- '
        entry.displayContent = '• '
      }
      
      // Always save in markdown format
      await fs.promises.writeFile(path.join(journalPath, entry.date), entry.content, 'utf8');
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
  font-family: inherit;
}

.markdown-textarea {
  white-space: pre-wrap;
}

.markdown-textarea::placeholder {
  opacity: 0.5;
}
</style>
