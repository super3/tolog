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
      // For now, just save to localStorage
      localStorage.setItem('currentNote', this.noteContent)
    }
  },
  mounted() {
    // Load saved note when component mounts
    const savedNote = localStorage.getItem('currentNote')
    if (savedNote) {
      this.noteContent = savedNote
    }
  }
}
</script>

<style scoped>
.editor {
  padding: 20px;
  height: 100vh;
}

.editor-container {
  max-width: 800px;
  margin: 0 auto;
}

.note-textarea {
  width: 100%;
  height: 500px;
  padding: 15px;
  font-size: 16px;
  line-height: 1.5;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.note-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,.25);
}
</style>
