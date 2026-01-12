<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTodoStore } from '@/stores/todoStore'

const router = useRouter()
const store = useTodoStore()

const todos = computed(() => store.state.todos)
const selectedTodo = ref(null)

// --- Period Filtering Logic ---
const viewMode = ref('WEEKLY') // 'WEEKLY' | 'MONTHLY'
const currentDate = ref(new Date())

// Helper: Get Week Range (Sun-Sat)
const getWeekRange = (date) => {
    const start = new Date(date)
    const day = start.getDay()
    start.setDate(start.getDate() - day)
    start.setHours(0, 0, 0, 0)
    
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    
    return { start, end }
}

// Helper: Get Month Range
const getMonthRange = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    end.setHours(23, 59, 59, 999)
    return { start, end }
}

const currentPeriodLabel = computed(() => {
    const y = currentDate.value.getFullYear()
    const m = currentDate.value.getMonth() + 1
    
    if (viewMode.value === 'MONTHLY') {
        return `${y}.${m.toString().padStart(2, '0')}`
    } else {
        // Weekly: Show e.g., "1월 2째주" or Range
        // Simple approach: YYYY.MM (Week W) or just Date Range
        // Let's go with "YYYY.MM Week N" for simplicity or Date Range if preferred.
        // User asked for simple and clear. "YYYY.MM" is often enough context if we show the week.
        // Let's try "YYYY.MM - W{n}" or just the simple date range "MM.DD ~ MM.DD"
        const { start, end } = getWeekRange(currentDate.value)
        return `${start.getMonth()+1}.${start.getDate()} ~ ${end.getMonth()+1}.${end.getDate()}`
    }
})

const filteredTodos = computed(() => {
    if (!todos.value) return []
    
    let startLimit, endLimit
    
    if (viewMode.value === 'WEEKLY') {
        const range = getWeekRange(currentDate.value)
        startLimit = range.start
        endLimit = range.end
    } else {
        const range = getMonthRange(currentDate.value)
        startLimit = range.start
        endLimit = range.end
    }
    
    return todos.value.filter(todo => {
        const tStart = new Date(todo.startDate)
        const tEnd = new Date(todo.endDate)
        // Check overlap: (StartA <= EndB) and (EndA >= StartB)
        return tStart <= endLimit && tEnd >= startLimit
    })
})

const movePeriod = (direction) => {
    const date = new Date(currentDate.value)
    if (viewMode.value === 'WEEKLY') {
        date.setDate(date.getDate() + (direction * 7))
    } else {
        date.setMonth(date.getMonth() + direction)
    }
    currentDate.value = date
}

const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'WEEKLY' ? 'MONTHLY' : 'WEEKLY'
}
// ------------------------------

onMounted(() => {
    store.fetchTodos()
})

const goToWrite = () => {
    router.push('/todo/write')
}

const goToDetail = (id) => {
    selectedTodo.value = store.state.todos.find(t => t.id === id)
}

const goToEdit = () => {
    if (selectedTodo.value) {
        router.push(`/todo/edit/${selectedTodo.value.id}`)
    }
}

const formattedDateInfo = computed(() => {
    const todo = selectedTodo.value
    if (!todo) return null

    // Routine Logic
    if (todo.repeatUntil) {
        // Mocking day parsing for now since backend returns list of Enums or indices
        // Assuming todo.daysOfWeek is available, otherwise falling back
        const days = todo.daysOfWeek ? todo.daysOfWeek.join(', ') : 'Daily'
        const until = new Date(todo.repeatUntil).toLocaleDateString()
        const timeRange = todo.allday ? 'All Day' : `${todo.startTime?.slice(0,5)} - ${todo.endTime?.slice(0,5)}`
        
        return {
            type: 'ROUTINE',
            text: `Every ${days} until ${until}`,
            subText: timeRange
        }
    }

    // Allday Logic
    if (todo.allday) {
        return {
            type: 'ALLDAY',
            text: 'All Day',
            subText: new Date(todo.startDate).toLocaleDateString()
        }
    }

    // Normal Logic
    const startDateText = new Date(todo.startDate).toLocaleDateString()
    const endDateText = new Date(todo.endDate).toLocaleDateString()
    
    let dateDisplay = startDateText
    if (todo.startDate !== todo.endDate) {
        dateDisplay = `${startDateText} ~ ${endDateText}`
    }

    const timeRange = `${todo.startTime?.slice(0,5)} - ${todo.endTime?.slice(0,5)}`
    
    return {
        type: 'NORMAL',
        text: dateDisplay,
        subText: timeRange
    }
})

const closeDetail = () => {
    selectedTodo.value = null
}

const deleteTodo = async () => {
    if (selectedTodo.value) {
        if (confirm('삭제하시겠습니까?')) {
            await store.deleteTodo(selectedTodo.value.id)
            selectedTodo.value = null
        }
    }
}
</script>

