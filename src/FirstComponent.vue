<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <div>
    <h2>Hello, Vue Beginner!</h2>
    <p>Welcome to your first custom component.</p>
    <button @click="goToNewPage">Click me</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goToNewPage() {
  router.push('/second')
}
</script>

<style scoped>
h2 {
  color: #42b983;
}
button {
  margin-top: 10px;
  padding: 6px 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #369870;
}
</style>
