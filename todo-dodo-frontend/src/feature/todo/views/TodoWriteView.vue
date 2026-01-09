<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTodoStore } from '@/stores/todoStore'

const router = useRouter()
const store = useTodoStore()

const title = ref('')
const content = ref('')
const selectedDate = ref(new Date().toISOString().substr(0, 10))
const selectedColor = ref('#fafafa')

const handleSubmit = async () => {
    if (!title.value.trim()) return;
    
    await store.addTodo({ 
        title: title.value, 
        content: content.value,
        date: new Date(selectedDate.value),
        color: selectedColor.value
    })
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
            <div class="input-row">
                <input v-model="title" type="text" placeholder="Title" class="input-title" />
                <input v-model="selectedDate" type="date" class="input-date" />
            </div>
            
            <div class="color-picker-row">
                <div 
                    v-for="color in ['#ffebee', '#fff3e0', '#fffde7', '#e8f5e9', '#e3f2fd', '#f3e5f5', '#fafafa']" 
                    :key="color"
                    class="color-circle"
                    :style="{ backgroundColor: color, borderColor: selectedColor === color ? '#212121' : '#e0e0e0' }"
                    @click="selectedColor = color"
                ></div>
            </div>

            <div class="meta-info">User Name</div>
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
@import '../styles/todoWriteView.css';
</style>
