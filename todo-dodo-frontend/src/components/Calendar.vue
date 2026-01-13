<script setup>
import { ref, computed } from 'vue'
import { useTodoStore } from '@/stores/todoStore'

const store = useTodoStore()
const currentDate = ref(new Date())
const selectedDate = ref(new Date())

// Use events from store (synced with all other views)
const events = store.eventsForCalendar

const weekDays = ['일', '월', '화', '수', '목', '금', '토']

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

const calendarDays = computed(() => {
  const days = []
  
  // Previous month padding
  const prevMonthDays = new Date(currentYear.value, currentMonth.value, 0).getDate()
  for (let i = firstDayOfMonth.value - 1; i >= 0; i--) {
    days.push({
      date: new Date(currentYear.value, currentMonth.value - 1, prevMonthDays - i),
      isCurrentMonth: false
    })
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth.value; i++) {
    days.push({
      date: new Date(currentYear.value, currentMonth.value, i),
      isCurrentMonth: true
    })
  }
  
  // Next month padding (to fill 6 rows - 42 cells)
  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(currentYear.value, currentMonth.value + 1, i),
      isCurrentMonth: false
    })
  }
  
  return days
})

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const isSameDate = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

const realToday = new Date()

const emit = defineEmits(['selectDate'])

const selectDate = (date) => {
  selectedDate.value = date
  emit('selectDate', date)
}

const getEventsForDate = (date) => {
  return events.value.filter(event => isSameDate(event.date, date))
}

const getPriorityClass = (priority) => {
  const p = priority ? priority.toLowerCase() : 'low'
  if (p === 'high') return 'priority-high'
  if (p === 'medium') return 'priority-medium'
  return 'priority-low'
}
</script>

<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <button @click="prevMonth" class="nav-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="arrow-icon">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2 class="month-year">{{ currentMonth + 1 }}월 {{ currentYear }}</h2>
      <button @click="nextMonth" class="nav-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="arrow-icon">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    
    <div class="calendar-grid">
      <div v-for="day in weekDays" :key="day" class="weekday">
        {{ day }}
      </div>
      
      <div 
        v-for="(day, index) in calendarDays" 
        :key="index"
        class="calendar-cell"
        :class="{ 
          'current-month': day.isCurrentMonth,
          'other-month': !day.isCurrentMonth,
          'selected': isSameDate(day.date, selectedDate),
          'is-today': isSameDate(day.date, realToday)
        }"
        @click="selectDate(day.date)"
      >
        <span class="day-number">{{ day.date.getDate() }}</span>
        <div class="todo-list-cell">
          <div 
            v-for="event in getEventsForDate(day.date).slice(0, 3)" 
            :key="event.id" 
            class="todo-chip"
            :class="[
              getPriorityClass(event.priority),
              { 'is-done': event.status === 'Done' }
            ]"
          >
            <span class="chip-title">{{ event.title }}</span>
          </div>
          <div v-if="getEventsForDate(day.date).length > 3" class="overflow-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-container {
  width: 100%;
  height: 750px; /* Increased height */
  /* max-width removed to fill container */
  background: white;
  border-radius: 20px;
  padding: 30px; /* Increased padding */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
  flex-shrink: 0;
}

/* ... existing nav-btn, month-year ... */

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: auto repeat(6, 1fr); /* Header row + 6 weeks */
  /* Remove gaps for strict grid lines */
  row-gap: 0;
  column-gap: 0;
  flex: 1; /* Fill remaining height */
  height: 100%;
  /* Add outer borders if needed, or handle via cells */
  border-top: 1px solid #e0e0e0;
  border-left: 1px solid #e0e0e0;
}

.weekday {
  text-align: center;
  font-size: 14px;
  color: #5f6368;
  font-weight: 500;
  padding: 10px 0; /* Adjust padding */
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa; /* Slight header background */
}

.calendar-cell {
  /* aspect-ratio removed to fill height */
  display: flex;
  flex-direction: column;
  align-items: center; /* Center day number, but chips align left */
  justify-content: start;
  padding: 2px; /* Use generic padding */
  cursor: pointer;
  border-radius: 0; /* Remove radius for grid look */
  position: relative;
  transition: background-color 0.2s;
  height: 100%;
  overflow: hidden; /* Hide overflow */
  
  /* Borders for grid */
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.calendar-cell:hover {
  background-color: #f1f3f4;
}

.day-number {
  font-size: 12px;
  font-weight: 500;
  z-index: 1;
  margin-bottom: 2px;
  margin-top: 4px; /* Reduced from 12px */
  width: 24px;
  height: 24px;
  border-radius: 50%;
  
  /* Flexbox for centering text in circle */
  display: flex;
  justify-content: center;
  align-items: center;
}

.is-today .day-number {
  background-color: #9575CD; /* Darker pastel purple */
  color: white;
  font-weight: 600;
}

.current-month {
  color: #3c4043;
}

.other-month {
  color: #dadce0;
  background-color: #fcfcfc; /* Slight tint for other month cells */
}

.selected {
  background-color: #D1E3FF; /* Pastel Blue */
  color: #174ea6; /* Darker Blue for contrast */
}

.selected:hover {
  background-color: #c2d7ff;
}

.selected .other-month {
  color: rgba(23, 78, 166, 0.5);
}

.todo-list-cell {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: hidden; /* Hide scrollbar */
  max-height: 100%;
  padding: 0 2px;
}

/* Scrollbar hiding for cleaner look */
.todo-list-cell::-webkit-scrollbar {
    display: none;
}

.todo-chip {
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
  width: 100%;
  text-align: left;
  line-height: 1.2;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.overflow-indicator {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 3px;
  gap: 3px;
}

.dot {
  width: 4px;
  height: 4px;
  background-color: #9C27B0; /* Purple */
  border-radius: 50%;
}

/* Priority Colors */
.priority-high {
  background-color: #ef5350; /* Red */
}

.priority-medium {
  background-color: #ff9800; /* Orange */
}

.priority-low {
  background-color: #9e9e9e; /* Gray */
}

/* Done State */
.is-done {
  text-decoration: line-through;
  opacity: 0.6;
  background-color: #b0bec5; /* Muted gray for done */
}

/* Custom styles for specific highlight colors seen in reference */
/* We can add dynamic classes for red/green highlights if we drive it by data */

.nav-btn {
  background-color: #424242; /* Dark Gray */
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 0;
}

.nav-btn:hover {
  background-color: #616161;
}

.arrow-icon {
  width: 20px;
  height: 20px;
  color: white; /* Icon color */
}
</style>
