<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTodoStore } from '@/stores/todoStore'

const router = useRouter()
const store = useTodoStore()

const title = ref('')
const content = ref('')
const priority = ref('Low') // Default Low
const allday = ref(false)

// Initialize with current time, truncated to minutes for datetime-local
const now = new Date()
now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
const currentIso = now.toISOString().slice(0, 16)

const startDateTime = ref(currentIso)
const endDateTime = ref(currentIso)

// Repeat Settings
const isRepeat = ref(false)
const daysList = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] // 0=Sun, 6=Sat match JS Date.getDay()
const selectedDays = ref([]) 
const repeatUntil = ref('')

const toggleDay = (index) => {
    if (selectedDays.value.includes(index)) {
        selectedDays.value = selectedDays.value.filter(d => d !== index)
    } else {
        selectedDays.value.push(index)
    }
}

const handleSubmit = async () => {
    if (!title.value.trim()) return;
    
    await store.addTodo({ 
        title: title.value, 
        content: content.value,
        startDate: startDateTime.value, // Pass raw string
        endDate: endDateTime.value,     // Pass raw string
        priority: priority.value,
        allday: allday.value,
        isRepeat: isRepeat.value,
        selectedDays: selectedDays.value,
        repeatUntil: repeatUntil.value
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
        
        <div class="form-group">
            <div class="input-row">
                <input v-model="title" type="text" placeholder="제목을 입력하세요" class="input-title" />
            </div>
            
            <div class="form-group settings-group">
            <!-- Left Column: Priority -->
            <div class="settings-col priority-col">
                <label class="section-label">Priority</label>
                <div class="priority-selector vertical">
                    <button 
                        class="priority-btn high" 
                        :class="{ active: priority === 'High' }"
                        @click="priority = 'High'"
                    >High</button>
                    <button 
                        class="priority-btn medium" 
                        :class="{ active: priority === 'Medium' }"
                        @click="priority = 'Medium'"
                    >Medium</button>
                    <button 
                        class="priority-btn low" 
                        :class="{ active: priority === 'Low' }"
                        @click="priority = 'Low'"
                    >Low</button>
                </div>
            </div>

            <!-- Middle Column: All Day -->
            <div class="settings-col allday-col">
                <button 
                    class="allday-btn" 
                    :class="{ active: allday }"
                    @click="allday = !allday"
                >All Day</button>
            </div>

            <!-- Right Column: Time Settings -->
            <div class="settings-col time-col">
                <div class="datetime-stack">
                    <div class="datetime-row">
                        <label>Start</label>
                        <input v-model="startDateTime" type="datetime-local" class="input-date" :disabled="allday" />
                    </div>
                    <div class="datetime-row">
                        <label>End</label>
                        <input v-model="endDateTime" type="datetime-local" class="input-date" :disabled="allday" />
                    </div>
                </div>
            </div>

            <!-- New Column: Repeat Settings -->
            <div class="settings-col repeat-col">
                <button 
                    class="repeat-toggle-btn" 
                    :class="{ active: isRepeat }"
                    @click="isRepeat = !isRepeat"
                >
                    Repeat Weekly
                </button>

                <div v-if="isRepeat" class="repeat-options">
                    <div class="days-selector">
                        <button 
                            v-for="(day, index) in daysList" 
                            :key="index"
                            class="day-btn"
                            :class="{ active: selectedDays.includes(index) }"
                            @click="toggleDay(index)"
                        >
                            {{ day }}
                        </button>
                    </div>
                    <div class="datetime-row">
                        <label>Until</label>
                        <input v-model="repeatUntil" type="date" class="input-date" />
                    </div>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <textarea v-model="content" placeholder="무엇을 하시겠습니까?" class="input-content"></textarea>
        </div>
        
        <div class="button-group">
            <button @click="handleCancel" class="btn cancel-btn">Cancel</button>
            <button @click="handleSubmit" class="btn save-btn">Save</button>
        </div>
    </div>
  </div>
  </div>
</template>

<style scoped>
@import '../styles/todoWriteView.css';
</style>
