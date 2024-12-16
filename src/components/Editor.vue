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
}

.editor-container {
  height: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.note-textarea {
  width: 100%;
  height: 100%;
  padding: 40px;
  font-size: 16px;
  line-height: 1.5;
  border: none;
  resize: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow-y: auto;
  background: transparent;
}

.note-textarea:focus {
  outline: none;
  border: none;
  box-shadow: none;
}
</style>
