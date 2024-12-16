import { createRouter, createWebHistory } from 'vue-router'
import DailyNotes from '../components/DailyNotes.vue'
import Editor from '../components/Editor.vue'

const routes = [
  {
    path: '/',
    name: 'Editor',
    component: Editor
  },
  {
    path: '/daily',
    name: 'DailyNotes',
    component: DailyNotes
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 