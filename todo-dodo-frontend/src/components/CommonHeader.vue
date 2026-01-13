<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import LoginModar from '@/components/LoginModar.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const showAuthModal = ref(false)
const showUserMenu = ref(false)
const userProfileRef = ref(null)

const isLoggedIn = computed(() => auth.isLoggedIn)
const displayName = computed(() => auth.user?.name || auth.user?.loginId || 'User')

function onUserButtonClick() {
  if (!isLoggedIn.value) {
    showAuthModal.value = true
    return
  }
  // Toggle menu instead of auto logout
  showUserMenu.value = !showUserMenu.value
}

function handleLogout() {
  auth.logout()
  showUserMenu.value = false
}

function handleClickOutside(event) {
  if (showUserMenu.value && userProfileRef.value && !userProfileRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="common-header">
    <div class="header-content">
      <nav class="nav-links">
        <RouterLink to="/calendar" class="nav-item">Calendar</RouterLink>
        <RouterLink to="/todo" class="nav-item">Todo</RouterLink>
        <RouterLink to="/workflow" class="nav-item">Workflow</RouterLink>
      </nav>

      <div class="user-profile" ref="userProfileRef">
        <button class="user-name" @click="onUserButtonClick">
          {{ isLoggedIn ? displayName : '로그인' }}
        </button>
        
        <div v-if="showUserMenu && isLoggedIn" class="user-menu">
          <div class="menu-info">
            <p class="info-name">{{ auth.user?.nickname || auth.user?.name || '사용자' }}</p>
            <p class="info-id">@{{ auth.user?.loginId }}</p>
          </div>
          <div class="menu-divider"></div>
          <button class="menu-logout" @click="handleLogout">
            로그아웃
          </button>
        </div>
      </div>
    </div>

    <LoginModar :isOpen="showAuthModal" @close="showAuthModal = false" />
  </header>
</template>

<style scoped>
.common-header {
  width: 100%;
  height: 80px;
  background-color: #424242; /* Dark Grey Background */
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 100;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.nav-links {
  display: flex;
  gap: 10px; /* Reduced gap as tabs might touch or be close */
  flex-grow: 1;
  justify-content: center;
  height: 100%;
  align-items: flex-end; /* Align tabs to bottom if needed, or center */
}

.nav-item {
  text-decoration: none;
  color: #ffffff; /* White text */
  font-size: 1.3rem; /* Large */
  font-weight: 700; /* Bold */
  padding: 12px 30px;
  border-radius: 12px 12px 0 0; /* Tab shape: Top rounded */
  transition: all 0.2s ease;
  margin-bottom: -1px; /* Align with bottom border if desired */
  border: 1px solid transparent;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1); /* Subtle hover on dark */
  color: #fff;
}

.router-link-active {
  background-color: #e0e0e0; /* Light Grey matching page background (or #f5f5f5 as requested) */
  color: #212121; /* Black text */
  box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
}

.user-profile {
  display: flex;
  align-items: center;
  position: relative; /* For dropdown positioning */
}

.user-name {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px; /* Pill shape */
  transition: background-color 0.2s ease;
}

.user-name:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* User Menu Dropdown */
.user-menu {
  position: absolute;
  top: 120%; /* Below the button */
  right: 0;
  width: 200px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  padding: 10px;
  animation: fadeIn 0.1s ease-out;
}

.menu-info {
  padding: 8px 12px;
}

.info-name {
  margin: 0;
  font-weight: bold;
  font-size: 1rem;
  color: #333;
}

.info-id {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: #666;
}

.menu-divider {
  height: 1px;
  background-color: #eee;
  margin: 8px 0;
}

.menu-logout {
  background-color: transparent;
  border: none;
  text-align: left;
  padding: 10px 12px;
  font-size: 0.9rem;
  color: #d32f2f;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.menu-logout:hover {
  background-color: #ffebee;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>