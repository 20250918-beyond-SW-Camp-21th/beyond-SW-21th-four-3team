<script setup>
import { onMounted, computed } from 'vue'
import { useTodoStore } from '@/stores/todoStore'

const store = useTodoStore()

// If data isn't loaded yet, fetch it (or rely on other views having loaded it, but better safe)
onMounted(() => {
    if (store.state.todos.length === 0) {
        store.fetchTodos()
    }
})

const stats = store.statistics
</script>

<template>
  <div class="statistics-view">
    <div class="stats-card">
        <h2 class="stats-title">Work Flow Statistics</h2>
        
        <!-- Simple CSS Pie Chart representation -->
        <div class="pie-chart-container">
            <div class="pie-chart">
                <div class="segment segment-todo"></div>
                <div class="segment segment-inprogress"></div>
                <div class="segment segment-done"></div>
                <div class="chart-center">
                    <span>Total</span>
                    <strong>{{ stats.todo + stats.inProgress + stats.done }}</strong>
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
    background: conic-gradient(
        #4caf50 0% 50%,        /* Done (50%) */
        #2196f3 50% 70%,       /* In Progress (20%) */
        #ff9800 70% 100%       /* Todo (30%) */
    );
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Mock segments for visual - in real app would use dynamic gradient based on data */

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

.legend {
    display: flex;
    gap: 1.5rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
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
