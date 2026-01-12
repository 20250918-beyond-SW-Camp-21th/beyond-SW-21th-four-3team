<script setup>
import { reactive, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/authApi'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const authStore = useAuthStore()

const mode = ref('login')
const resetStep = ref('request')

const busy = ref(false)
const errorMsg = ref('')
const infoMsg = ref('')

const loginForm = reactive({
  loginId: '',
  password: '',
})

const signupForm = reactive({
  loginId: '',
  email: '',
  password: '',
  nickname: '',
})

const resetForm = reactive({
  loginId: '',
  email: '',
  code: '',
  newPassword: '',
})

const title = computed(() => {
  if (mode.value === 'login') return '로그인'
  if (mode.value === 'signup') return '회원가입'
  return resetStep.value === 'request' ? '비밀번호 찾기' : '비밀번호 재설정'
})

function close() {
  clearMessages()
  emit('close')
}

function clearMessages() {
  errorMsg.value = ''
  infoMsg.value = ''
}

function switchMode(next) {
  clearMessages()
  mode.value = next
  if (next === 'reset') resetStep.value = 'request'
}

async function handleLogin() {
  clearMessages()
  busy.value = true
  try {
    const ok = await authStore.login(loginForm.loginId, loginForm.password)
    if (!ok) {
      errorMsg.value = '로그인에 실패했습니다.'
      return
    }
    close()
  } catch (e) {
    errorMsg.value = '로그인 중 오류가 발생했습니다.'
  } finally {
    busy.value = false
  }
}

async function handleSignup() {
  clearMessages()
  busy.value = true
  try {
    const res = await authApi.signup({
      loginId: signupForm.loginId,
      email: signupForm.email,
      password: signupForm.password,
      nickname: signupForm.nickname,
    })

    if (!res?.success) {
      errorMsg.value = res?.message ?? '회원가입에 실패했습니다.'
      return
    }

    infoMsg.value = '회원가입 완료! 로그인 해주세요.'
    mode.value = 'login'
  } catch (e) {
    errorMsg.value = '회원가입 중 오류가 발생했습니다.'
  } finally {
    busy.value = false
  }
}

async function handleResetRequest() {
  clearMessages()
  busy.value = true
  try {
    const res = await authApi.requestPasswordReset(resetForm.loginId, resetForm.email)

    if (!res?.success) {
      errorMsg.value = res?.message ?? '요청에 실패했습니다.'
      return
    }

    infoMsg.value = res?.message ?? '이메일로 재설정 코드를 전송했습니다.'
    resetStep.value = 'confirm'
  } catch (e) {
    errorMsg.value = '요청 중 오류가 발생했습니다.'
  } finally {
    busy.value = false
  }
}

async function handleResetConfirm() {
  clearMessages()
  busy.value = true
  try {
    const res = await authApi.confirmPasswordReset(
      resetForm.loginId,
      resetForm.code,
      resetForm.newPassword
    )

    if (!res?.success) {
      errorMsg.value = res?.message ?? '비밀번호 변경에 실패했습니다.'
      return
    }

    infoMsg.value = res?.message ?? '비밀번호가 변경되었습니다. 로그인 해주세요.'
    mode.value = 'login'
    resetStep.value = 'request'
    resetForm.code = ''
    resetForm.newPassword = ''
  } catch (e) {
    errorMsg.value = '변경 중 오류가 발생했습니다.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="overlay" @click.self="close">
    <div class="modal" role="dialog" aria-modal="true">
      <h2 class="title">{{ title }}</h2>

      <p v-if="errorMsg" class="msg error">{{ errorMsg }}</p>
      <p v-if="infoMsg" class="msg info">{{ infoMsg }}</p>

      <div v-if="mode === 'login'" class="section">
        <input v-model.trim="loginForm.loginId" placeholder="아이디" />
        <input v-model.trim="loginForm.password" type="password" placeholder="비밀번호" />

        <button :disabled="busy" @click="handleLogin">로그인</button>

        <div class="links">
          <span @click="switchMode('signup')">회원가입</span>
          <span @click="switchMode('reset')">비밀번호 찾기</span>
        </div>
      </div>

      <div v-else-if="mode === 'signup'" class="section">
        <input v-model.trim="signupForm.loginId" placeholder="아이디" />
        <input v-model.trim="signupForm.email" placeholder="이메일" />
        <input v-model.trim="signupForm.nickname" placeholder="닉네임" />
        <input v-model.trim="signupForm.password" type="password" placeholder="비밀번호" />

        <button :disabled="busy" @click="handleSignup">회원가입</button>
        <button class="ghost" :disabled="busy" @click="switchMode('login')">뒤로</button>
      </div>

      <div v-else class="section">
        <div v-if="resetStep === 'request'">
          <input v-model.trim="resetForm.loginId" placeholder="아이디" />
          <input v-model.trim="resetForm.email" placeholder="이메일" />

          <button :disabled="busy" @click="handleResetRequest">재설정 코드 받기</button>
          <button class="ghost" :disabled="busy" @click="switchMode('login')">뒤로</button>
        </div>

        <div v-else>
          <input v-model.trim="resetForm.loginId" placeholder="아이디" />
          <input v-model.trim="resetForm.code" placeholder="인증 코드" />
          <input v-model.trim="resetForm.newPassword" type="password" placeholder="새 비밀번호" />

          <button :disabled="busy" @click="handleResetConfirm">비밀번호 변경</button>
          <button class="ghost" :disabled="busy" @click="resetStep = 'request'">이전</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  padding: 24px;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  width: min(420px, calc(100vw - 32px));
  max-height: calc(100vh - 80px);
  overflow: auto;
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  box-sizing: border-box;
}

.title {
  margin: 0 0 12px;
  font-size: 1.2rem;
}

.section input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.section button {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  margin-top: 8px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.section button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.section button.ghost {
  background: transparent;
  border: 1px solid #ddd;
}

.links {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.links span {
  cursor: pointer;
  text-decoration: underline;
}

.msg {
  margin: 8px 0;
  font-size: 0.9rem;
}

.msg.error {
  color: #b00020;
}

.msg.info {
  color: #0b6b2f;
}
</style>
