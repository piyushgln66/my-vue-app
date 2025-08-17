<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
import { useRouter } from 'vue-router'
const router = useRouter()

function goToNewPage() {
  router.push('/second')
}
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
  <div>
    <h2>Hello, Vue Beginner!</h2>
    <p>Welcome to your first custom component.</p>
    <button @click="goToNewPage">Click me</button>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
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
