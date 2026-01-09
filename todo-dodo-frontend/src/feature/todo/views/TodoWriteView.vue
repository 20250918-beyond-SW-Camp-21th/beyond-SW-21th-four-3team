<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTodoStore } from '@/stores/todoStore'

const router = useRouter()
const store = useTodoStore()

const title = ref('')
const content = ref('')
// Initialize with current time, truncated to minutes for datetime-local
const now = new Date()
now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
const currentIso = now.toISOString().slice(0, 16)

const startDateTime = ref(currentIso)
const endDateTime = ref(currentIso)

const handleSubmit = async () => {
    if (!title.value.trim()) return;
    
    await store.addTodo({ 
        title: title.value, 
        content: content.value,
        startDate: new Date(startDateTime.value),
        endDate: new Date(endDateTime.value)
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
            </div>
            <div class="date-row">
                <div class="date-group">
                    <label>Start</label>
                    <input v-model="startDateTime" type="datetime-local" class="input-date" />
                </div>
                <div class="date-group">
                    <label>End</label>
                    <input v-model="endDateTime" type="datetime-local" class="input-date" />
                </div>
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