<template>
  <div class="todo-view">

    <div class="todo-list-container" :class="{ 'list-expanded': !selectedTodo }">
        <div class="header-section">
            <div class="header-top">
                <h2>TODO</h2>
                <div class="period-controls">
                    <button @click="movePeriod(-1)" class="nav-btn">‹</button>
                    <span class="period-label">{{ currentPeriodLabel }}</span>
                    <button @click="movePeriod(1)" class="nav-btn">›</button>
                </div>
                <!-- <button @click="goToWrite" class="write-btn">+</button> -->
            </div>
            
            <div class="header-bottom">
                 <div class="view-toggles">
                    <span 
                        class="toggle-opt" 
                        :class="{ active: viewMode === 'WEEKLY' }"
                        @click="viewMode = 'WEEKLY'"
                    >Weekly</span>
                    <span class="divider">|</span>
                    <span 
                        class="toggle-opt" 
                        :class="{ active: viewMode === 'MONTHLY' }"
                        @click="viewMode = 'MONTHLY'"
                    >Monthly</span>
                </div>
                <button @click="goToWrite" class="write-btn-small">+</button>
            </div>
        </div>
        
        <div class="todo-list">
            <div 
                v-for="todo in filteredTodos" 
                :key="todo.id" 
                class="todo-item"
                :class="{ 'active': selectedTodo?.id === todo.id, 'completed': todo.status === 'Done' }"
                @click="goToDetail(todo.id)"
            >
                <div class="todo-item-left">
                    <!-- Priority Indicator -->
                    <div 
                        class="priority-indicator" 
                        :class="{
                            'priority-high': todo.priority === 'High',
                            'priority-medium': todo.priority === 'Medium',
                            'priority-low': !todo.priority || todo.priority === 'Low'
                        }"
                    ></div>
                    <span class="todo-title">{{ todo.title }}</span>
                </div>
                
                <div class="checkbox-wrapper" @click.stop="store.toggleTodoStatus(todo.id)">
                    <div class="custom-checkbox">
                        <span v-if="todo.status === 'Done'">✔</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="detail-container">
        <div v-if="selectedTodo" class="detail-content">
            <button class="back-btn" @click="closeDetail">←</button>
            
            <div class="detail-body">
                <!-- Priority Display moved to info-header -->
                
                <div class="info-group">
                    <div class="info-header">
                        <h1 class="info-title">{{ selectedTodo.title }}</h1>
                        
                        <div class="priority-display-inline">
                            <div 
                                class="priority-dot-inline"
                                :class="{
                                    'priority-high': selectedTodo.priority === 'High',
                                    'priority-medium': selectedTodo.priority === 'Medium',
                                    'priority-low': !selectedTodo.priority || selectedTodo.priority === 'Low'
                                }"
                            ></div>
                            <span 
                                class="priority-text-inline"
                                :class="{
                                    'text-high': selectedTodo.priority === 'High',
                                    'text-medium': selectedTodo.priority === 'Medium',
                                    'text-low': !selectedTodo.priority || selectedTodo.priority === 'Low'
                                }"
                            >{{ selectedTodo.priority || 'Low' }}</span>
                        </div>
                    </div>
                    
                    <div class="date-time-row">
                        <!-- Routine Case -->
                        <div v-if="formattedDateInfo?.type === 'ROUTINE'" class="info-block">
                            <div class="info-text">{{ formattedDateInfo.text }}</div>
                            <div class="info-subtext large-time">{{ formattedDateInfo.subText }}</div>
                        </div>

                        <!-- All Day Case -->
                        <div v-else-if="formattedDateInfo?.type === 'ALLDAY'" class="info-block">
                            <div class="info-text highlight">{{ formattedDateInfo.text }}</div>
                            <div class="info-subtext large-time">{{ formattedDateInfo.subText }}</div>
                        </div>

                        <!-- Normal Case -->
                        <div v-else class="info-block normal-date">
                            <div class="info-text">{{ formattedDateInfo?.text }}</div>
                            <div class="info-subtext large-time">{{ formattedDateInfo?.subText }}</div>
                        </div>
                    </div>


                    
                    <div class="action-buttons">
                        <button class="edit-btn" @click="goToEdit">Edit</button>
                        <button class="delete-btn" @click="deleteTodo">Delete</button>
                    </div>
                </div>
            </div>
            
            <div class="content-area">
                <!-- Label removed -->
                <p class="content-text">{{ selectedTodo.content || 'No content provided.' }}</p>
            </div>
            
        </div>
        <div v-else class="empty-detail">
            <p>좌측 목록에서 할 일을 선택해주세요.</p>
        </div>
    </div>
  </div>
</template>

<style scoped>
@import '../styles/todoView.css';
</style>
