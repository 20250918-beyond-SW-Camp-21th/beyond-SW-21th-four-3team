<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="common-header">
    <div class="header-content">
      <nav class="nav-links">
        <RouterLink to="/" class="nav-item">Calendar</RouterLink>
        <RouterLink to="/todo" class="nav-item">Todo</RouterLink>
        <RouterLink to="/workflow" class="nav-item">Workflow</RouterLink>
      </nav>
      <div class="user-profile">
        <button class="user-name">User Name</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.common-header {
  width: 100%;
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  gap: 30px;
}

.nav-item {
  text-decoration: none;
  color: #333;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-item:hover {
  color: #007bff;
}

.user-profile {
  display: flex;
  align-items: center;
}

.user-name {
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.user-name:hover {
  background-color: #f5f5f5;
}
</style>