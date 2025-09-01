<template>
  <div v-if="isVisible" class="loading-overlay">
    <div class="loading-container">
      <div class="loading-header">
        <h2>Analyzing Your Funds</h2>
        <p class="subtitle">Please wait while we generate your personalized comparison...</p>
      </div>
      
      <div class="loading-content">
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div class="progress-text">{{ Math.round(progressPercentage) }}%</div>
        </div>
        
        <div class="status-messages">
          <div class="current-message">
            <span class="typing-indicator"></span>
            {{ currentMessage }}
          </div>
        </div>
        
        <div class="loading-animation">
          <div class="spinner"></div>
        </div>
      </div>
      
      <div class="loading-tips">
        <h4>What we're analyzing:</h4>
        <ul>
          <li>Historical performance data</li>
          <li>Risk metrics and volatility</li>
          <li>Fund manager experience</li>
          <li>Tax efficiency and costs</li>
          <li>Alignment with your preferences</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const progressPercentage = ref(0)
const currentMessageIndex = ref(0)
const currentMessage = ref('')

const messages = [
  'Getting fund details...',
  'Analyzing historical performance...',
  'Comparing risk metrics...',
  'Evaluating fund manager experience...',
  'Calculating tax efficiency...',
  'Assessing alignment with your profile...',
  'Generating personalized recommendations...',
  'Finalizing your comparison report...'
]

let progressInterval
let messageInterval

onMounted(() => {
  // Only start loading if explicitly visible
  if (props.isVisible === true) {
    startLoading()
  }
})

onUnmounted(() => {
  stopLoading()
})

const startLoading = () => {
  // Start progress bar animation
  progressInterval = setInterval(() => {
    if (progressPercentage.value < 95) {
      progressPercentage.value += Math.random() * 3 + 1
    }
  }, 200)
  
  // Start message rotation
  messageInterval = setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.length
    currentMessage.value = messages[currentMessageIndex.value]
  }, 3000)
  
  // Set initial message
  currentMessage.value = messages[0]
}

const stopLoading = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
  if (messageInterval) {
    clearInterval(messageInterval)
  }
  progressPercentage.value = 100
}

// Watch for visibility changes
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    progressPercentage.value = 0
    startLoading()
  } else {
    stopLoading()
  }
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.loading-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.loading-header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.progress-container {
  margin-bottom: 30px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #ecf0f1;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b983, #369870);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-text {
  color: #42b983;
  font-weight: 600;
  font-size: 1.1rem;
}

.status-messages {
  margin-bottom: 30px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-message {
  font-size: 1.2rem;
  color: #2c3e50;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}

.typing-indicator {
  width: 8px;
  height: 8px;
  background: #42b983;
  border-radius: 50%;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.loading-animation {
  margin-bottom: 30px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ecf0f1;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-tips {
  text-align: left;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #42b983;
}

.loading-tips h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.loading-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #555;
  line-height: 1.6;
}

.loading-tips li {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .loading-container {
    padding: 30px 20px;
    margin: 20px;
  }
  
  .loading-header h2 {
    font-size: 1.5rem;
  }
  
  .current-message {
    font-size: 1rem;
  }
}
</style> 