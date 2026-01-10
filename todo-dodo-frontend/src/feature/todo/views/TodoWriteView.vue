<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTodoStore } from '@/stores/todoStore'

const router = useRouter()
const store = useTodoStore()

const title = ref('')
const content = ref('')
const priority = ref('Low') // Default Low
const allday = ref(false)

watch(allday, (newVal) => {
    if (newVal) {
        startTime.value = '00:00'
        endTime.value = '23:59'
    }
})

// Initialize with current time, truncated to minutes for datetime-local
// Initialize with current time
const now = new Date()
now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
const currentIsoDate = now.toISOString().slice(0, 10) // YYYY-MM-DD
const currentIsoTime = now.toISOString().slice(11, 16) // HH:mm

const startDate = ref(currentIsoDate)
const startTime = ref(currentIsoTime)
const endDate = ref(currentIsoDate)
const endTime = ref(currentIsoTime)

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
        startDate: startDate.value,
        startTime: startTime.value,
        endDate: isRepeat.value ? repeatUntil.value : endDate.value,
        endTime: endTime.value,
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
                        <div class="split-inputs">
                            <input v-model="startDate" type="date" class="input-date" :disabled="allday" />
                            <input v-model="startTime" type="time" class="input-date" :disabled="allday" />
                        </div>
                    </div>
                    <div class="datetime-row">
                        <label>End</label>
                        <div class="split-inputs">
                            <input v-if="!isRepeat" v-model="endDate" type="date" class="input-date" :disabled="allday" />
                            <input v-model="endTime" type="time" class="input-date" :disabled="allday" />
                        </div>
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
