<script setup>
import { ref, computed } from 'vue'

const currentDate = ref(new Date())
const selectedDate = ref(new Date())

// Mock events data for visualization
const events = ref([
  { date: new Date(2026, 0, 9), color: '#d32f2f' }, // Red dot
  { date: new Date(2026, 0, 11), color: '#d32f2f' },
  { date: new Date(2026, 0, 16), color: '#f57c00' }, // Orange dot
  { date: new Date(2026, 0, 19), color: '#7b1fa2' }, // Purple dot
  { date: new Date(2026, 0, 23), color: '#f57c00' },
  { date: new Date(2026, 0, 23), color: '#7b1fa2' }, // Multiple dots
  { date: new Date(2026, 0, 30), color: '#f57c00' },
])

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

const selectDate = (date) => {
  selectedDate.value = date
}

const getEventsForDate = (date) => {
  return events.value.filter(event => isSameDate(event.date, date))
}
</script>

<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <button @click="prevMonth" class="nav-btn">&lt;</button>
      <h2 class="month-year">{{ currentMonth + 1 }}월 {{ currentYear }}</h2>
      <button @click="nextMonth" class="nav-btn">&gt;</button>
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
          'selected': isSameDate(day.date, selectedDate)
        }"
        @click="selectDate(day.date)"
      >
        <span class="day-number">{{ day.date.getDate() }}</span>
        <div class="event-dots">
          <span 
            v-for="(event, idx) in getEventsForDate(day.date)" 
            :key="idx" 
            class="dot"
            :style="{ backgroundColor: event.color }"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;
  margin: 0 auto;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #5f6368;
  cursor: pointer;
  padding: 5px 10px;
}

.month-year {
  font-size: 18px;
  font-weight: 700;
  color: #202124;
  margin: 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 10px;
}

.weekday {
  text-align: center;
  font-size: 14px;
  color: #5f6368;
  font-weight: 500;
  padding-bottom: 10px;
}

.calendar-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding-top: 5px;
  cursor: pointer;
  border-radius: 50%;
  position: relative;
  transition: background-color 0.2s;
}

.calendar-cell:hover {
  background-color: #f1f3f4;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
  z-index: 1;
}

.current-month {
  color: #202124;
}

.other-month {
  color: #dadce0;
}

.selected {
  background-color: #1a73e8; /* Default selection color, can change to green/red based on context */
  color: white;
}

.selected:hover {
  background-color: #1967d2;
}

.selected .other-month {
  color: rgba(255, 255, 255, 0.7);
}

.event-dots {
  display: flex;
  gap: 2px;
  margin-top: 4px;
  height: 6px;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

/* Custom styles for specific highlight colors seen in reference */
/* We can add dynamic classes for red/green highlights if we drive it by data */

</style>
