<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { todoApi } from '../api.js'

const router = useRouter()
const todos = ref([])

onMounted(async () => {
    todos.value = await todoApi.getTodos()
})

const goToWrite = () => {
    router.push('/todo/write')
}

const goToDetail = (id) => {
    // For now, might just expand or go to detail. 
    // Given the blueprint shows detail next to list or separate, let's assume separate or write view for edit.
    // For simplicity, let's just log or alert.
    console.log('Clicked todo', id);
}
</script>

<template>
  <div class="todo-view">
    <div class="todo-container">
        <div class="header-section">
            <h2>TODO</h2>
            <button @click="goToWrite" class="write-btn">Write</button>
        </div>
        
        <div class="todo-list">
            <div v-for="todo in todos" :key="todo.id" class="todo-item" @click="goToDetail(todo.id)">
                <div class="todo-content">
                    <span class="todo-title">{{ todo.title }}</span>
                </div>
                <div class="todo-actions">
                    <button class="icon-btn">📝</button> <!-- Edit/Detail -->
                </div>
            </div>
        </div>
    </div>
    
    <!-- Placeholder for Detail View if split screen is desired later -->
    <div class="detail-placeholder">
        <div class="empty-state">
            <h3>Title</h3>
            <p>Select a task to view details</p>
        </div>
    </div>
  </div>
</template>

<style scoped>
.todo-view {
    display: flex;
    justify-content: center;
    padding: 40px;
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.todo-container {
    flex: 1;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.write-btn {
    background-color: #6200ea;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
}

.todo-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.todo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #f8f9fa; /* Light grey/purple tint */
    border-left: 4px solid #b388ff;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.1s;
}

.todo-item:hover {
    transform: translateX(4px);
    background-color: #f3e5f5;
}

.detail-placeholder {
    flex: 1;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    display: none; /* Hidden on small screens, can be flex on large */
}

@media (min-width: 768px) {
    .detail-placeholder {
        display: block;
    }
}

.empty-state {
    text-align: center;
    color: #888;
    margin-top: 100px;
}
</style>
