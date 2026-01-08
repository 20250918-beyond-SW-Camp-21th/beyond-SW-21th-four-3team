<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { todoApi } from '../api.js'

const router = useRouter()
const title = ref('')
const content = ref('')

const handleSubmit = async () => {
    await todoApi.createTodo({ title: title.value, content: content.value })
    router.push('/todo')
}

const handleCancel = () => {
    router.back()
}
</script>

<template>
  <div class="todo-write-view">
    <div class="write-card">
        <div class="write-header">
            <h3>TODO 작성</h3>
        </div>
        
        <div class="form-group">
            <input v-model="title" type="text" placeholder="Title" class="input-title" />
            <div class="meta-info">User Name | 2026-01-08</div>
        </div>
        
        <div class="form-group">
            <textarea v-model="content" placeholder="Content" class="input-content"></textarea>
        </div>
        
        <div class="button-group">
            <button @click="handleCancel" class="btn cancel-btn">Cancel</button>
            <button @click="handleSubmit" class="btn save-btn">Save</button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.todo-write-view {
    display: flex;
    justify-content: center;
    padding: 40px;
}

.write-card {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    width: 100%;
    max-width: 800px;
}

.write-header {
    margin-bottom: 2rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 1rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.input-title {
    width: 100%;
    font-size: 1.5rem;
    padding: 10px;
    border: none;
    border-bottom: 1px solid #ddd;
    outline: none;
}

.meta-info {
    color: #888;
    font-size: 0.9rem;
    margin-top: 5px;
}

.input-content {
    width: 100%;
    min-height: 300px;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 8px;
    resize: vertical;
    font-size: 1rem;
    outline: none;
}

.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
}

.cancel-btn {
    background-color: #f5f5f5;
    color: #333;
}

.save-btn {
    background-color: #6200ea;
    color: white;
}
</style>
