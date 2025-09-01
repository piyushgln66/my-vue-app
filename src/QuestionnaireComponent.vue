<template>
  <div class="questionnaire-container">
    <h1>Personalized Fund Comparison</h1>
    <p class="subtitle">Answer these questions to get personalized fund recommendations</p>
    
    <!-- Loading Screen -->
    <LoadingScreen :is-visible="isLoading" />
    
    <div v-if="currentQuestion" class="question-card">
      <div class="question-header">
        <span class="question-number">Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
      
      <h2 class="question-text">{{ currentQuestion.question }}</h2>
      
      <!-- Single Choice Questions -->
      <div v-if="currentQuestion.type === 'single_choice'" class="options-container">
        <label 
          v-for="(option, index) in currentQuestion.options" 
          :key="index"
          class="option-item"
          :class="{ 'selected': answers[currentQuestion.id] === option }"
        >
          <input 
            type="radio" 
            :name="currentQuestion.id" 
            :value="option"
            v-model="answers[currentQuestion.id]"
            @change="handleAnswerChange"
          />
          <span class="option-text">{{ option }}</span>
        </label>
      </div>
      
      <!-- Slider Question -->
      <div v-if="currentQuestion.type === 'slider'" class="slider-container">
        <div class="slider-labels">
          <span>{{ currentQuestion.range.labelMin }}</span>
          <span>{{ currentQuestion.range.labelMax }}</span>
        </div>
        <input 
          type="range" 
          :min="currentQuestion.range.min" 
          :max="currentQuestion.range.max" 
          :value="answers[currentQuestion.id] || currentQuestion.range.default"
          @input="handleSliderChange"
          class="slider"
        />
        <div class="slider-value">{{ answers[currentQuestion.id] || currentQuestion.range.default }}%</div>
      </div>
    </div>
    
    <div class="navigation-buttons">
      <button 
        @click="previousQuestion" 
        :disabled="currentQuestionIndex === 0"
        class="nav-button prev"
      >
        Previous
      </button>
      
      <button 
        v-if="currentQuestionIndex < questions.length - 1"
        @click="nextQuestion" 
        :disabled="!isCurrentQuestionAnswered"
        class="nav-button next"
      >
        Next
      </button>
      
      <button 
        v-if="currentQuestionIndex === questions.length - 1"
        @click="submitQuestionnaire" 
        :disabled="!isCurrentQuestionAnswered"
        class="nav-button submit"
      >
        Get Comparison
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { questions } from './data/questions.js'
import LoadingScreen from './components/LoadingScreen.vue'

const route = useRoute()
const router = useRouter()
const currentQuestionIndex = ref(0)
const answers = ref({})
const isLoading = ref(false)

// Debug: Log loading state changes
watch(isLoading, (newValue) => {
  console.log('Loading state changed:', newValue)
})

// Get selected funds from route params or query
const selectedFunds = computed(() => {
  const funds = []
  for (let i = 1; i <= 4; i++) {
    if (route.query[`fund${i}`]) {
      funds.push(route.query[`fund${i}`])
    }
  }
  return funds
})

const currentQuestion = computed(() => questions[currentQuestionIndex.value])

const progressPercentage = computed(() => {
  return ((currentQuestionIndex.value + 1) / questions.length) * 100
})

const isCurrentQuestionAnswered = computed(() => {
  if (!currentQuestion.value) return false
  
  if (currentQuestion.value.type === 'single_choice') {
    return answers.value[currentQuestion.value.id] !== undefined
  }
  
  if (currentQuestion.value.type === 'slider') {
    return answers.value[currentQuestion.value.id] !== undefined
  }
  
  return false
})

function nextQuestion() {
  if (currentQuestionIndex.value < questions.length - 1) {
    currentQuestionIndex.value++
  }
}

function previousQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

function handleAnswerChange() {
  // Answer is automatically saved to answers.value
}

function handleSliderChange(event) {
  answers.value[currentQuestion.value.id] = parseInt(event.target.value)
}

