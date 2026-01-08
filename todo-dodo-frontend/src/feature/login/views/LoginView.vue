<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginApi } from '../api.js'

const router = useRouter()
const id = ref('')
const pw = ref('')

const handleLogin = async () => {
    const result = await loginApi.login(id.value, pw.value)
    if (result.success) {
        // Navigate to Calendar (default main view)
        router.push('/calendar')
    }
}

const handleRegister = () => {
    alert('회원가입 기능은 아직 구현되지 않았습니다.')
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
        <h2 class="login-title">LOGIN</h2>
        <div class="input-group">
            <input type="text" v-model="id" placeholder="ID" class="login-input" />
            <input type="password" v-model="pw" placeholder="PASSWORD" class="login-input" />
        </div>
        <div class="button-group">
            <button @click="handleLogin" class="btn login-btn">Login</button>
            <button @click="handleRegister" class="btn register-btn">Sign Up</button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
}

.login-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.login-title {
    text-align: center;
    color: #333;
    margin: 0;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.login-input {
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
}

.button-group {
    display: flex;
    gap: 1rem;
}

.btn {
    flex: 1;
    padding: 0.8rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.2s;
}

.login-btn {
    background-color: #007bff;
    color: white;
}

.register-btn {
    background-color: #6c757d;
    color: white;
}

.btn:hover {
    opacity: 0.9;
}
</style>
