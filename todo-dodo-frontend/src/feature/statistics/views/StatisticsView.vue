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

const totalTasks = computed(() => stats.value.todo + stats.value.done)

const completionRate = computed(() => {
    const total = totalTasks.value
    if (total === 0) return 0
    return Math.round((stats.value.done / total) * 100)
})

// Circular Progress Logic
const radius = 60
const circumference = 2 * Math.PI * radius
const strokeDashoffset = computed(() => {
    const progress = completionRate.value / 100
    return circumference * (1 - progress)
})

// Trend Data Logic
const trendData = computed(() => {
    return store.getTrendData(rangeType.value, targetDate.value)
})

const maxTrendValue = computed(() => {
    if (!trendData.value || trendData.value.length === 0) return 0
    // For Day view (Priority), value is 'count'
    // For Week/Month, value is 'total' (todo + done) or we can stack them using max total
    return Math.max(...trendData.value.map(d => d.total !== undefined ? d.total : d.count))
})

const pieStyle = computed(() => {
    const total = totalTasks.value
    if (total === 0) return { background: '#e0e0e0' } // Gray if empty

    const todoP = (stats.value.todo / total) * 100
    // Done takes the rest

    // Conic Gradient Logic: Todo (0% -> todoP%), Done (todoP% -> 100%)
    
    return {
        background: `conic-gradient(
            #ff9800 0% ${todoP}%,
            #4caf50 ${todoP}% 100%
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

        <div class="dashboard-grid">
            <!-- Card 1: Bar Chart (Trend) -->
            <div class="stat-card bar-card">
                <div class="bar-chart-container">
                    <div v-if="trendData.length === 0" class="no-data">No Data</div>
                    <div v-else class="bars-wrapper" :class="rangeType">
                        <div v-for="(item, index) in trendData" :key="index" class="bar-group">
                            <div class="bar-column">
                                <span class="bar-value" v-if="(item.total || item.count) > 0">{{ item.total || item.count }}</span>
                                
                                <div v-if="rangeType === 'day'" 
                                     class="bar priority-bar"
                                     :style="{ height: (item.count / maxTrendValue * 100) + '%', backgroundColor: item.color }">
                                </div>

                                <div v-else class="bar-stack" :style="{ height: (item.total / maxTrendValue * 100) + '%' }">
                                    <div class="bar-segment todo" :style="{ flex: item.todo, background: '#ff9800' }"></div>
                                    <div class="bar-segment done" :style="{ flex: item.done, background: '#4caf50' }"></div>
                                </div>
                            </div>
                            <span class="bar-label">{{ item.label }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card 2: Pie Chart (Distribution) -->
            <div class="stat-card pie-card">
                <div class="pie-chart-container">
                    <!-- Just the Pie Chart Group -->
                    <div class="pie-chart-group">
                        <div class="pie-chart" :style="pieStyle">
                            <div class="chart-center">
                                <span>Total</span>
                                <strong>{{ totalTasks }}</strong>
                            </div>
                        </div>
                        
                        <div class="legend">
                            <div class="legend-item"><span class="dot todo-dot"></span> Todo ({{ stats.todo }})</div>
                            <div class="legend-item"><span class="dot done-dot"></span> 완료 ({{ stats.done }})</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card 3: Completion Rate -->
            <div class="stat-card rate-card">
                <div class="progress-ring-container">
                    <svg class="progress-ring" width="160" height="160">
                        <circle
                            class="progress-ring__circle--bg"
                            stroke="#e6e6e6"
                            stroke-width="12"
                            fill="transparent"
                            r="60"
                            cx="80"
                            cy="80"
                        />
                        <circle
                            class="progress-ring__circle"
                            stroke="#4caf50"
                            stroke-width="12"
                            fill="transparent"
                            r="60"
                            cx="80"
                            cy="80"
                            :style="{ strokeDasharray: `${circumference} ${circumference}`, strokeDashoffset: strokeDashoffset }"
                        />
                    </svg>
                    <div class="progress-text">
                        <span class="rate-value">{{ completionRate }}%</span>
                        <span class="rate-label">Completion</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
@import '../styles/statisticsView.css';
</style>
