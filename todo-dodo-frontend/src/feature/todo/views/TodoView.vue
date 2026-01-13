<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTodoStore } from '@/stores/todoStore'

const router = useRouter()
const route = useRoute()
const store = useTodoStore()

const todos = computed(() => store.state.todos)
const selectedTodo = ref(null)

// --- Period Filtering Logic ---
const viewMode = ref('WEEKLY') // 'WEEKLY' | 'MONTHLY'
const currentDate = ref(new Date())
const showDeleteModal = ref(false)

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
    
    // Simple filter: Check if todo overlaps with the view range
    return todos.value.filter(todo => {
        const tStart = new Date(todo.startDate)
        const tEnd = new Date(todo.endDate)
        
        // Normalize time for date comparison
        tStart.setHours(0,0,0,0)
        tEnd.setHours(23,59,59,999)
        
        return tStart <= endLimit && tEnd >= startLimit
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
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

onMounted(async () => {
    await store.fetchTodos()
    
    // Check for deep link to detail
    if (route.query.detailId) {
        const targetId = Number(route.query.detailId)
        const found = store.state.todos.find(t => t.id === targetId)
        if (found) {
            selectedTodo.value = found
            // Also adjust view buffer/date if needed to show this todo?
            // User just wants to see the detail, which is an overlay. 
            // So simply setting selectedTodo is enough to open the panel.
        }
    }
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

const formatListDate = (dateStr) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}.${d.getDate()}`
}

const closeDetail = () => {
    selectedTodo.value = null
}

const deleteTodo = async () => {
    if (selectedTodo.value) {
        // Routine Check
        if (selectedTodo.value.repeatUntil) {
            showDeleteModal.value = true
            return
        }

        if (confirm('삭제하시겠습니까?')) {
            const id = selectedTodo.value.originalId || selectedTodo.value.id
            await store.deleteTodo(id)
            selectedTodo.value = null
        }
    }
}

const handleDeleteOption = async (option) => {
    showDeleteModal.value = false
    if (!selectedTodo.value) return

    if (option === 'one') {
         const id = selectedTodo.value.originalId || selectedTodo.value.id
         await store.deleteTodo(id)
         selectedTodo.value = null
    } else if (option === 'all') {
        await store.deleteRoutine(selectedTodo.value)
        selectedTodo.value = null
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
                    <div class="todo-text-content">
                        <span class="todo-title">{{ todo.title }}</span>
                        <div class="todo-tags">
                            <span v-if="todo.repeatUntil" class="list-tag tag-routine">루틴</span>
                            <span v-if="todo.allday" class="list-tag tag-allday">Allday</span>
                            <span class="list-tag tag-date">{{ formatListDate(todo.startDate) }}</span>
                        </div>
                    </div>
                </div>
                
                <div class="checkbox-wrapper" @click.stop="store.toggleTodoStatus(todo.originalId || todo.id)">
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
                        <button class="edit-btn" @click="goToEdit">수정</button>
                        <button class="delete-btn" @click="deleteTodo">삭제</button>
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

    <!-- Routine Delete Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content">
            <h3>일정 삭제</h3>
            <p class="modal-text">선택한 일정이 반복되는 루틴입니다.<br>삭제 방식을 선택해주세요.</p>
            <div class="modal-actions">
                <button @click="handleDeleteOption('one')" class="btn-option">이 일정만 삭제</button>
                <button @click="handleDeleteOption('all')" class="btn-option danger">모든 일정 삭제</button>
            </div>
            <button @click="showDeleteModal = false" class="btn-cancel-text">취소</button>
        </div>
    </div>
</template>

<style scoped>
@import '../styles/todoView.css';
</style>
