<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTodoStore } from '@/stores/todoStore'

const router = useRouter()
const store = useTodoStore()

const todos = computed(() => store.state.todos)
const selectedTodo = ref(null)

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
    <div class="todo-list-container">
        <div class="header-section">
            <h2>TODO</h2>
            <button @click="goToWrite" class="write-btn">+</button>
        </div>
        
        <div class="todo-list">
            <div 
                v-for="todo in todos" 
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
            
            <div class="detail-body">
                <div class="priority-display">
                    <div 
                        class="priority-dot-large"
                        :class="{
                            'priority-high': selectedTodo.priority === 'High',
                            'priority-medium': selectedTodo.priority === 'Medium',
                            'priority-low': !selectedTodo.priority || selectedTodo.priority === 'Low'
                        }"
                    >
                        <span 
                            class="priority-text"
                            :class="{
                                'text-high': selectedTodo.priority === 'High',
                                'text-medium': selectedTodo.priority === 'Medium',
                                'text-low': !selectedTodo.priority || selectedTodo.priority === 'Low'
                            }"
                        >{{ selectedTodo.priority || 'Low' }}</span>
                    </div>
                </div>
                
                <div class="info-group">
                    <h1 class="info-title">{{ selectedTodo.title }}</h1>
                    
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