function generatePerplexityPrompt() {
  // Create fund labels dynamically
  const fundLabels = selectedFunds.value.map((fund, index) => {
    const label = String.fromCharCode(65 + index) // A, B, C, D
    return `Fund ${label}: ${fund}`
  }).join('\n')

  const prompt = `Compare the following ${selectedFunds.value.length} mutual funds based on the user's investment preferences:

${fundLabels}

User's preferences:
- Investment Time Horizon: ${answers.value.time_horizon || 'Not specified'}
- Risk Appetite: ${answers.value.risk_appetite || 'Not specified'}
- Return vs Stability Preference (0–100): ${answers.value.returns_vs_stability || 'Not specified'}
- Tax Sensitivity: ${answers.value.tax_sensitivity || 'Not specified'}
- Liquidity Needs: ${answers.value.liquidity_needs || 'Not specified'}
- Preference on Return Consistency: ${answers.value.past_returns_preference || 'Not specified'}
- Fund Age Preference: ${answers.value.fund_age_bias || 'Not specified'}
- AUM Size Preference: ${answers.value.fund_size_preference || 'Not specified'}
- Importance of Fund Manager Experience: ${answers.value.fund_manager_experience || 'Not specified'}
- Volatility Tolerance: ${answers.value.volatility_tolerance || 'Not specified'}

Please provide a detailed comparison based on these criteria. Include points like historical returns, risk measures (standard deviation, Sharpe ratio), tax efficiency, fund age, AUM, fund manager experience, and overall suitability for the user's profile.

Be concise and use bullet points or a table if needed. Conclude with a recommendation on which fund may be more aligned with the user's preferences.`

  return prompt
}

async function submitQuestionnaire() {
  try {
    // Show loading screen
    isLoading.value = true

    // Call the API
    const response = await fetch('https://mutual-fund-comparator-backend.onrender.com/api/compare-funds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...selectedFunds.value.reduce((acc, fund, index) => {
          acc[`fund${index + 1}`] = fund
          return acc
        }, {}),
        preferences: answers.value
      })
    })

    const result = await response.json()
    
    // Hide loading screen
    isLoading.value = false

    if (result.success) {
      // Navigate to results page with all data
      const query = {
        preferences: JSON.stringify(answers.value),
        comparison: result.comparison
      }
      
      // Add all selected funds to query
      selectedFunds.value.forEach((fund, index) => {
        query[`fund${index + 1}`] = fund
      })
      
      router.push({
        path: '/results',
        query: query
      })
    } else {
      // Show error
      alert(`Error: ${result.error}`)
    }

  } catch (error) {
    console.error('Error:', error)
    isLoading.value = false
    alert('Failed to generate comparison. Please try again.')
  }
}

onMounted(() => {
  // Initialize slider answers with default values
  questions.forEach(question => {
    if (question.type === 'slider') {
      answers.value[question.id] = question.range.default
    }
  })
})
</script>

<style scoped>
.questionnaire-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.question-header {
  margin-bottom: 20px;
}

.question-number {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #42b983;
  transition: width 0.3s ease;
}

.question-text {
  font-size: 18px;
  color: #333;
  margin-bottom: 25px;
  line-height: 1.4;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-item:hover {
  border-color: #42b983;
  background: #f8f9fa;
}

.option-item.selected {
  border-color: #42b983;
  background: #f0f9f6;
}

.option-item input[type="radio"] {
  margin-right: 12px;
  transform: scale(1.2);
}

.option-text {
  font-size: 16px;
  color: #333;
}

.slider-container {
  margin-top: 20px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #42b983;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #42b983;
  cursor: pointer;
  border: none;
}

.slider-value {
  text-align: center;
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #42b983;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.nav-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prev {
  background: #f8f9fa;
  color: #666;
}

.prev:hover:not(:disabled) {
  background: #e9ecef;
}

.next, .submit {
  background: #42b983;
  color: white;
}

.next:hover:not(:disabled), .submit:hover:not(:disabled) {
  background: #369870;
}
</style> 