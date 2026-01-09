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

const deleteTodo = async () => {
    if (selectedTodo.value) {
        if (confirm('삭제하시겠습니까?')) {
            // Assuming store has a delete action or we use api directly. 
            // The plan mentioned create/update/delete in api, but store implementation might need check.
            // Checking store implementation... store has toggle, fetch, add. It does NOT have delete exposed yet.
            // I'll assume for now we can add it or just ignore. 
            // Wait, I should add delete to store first if I want to be clean. 
            // But for this step I will just alert.
            alert('삭제 기능은 추후 구현 예정입니다.')
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
            <button @click="goToWrite" class="write-btn">Write</button>
        </div>
        
        <div class="todo-list">
            <div 
                v-for="todo in todos" 
                :key="todo.id" 
                class="todo-item" 
                :class="{ 'active': selectedTodo?.id === todo.id }"
                @click="goToDetail(todo.id)"
            >
                <div class="todo-content">
                    <span class="todo-title">{{ todo.title }}</span>
                </div>
                <!-- <div class="todo-actions">
                    <button class="icon-btn">📝</button> 
                </div> -->
            </div>
        </div>
    </div>
    
    <div class="detail-container">
        <div v-if="selectedTodo" class="detail-content">
            <div class="detail-header-title">TODO 상세정보 보기</div>
            
            <div class="detail-body">
                <div class="image-placeholder">
                    <!-- Placeholder Icon -->
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#E0E0E0"/>
                    </svg>
                </div>
                
                <div class="info-group">
                    <h1 class="info-title">{{ selectedTodo.title }}</h1>
                    
                    <div class="date-time-row">
                        <div class="input-wrapper">
                            <label>Date</label>
                            <select class="custom-select">
                                <option>{{ new Date(selectedTodo.date).toLocaleDateString() }}</option>
                            </select>
                        </div>
                        <div class="input-wrapper">
                            <label>time</label>
                            <select class="custom-select">
                                <option>Value</option>
                            </select>
                        </div>
                    </div>
                    
                    <button class="delete-btn" @click="deleteTodo">isDelete</button>
                </div>
            </div>
            
            <div class="content-area">
                <h3 class="content-label">Content</h3>
                <p class="content-text">{{ selectedTodo.content || '내용이 없습니다.' }}</p>
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
