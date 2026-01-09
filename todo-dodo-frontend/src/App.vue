<script setup>
import CommonHeader from './components/CommonHeader.vue'
import CommonFooter from './components/CommonFooter.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <CommonHeader />
    <main>
      <RouterView />
    </main>
    <CommonFooter />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #e0e0e0; /* Grey page background */
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; /* Modern font fallback */
}

main {
  flex: 1;
  padding: 20px;
}
</style>

