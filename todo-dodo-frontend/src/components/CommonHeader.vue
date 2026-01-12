<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import LoginModar from '@/components/LoginModar.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const showAuthModal = ref(false)

const isLoggedIn = computed(() => auth.isLoggedIn)
const displayName = computed(() => auth.user?.name || auth.user?.loginId || 'User')

function onUserButtonClick() {
  if (!isLoggedIn.value) {
    showAuthModal.value = true
    return
  }
  auth.logout()
}
</script>

<template>
  <header class="common-header">
    <div class="header-content">
      <nav class="nav-links">
        <RouterLink to="/calendar" class="nav-item">Calendar</RouterLink>
        <RouterLink to="/todo" class="nav-item">Todo</RouterLink>
        <RouterLink to="/workflow" class="nav-item">Workflow</RouterLink>
      </nav>

      <div class="user-profile">
        <button class="user-name" @click="onUserButtonClick">
          {{ isLoggedIn ? displayName : 'Login' }}
        </button>
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
</style>