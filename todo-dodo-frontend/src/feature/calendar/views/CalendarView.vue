<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Calendar from '@/components/Calendar.vue'
import { useTodoStore } from '@/stores/todoStore'

const router = useRouter()
const route = useRoute()
const store = useTodoStore()
const selectedDate = ref(new Date())
const calendarRef = ref(null)

// Initial data fetch
onMounted(() => {
  store.fetchTodos()
  
  if (route.query.date) {
    const targetDate = new Date(route.query.date)
    selectedDate.value = targetDate
    // Defer to next tick to ensure child is mounted if needed, 
    // but onMounted usually suffices for child access if not v-if'ed out.
    // However, store fetch is async but irrelevant for calendar nav.
    if (calendarRef.value) {
        calendarRef.value.setDate(targetDate)
    }
  }
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

const formatTagDate = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}.${d.getDate()}`
}

const createTodo = () => {
    // Format date as YYYY-MM-DD for query param matches ISO slice(0,10)
    // Adjust for timezone offset to ensure correct date string
    const d = new Date(selectedDate.value)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    const dateStr = d.toISOString().slice(0, 10)
    
    router.push({ name: 'todo-write', query: { date: dateStr } })
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
          :class="{ 
            'completed': todo.status === 'Done',
            'priority-high': todo.priority === 'High',
            'priority-medium': todo.priority === 'Medium',
            'priority-low': !todo.priority || todo.priority === 'Low'
          }"
          @click="goToDetail(todo.id)"
        >
          <div class="checkbox-wrapper" @click.stop="toggleTodo(todo.originalId || todo.id)">
            <div class="custom-checkbox">
              <span v-if="todo.status === 'Done'">✓</span>
            </div>
          </div>
          <div class="todo-text-content">
            <span class="todo-title">{{ todo.title }}</span>
            <div class="todo-tags">
              <span v-if="todo.repeatUntil" class="list-tag tag-routine">루틴</span>
              <span v-if="todo.allday" class="list-tag tag-allday">Allday</span>
              <span class="list-tag tag-date">{{ formatTagDate(todo.startDate) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <button class="create-todo-btn" @click="createTodo">
        + Todo 생성하기
      </button>
    </div>
    
    <div class="calendar-section">
      <Calendar ref="calendarRef" @selectDate="handleDateSelect" />
    </div>
  </div>
</template>

<style scoped>
.calendar-view-container {
  display: flex;
  justify-content: center;
  gap: 20px;
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
  align-items: flex-start; /* Align top for multiline */
  gap: 12px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 10px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.todo-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* Priority Backgrounds (Pastel) */
.priority-high {
  background-color: #FFEBEE; /* Light Red */
  border: 1px solid #FFCDD2;
}

.priority-medium {
  background-color: #FFF3E0; /* Light Orange */
  border: 1px solid #FFE0B2;
}

.priority-low {
  background-color: #F5F5F5; /* Light Grey (Default) */
  border: 1px solid #E0E0E0;
}

.checkbox-wrapper {
  cursor: pointer;
  margin-top: 2px; /* Align with text */
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
  background-color: white;
}

.todo-item.completed .custom-checkbox {
  background-color: #4caf50;
  border-color: #4caf50;
}

.todo-item.completed .todo-title {
  color: #aaa;
  text-decoration: line-through;
}

.todo-text-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.todo-title {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
  line-height: 1.4;
}

/* Tags */
.todo-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.list-tag {
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  line-height: 1.2;
}

.tag-routine {
  background-color: rgba(103, 58, 183, 0.1);
  color: #673AB7;
}

.tag-allday {
  background-color: rgba(21, 101, 192, 0.1);
  color: #1565C0;
}

.tag-date {
  background-color: rgba(0, 0, 0, 0.05);
  color: #616161;
}

/* Priority specific text adjustments if needed, but keeping it clean */
/* Create Todo Button */
.create-todo-btn {
  margin-top: 15px;
  width: 100%;
  padding: 12px;
  background-color: #212121;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.create-todo-btn:hover {
  background-color: #424242;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0,0,0,0.15);
}

.create-todo-btn:active {
  transform: translateY(0);
}
</style>
