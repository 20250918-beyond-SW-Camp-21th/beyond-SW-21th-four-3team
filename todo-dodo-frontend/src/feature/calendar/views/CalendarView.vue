<script setup>
import { ref, computed, onMounted } from 'vue'
import Calendar from '@/components/Calendar.vue'
import { useTodoStore } from '@/stores/todoStore'

const store = useTodoStore()
const selectedDate = ref(new Date())

// Initial data fetch
onMounted(() => {
  store.fetchTodos()
})

const handleDateSelect = (date) => {
  selectedDate.value = date
}

// Get todos for selected date from store
const currentTodos = computed(() => {
  return store.getTodosByDate(selectedDate.value)
})

const toggleTodo = (id) => {
  store.toggleTodoStatus(id)
}

const formatDate = (date) => {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}
</script>

<template>
  <div class="calendar-view-container">
    <div class="todo-panel">
      <div class="panel-header">
        <h3>{{ formatDate(selectedDate) }}</h3>
        <span class="task-count">{{ currentTodos.length }} Tasks</span>
      </div>
      
      <div class="todo-list">
        <div v-if="currentTodos.length === 0" class="empty-state">
          일정이 없습니다.
        </div>
        
        <div 
          v-for="todo in currentTodos" 
          :key="todo.id" 
          class="todo-item"
          :class="{ 'completed': todo.status === 'Done' }"
        >
          <div class="checkbox-wrapper" @click="toggleTodo(todo.id)">
            <div class="custom-checkbox">
              <span v-if="todo.status === 'Done'">✓</span>
            </div>
          </div>
          <span class="todo-title">{{ todo.title }}</span>
        </div>
      </div>
      
      <!-- Add Button Removed as per request -->
    </div>
    
    <div class="calendar-section">
      <Calendar @selectDate="handleDateSelect" />
    </div>
  </div>
</template>

<style scoped>
@import '../styles/calendarView.css';
</style>
