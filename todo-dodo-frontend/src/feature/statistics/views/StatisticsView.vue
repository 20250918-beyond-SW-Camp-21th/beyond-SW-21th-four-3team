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
.statistics-view {
    display: flex;
    justify-content: center;
    padding: 40px;
}

.stats-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 600px;
    text-align: center;
}

.stats-title {
    color: #333;
    margin-bottom: 2rem;
}

.controls {
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
}

.tabs {
    display: flex;
    background: #f5f5f5;
    padding: 4px;
    border-radius: 8px;
    gap: 4px;
}

.tabs button {
    border: none;
    background: transparent;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    color: #757575;
    transition: all 0.2s;
}

.tabs button.active {
    background: white;
    color: #212121;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    font-weight: 600;
}

.date-nav {
    display: flex;
    align-items: center;
    gap: 20px;
}

.date-nav button {
    border: none;
    background: transparent;
    font-size: 1.2rem;
    cursor: pointer;
    color: #757575;
    padding: 5px 10px;
}

.date-nav button:hover {
    color: #212121;
}

.current-date {
    font-size: 1.1rem;
    font-weight: 500;
    color: #424242;
    min-width: 150px; /* Prevent jumping */
}

.pie-chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
}

.pie-chart {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    /* Default background set in script */
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background 0.5s ease;
}

.chart-center {
    width: 120px;
    height: 120px;
    background: white;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.chart-center span {
    font-size: 0.9rem;
    color: #9e9e9e;
    margin-bottom: 5px;
}

.chart-center strong {
    font-size: 2rem;
    color: #212121;
}

.legend {
    display: flex;
    gap: 1.5rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #616161;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.todo-dot { background-color: #ff9800; }
.progress-dot { background-color: #2196f3; }
.done-dot { background-color: #4caf50; }
</style>
