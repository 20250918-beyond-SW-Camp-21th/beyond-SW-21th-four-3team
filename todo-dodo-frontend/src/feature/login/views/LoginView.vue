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
@import '../styles/loginView.css';
</style>
