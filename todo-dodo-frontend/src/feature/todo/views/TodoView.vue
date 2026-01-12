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
    
    const expandedTodos = []
    const DAY_MAP = {
        'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3,
        'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
    }

    todos.value.forEach(todo => {
        // 1. Normal Todo (No repeatUntil)
        if (!todo.repeatUntil) {
            const tStart = new Date(todo.startDate)
            const tEnd = new Date(todo.endDate)
            if (tStart <= endLimit && tEnd >= startLimit) {
                expandedTodos.push(todo)
            }
            return
        }

        // 2. Routine Todo (Has repeatUntil)
        const routineEnd = new Date(todo.repeatUntil)
        routineEnd.setHours(23, 59, 59, 999)
        
        // Optimize: Intersection of (ViewRange) and (RoutineRange)
        const effStart = startLimit < new Date(todo.startDate) ? new Date(todo.startDate) : startLimit
        const effEnd = endLimit < routineEnd ? endLimit : routineEnd

        if (effStart > effEnd) return // No overlap

        const current = new Date(effStart)
        current.setHours(0,0,0,0) // Normalize
        
        // Loop limit safety: 365 days max to prevent infinite loops (though overlap logic handles it)
        let safeCount = 0
        while (current <= effEnd && safeCount < 366) {
            safeCount++
            const currentDay = current.getDay()
            
            // Check match. todo.daysOfWeek should be array of strings e.g. ["MONDAY"]
            const isMatch = todo.daysOfWeek && todo.daysOfWeek.some(d => DAY_MAP[d] === currentDay)
            
            if (isMatch) {
                // Create Virtual Instance
                const instStart = new Date(current)
                const sTime = todo.startTime || '00:00:00'
                const [sH, sM] = sTime.split(':').map(Number)
                instStart.setHours(sH, sM, 0)
                
                const instEnd = new Date(current)
                const eTime = todo.endTime || '23:59:00'
                const [eH, eM] = eTime.split(':').map(Number)
                instEnd.setHours(eH, eM, 0)

                expandedTodos.push({
                    ...todo,
                    id: `${todo.id}_${current.getTime()}`,
                    originalId: todo.id,
                    startDate: instStart.toISOString(),
                    endDate: instEnd.toISOString(),
                    date: instStart.toISOString(),
                    isVirtual: true
                })
            }
            current.setDate(current.getDate() + 1)
        }
    })
    
    return expandedTodos.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
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

const goToDetail = (todo) => {
    selectedTodo.value = todo
}

const goToEdit = () => {
    if (selectedTodo.value) {
        const id = selectedTodo.value.originalId || selectedTodo.value.id
        router.push(`/todo/edit/${id}`)
    }
}

const formattedDateInfo = computed(() => {
    const todo = selectedTodo.value
    if (!todo) return null

    // Routine Logic
    // Routine Logic
    if (todo.repeatUntil) {
        const dayMap = { 'SUNDAY': '일', 'MONDAY': '월', 'TUESDAY': '화', 'WEDNESDAY': '수', 'THURSDAY': '목', 'FRIDAY': '금', 'SATURDAY': '토' }
        const dayOrder = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
        
        let daysTags = []
        if (todo.daysOfWeek && todo.daysOfWeek.length > 0) {
            // Sort by Sun-Sat order
            const sortedDays = [...todo.daysOfWeek].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
            daysTags = sortedDays.map(d => dayMap[d])
        }

        return {
            type: 'ROUTINE',
            isRoutine: true,
            daysTags: daysTags,
            until: todo.repeatUntil,
            timeRange: todo.allday ? 'All Day' : `${todo.startTime?.slice(0,5)} - ${todo.endTime?.slice(0,5)}`
        }
    }
    
    // Normal Logic
    const startDateText = new Date(todo.startDate).toLocaleDateString()
    const endDateText = new Date(todo.endDate).toLocaleDateString()
    
    let dateDisplay = startDateText
    if (todo.startDate !== todo.endDate) {
        dateDisplay = `${startDateText} ~ ${endDateText}`
    }

    const timeRange = todo.allday ? 'All Day' : `${todo.startTime?.slice(0,5)} - ${todo.endTime?.slice(0,5)}`
    
    return {
        type: 'NORMAL',
        isRoutine: false,
        dateTag: dateDisplay,
        timeTag: timeRange
    }
})

const closeDetail = () => {
    selectedTodo.value = null
}

const deleteTodo = async () => {
    if (selectedTodo.value) {
        if (confirm('삭제하시겠습니까?')) {
            const id = selectedTodo.value.originalId || selectedTodo.value.id
            await store.deleteTodo(id)
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
                @click="goToDetail(todo)"
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
            <button class="back-btn" @click="closeDetail">Back</button>
            
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
                        <div v-if="formattedDateInfo?.isRoutine" class="info-block-routine">
                            <div class="routine-tags-row">
                                <span class="tag-badge routine-badge">루틴</span>
                                <span v-for="day in formattedDateInfo.daysTags" :key="day" class="tag-badge day-tag">{{ day }}</span>
                                <span class="tag-badge until-tag">종료일: {{ formattedDateInfo.until }}</span>
                            </div>
                            <div class="routine-time-row">
                                <span class="tag-badge time-tag">{{ formattedDateInfo.timeRange }}</span>
                            </div>
                        </div>

                        <!-- Normal / All Day Case -->
                        <div v-else class="info-block-normal">
                             <div class="normal-tags-row">
                                <span class="tag-badge date-tag">{{ formattedDateInfo?.dateTag }}</span>
                                <span class="tag-badge time-tag">{{ formattedDateInfo?.timeTag }}</span>
                            </div>
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
