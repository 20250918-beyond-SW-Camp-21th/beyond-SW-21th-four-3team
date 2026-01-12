<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Calendar from '@/components/Calendar.vue'
import { useTodoStore } from '@/stores/todoStore'

const router = useRouter()
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

const goToDetail = (id) => {
  router.push({ name: 'todo', query: { detailId: id } })
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
          @click="goToDetail(todo.id)"
        >
          <div class="checkbox-wrapper" @click.stop="toggleTodo(todo.originalId || todo.id)">
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
.calendar-view-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  max-width: 1680px; /* Increased from 1400px by ~20% */
  margin: 1px auto; /* Reduced margin */
  padding: 0 20px;
  flex-wrap: nowrap; /* Prevent wrapping to keep side-by-side */
}

.calendar-section {
  flex: 1; /* Takes remaining space */
  min-width: 0; /* Prevent flex overflow */
}

.todo-panel {
  flex: 0 0 320px; /* Fixed width */
  min-width: 320px;
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 750px; /* Increased height */
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.task-count {
  color: #888;
  font-size: 0.9rem;
}

.todo-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  color: #aaa;
  padding: 40px 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.todo-item:hover {
  background-color: #f0f0f0;
}

.checkbox-wrapper {
  cursor: pointer;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 12px;
  transition: all 0.2s;
}

.checked-icon {
  display: none;
}

.todo-item.completed .custom-checkbox {
  background-color: #4caf50;
  border-color: #4caf50;
}

.todo-item.completed .todo-title {
  color: #aaa;
  text-decoration: line-through;
}

.todo-title {
  font-size: 1rem;
  color: #333;
}

.add-todo-placeholder {
  margin-top: 20px;
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
}

.add-btn {
  width: 100%;
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px dashed #ccc;
  border-radius: 8px;
  color: #888;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background-color: #eee;
  color: #666;
}
</style>
