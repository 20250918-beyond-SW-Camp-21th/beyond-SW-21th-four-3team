<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useTodoStore } from '@/stores/todoStore'

const store = useTodoStore()

// State
const rangeType = ref('day') // 'day', 'week', 'month'
const targetDate = ref(new Date())

onMounted(() => {
    if (store.state.todos.length === 0) {
        store.fetchTodos()
    }
})

// Navigation Logic
const navigate = (direction) => {
    const date = new Date(targetDate.value)
    if (rangeType.value === 'day') {
        date.setDate(date.getDate() + direction)
    } else if (rangeType.value === 'week') {
        date.setDate(date.getDate() + (direction * 7))
    } else if (rangeType.value === 'month') {
        date.setMonth(date.getMonth() + direction)
    }
    targetDate.value = date
}

// Display Logic
const dateDisplay = computed(() => {
    const date = targetDate.value
    const y = date.getFullYear()
    const m = date.getMonth() + 1
    const d = date.getDate()

    if (rangeType.value === 'day') {
        return `${y}. ${m}. ${d}`
    } else if (rangeType.value === 'week') {
        const day = date.getDay()
        const diff = date.getDate() - day
        const start = new Date(date)
        start.setDate(diff)
        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        
        return `${start.getMonth()+1}.${start.getDate()} ~ ${end.getMonth()+1}.${end.getDate()}`
    } else if (rangeType.value === 'month') {
        return `${y}년 ${m}월`
    }
    return ''
})

// Data Logic
const stats = computed(() => {
    return store.getStatistics(rangeType.value, targetDate.value)
})

const totalTasks = computed(() => stats.value.todo + stats.value.inProgress + stats.value.done)

const pieStyle = computed(() => {
    const total = totalTasks.value
    if (total === 0) return { background: '#e0e0e0' } // Gray if empty

    const todoP = (stats.value.todo / total) * 100
    const inProgP = (stats.value.inProgress / total) * 100
    // Done takes the rest

    // Conic Gradient Logic
    // Start at 0%
    // Todo: 0% -> todoP%
    // InProgress: todoP% -> (todoP + inProgP)%
    // Done: (todoP + inProgP)% -> 100%
    
    const p1 = todoP
    const p2 = todoP + inProgP
    
    return {
        background: `conic-gradient(
            #ff9800 0% ${p1}%,
            #2196f3 ${p1}% ${p2}%,
            #4caf50 ${p2}% 100%
        )`
    }
})
</script>

<template>
  <div class="statistics-view">
    <div class="stats-card">
        <h2 class="stats-title">Work Flow Statistics</h2>
        
        <div class="controls">
            <div class="tabs">
                <button :class="{ active: rangeType === 'day' }" @click="rangeType = 'day'">Day</button>
                <button :class="{ active: rangeType === 'week' }" @click="rangeType = 'week'">Week</button>
                <button :class="{ active: rangeType === 'month' }" @click="rangeType = 'month'">Month</button>
            </div>
            
            <div class="date-nav">
                <button @click="navigate(-1)">&lt;</button>
                <span class="current-date">{{ dateDisplay }}</span>
                <button @click="navigate(1)">&gt;</button>
            </div>
        </div>

        <div class="pie-chart-container">
            <div class="pie-chart" :style="pieStyle">
                <div class="chart-center">
                    <span>Total</span>
                    <strong>{{ totalTasks }}</strong>
                </div>
            </div>
            
            <div class="legend">
                <div class="legend-item"><span class="dot todo-dot"></span> Todo ({{ stats.todo }})</div>
                <div class="legend-item"><span class="dot progress-dot"></span> 진행중 ({{ stats.inProgress }})</div>
                <div class="legend-item"><span class="dot done-dot"></span> 완료 ({{ stats.done }})</div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
@import '../styles/statisticsView.css';
</style>
