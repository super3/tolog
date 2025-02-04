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
export default {
  name: 'Editor',
  props: {
    textColor: String
  },
  data() {
    return {
      content: ''
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
    }
  },
  methods: {
    handleInput() {
      this.$emit('update:content', this.content)
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
