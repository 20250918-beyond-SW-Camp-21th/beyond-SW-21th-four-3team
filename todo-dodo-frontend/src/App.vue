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
}

main {
  flex: 1;
  padding: 20px;
}
</style>

