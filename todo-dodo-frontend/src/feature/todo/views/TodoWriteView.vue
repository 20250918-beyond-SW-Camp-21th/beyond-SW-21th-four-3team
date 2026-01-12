<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTodoStore } from '@/stores/todoStore'

const router = useRouter()
const route = useRoute()
const store = useTodoStore()

// Edit Mode Detection
const isEditMode = computed(() => !!route.params.id)
const todoId = route.params.id

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

// Load Data for Edit
onMounted(async () => {
    if (isEditMode.value) {
        // Fetch data via API (wrapper action)
        const todo = await store.getTodo(todoId)

        if (todo) {
            title.value = todo.title
            content.value = todo.content
            priority.value = todo.priority 
            allday.value = todo.allday
            startDate.value = todo.startDate
            startTime.value = todo.startTime ? todo.startTime.slice(0, 5) : '00:00'
            endDate.value = todo.endDate
            endTime.value = todo.endTime ? todo.endTime.slice(0, 5) : '23:59'
            
            if (todo.repeatUntil) {
                isRepeat.value = true
                repeatUntil.value = todo.repeatUntil
                const dayMap = { 'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6 }
                if (todo.daysOfWeek) {
                    selectedDays.value = todo.daysOfWeek.map(d => dayMap[d])
                }
            }
        }
    }
})

const toggleDay = (index) => {
    if (selectedDays.value.includes(index)) {
        selectedDays.value = selectedDays.value.filter(d => d !== index)
    } else {
        selectedDays.value.push(index)
    }
}

const handleSubmit = async () => {
    if (!title.value.trim()) return;
    
    // Construct Todo Data (Shared structure for add/update)
    const todoData = { 
        title: title.value, 
        content: content.value,
        startDate: startDate.value,
        startTime: startTime.value,
        endDate: isRepeat.value ? startDate.value : endDate.value,
        endTime: endTime.value,
        priority: priority.value,
        allday: allday.value,
        isRepeat: isRepeat.value,
        selectedDays: selectedDays.value,
        repeatUntil: repeatUntil.value
    }

    if (isEditMode.value) {
        await store.updateTodo(todoId, todoData)
    } else {
        await store.addTodo(todoData)
    }
    
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
                <label class="section-label">중요도</label>
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
                    루틴 생성
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
                        <input v-model="repeatUntil" @click="$event.target.showPicker()" type="date" class="input-date" />
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
                            <input v-model="startDate" @click="$event.target.showPicker()" type="date" class="input-date" />
                            <input v-model="startTime" @click="$event.target.showPicker()" type="time" class="input-date" :disabled="allday" />
                        </div>
                    </div>
                    <div class="datetime-row">
                        <label>End</label>
                        <div class="split-inputs">
                            <input v-if="!isRepeat" v-model="endDate" @click="$event.target.showPicker()" type="date" class="input-date" />
                            <input v-model="endTime" @click="$event.target.showPicker()" type="time" class="input-date" :disabled="allday" />
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
            <button @click="handleSubmit" class="btn save-btn">{{ isEditMode ? 'Update' : 'Save' }}</button>
        </div>
    </div>
    </div>
    </div>
</template>


<style scoped>
@import '../styles/todoWriteView.css';
</style>
