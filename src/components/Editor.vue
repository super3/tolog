<template>
  <div class="editor">
    <div class="editor-container">
      <textarea 
        v-model="noteContent"
        placeholder="Start writing your note here..."
        @input="saveNote"
        class="note-textarea"
      ></textarea>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Editor',
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
  }
}
</script>

<style scoped>
.editor {
  height: 100vh;
  width: 100%;
}

.editor-container {
  height: 100%;
  width: 100%;
}

.note-textarea {
  width: 100%;
  height: 100%;
  padding: 20px;
  font-size: 16px;
  line-height: 1.5;
  border: none;
  resize: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow-y: auto;
  background: transparent;
}

/* Scrollbar styling with square corners */
.note-textarea::-webkit-scrollbar {
  width: 10px;
}

.note-textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.note-textarea::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 0; /* Removed border radius for square corners */
}

.note-textarea::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.note-textarea:focus {
  outline: none;
  border: none;
  box-shadow: none;
}
</style>
