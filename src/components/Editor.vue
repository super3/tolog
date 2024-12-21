<template>
  <div class="editor">
    <div class="editor-container">
      <textarea 
        v-model="noteContent"
        placeholder="Start writing your note here..."
        @input="saveNote"
        class="note-textarea"
        :style="{ 
          fontSize: fontSize + 'px',
          color: textColor
        }"
      ></textarea>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Editor',
  props: {
    fontSize: {
      type: Number,
      default: 16
    },
    textColor: {
      type: String,
      default: '#000000'
    }
  },
  data() {
    return {
      noteContent: ''
    }
  },
  methods: {
    saveNote() {
      localStorage.setItem('currentNote', this.noteContent)
    }
  },
  mounted() {
    const savedNote = localStorage.getItem('currentNote')
    if (savedNote) {
      this.noteContent = savedNote
    }
  },
  computed: {
    scrollbarColor() {
      // Convert hex to rgb with opacity
      const r = parseInt(this.textColor.slice(1, 3), 16)
      const g = parseInt(this.textColor.slice(3, 5), 16)
      const b = parseInt(this.textColor.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, 0.2)`
    }
  }
}
</script>

<style scoped>
.editor {
  height: 100vh;
  width: 100%;
  margin-top: 40px;
}

.editor-container {
  height: calc(100% - 40px);
  width: 100%;
}

.note-textarea {
  width: 100%;
  height: 100%;
  padding: 20px;
  line-height: 1.5;
  border: none;
  resize: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow-y: auto;
  background: transparent;
}

.note-textarea::placeholder {
  color: inherit;
  opacity: 0.5;
}

/* Scrollbar styling */
.note-textarea::-webkit-scrollbar,
.markdown-preview::-webkit-scrollbar {
  width: 10px;
}

.note-textarea::-webkit-scrollbar-track,
.markdown-preview::-webkit-scrollbar-track {
  background: transparent;
}

.note-textarea::-webkit-scrollbar-thumb,
.markdown-preview::-webkit-scrollbar-thumb {
  background: v-bind('scrollbarColor');
  border-radius: 0;
}

.note-textarea::-webkit-scrollbar-thumb:hover,
.markdown-preview::-webkit-scrollbar-thumb:hover {
  background: v-bind('scrollbarColor').replace('0.2', '0.3');
}

.note-textarea:focus {
  outline: none;
  border: none;
  box-shadow: none;
}
</style>
