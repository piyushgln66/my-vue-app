<template>
  <div>
    <h1>Mutual Fund Comparator</h1>
    
    <!-- Dynamic fund inputs -->
    <div v-for="index in fundCount" :key="index" class="input-row">
      <span class="input-label">Fund {{ index }}</span>
      <div class="autocomplete-container">
        <input
          v-model="fundInputs[index - 1]"
          type="text"
          :placeholder="`Enter the name of fund ${index}...`"
          @input="filterFunds(index - 1)"
          @focus="showDropdowns[index - 1] = true"
          @blur="hideDropdown(index - 1)"
          :class="{ 'error': fundErrors[index - 1] }"
        />
        <div v-if="showDropdowns[index - 1] && filteredFunds[index - 1].length > 0" class="dropdown">
          <div
            v-for="fund in filteredFunds[index - 1]"
            :key="fund"
            class="dropdown-item"
            @click="selectFund(index - 1, fund)"
          >
            {{ fund }}
          </div>
        </div>
      </div>
      
      <!-- Show Add/Remove buttons only on the last fund row -->
      <div v-if="index === fundCount" class="fund-controls">
        <button 
          @click="addFund" 
          :disabled="fundCount >= 4"
          class="control-btn add-btn"
          :class="{ 'disabled': fundCount >= 4 }"
        >
          Add
        </button>
        
        <button 
          @click="removeFund" 
          :disabled="fundCount <= 2"
          class="control-btn remove-btn"
          :class="{ 'disabled': fundCount <= 2 }"
        >
          Remove
        </button>
      </div>
    </div>

    <button @click="handleClick" class="next-btn">Next</button>
    <p v-if="submittedValue">You entered: {{ submittedValue }}</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { mutualFunds } from './data/mutualFunds.js'

const router = useRouter()

// Dynamic fund management
const fundCount = ref(2)
const fundInputs = ref(['', '']) // Start with 2 funds
const showDropdowns = ref([false, false])
const filteredFunds = ref([[], []])
const fundErrors = ref([false, false])

const submittedValue = ref('')
const errorMessage = ref('')

// Computed properties for validation
const hasValidFunds = computed(() => {
  return fundInputs.value.slice(0, fundCount.value).every(input => 
    input && mutualFunds.includes(input)
  )
})

const selectedFunds = computed(() => {
  return fundInputs.value.slice(0, fundCount.value).filter(fund => fund)
})

function addFund() {
  if (fundCount.value < 4) {
    fundCount.value++
    // Add new input fields
    fundInputs.value.push('')
    showDropdowns.value.push(false)
    filteredFunds.value.push([])
    fundErrors.value.push(false)
  }
}

function removeFund() {
  if (fundCount.value > 2) {
    fundCount.value--
    // Remove last input fields
    fundInputs.value.pop()
    showDropdowns.value.pop()
    filteredFunds.value.pop()
    fundErrors.value.pop()
    
    // Clear any error messages
    errorMessage.value = ''
  }
}

function filterFunds(index) {
  if (fundInputs.value[index].trim() === '') {
    filteredFunds.value[index] = []
    return
  }
  
  // Clear errors when user starts typing
  fundErrors.value[index] = false
  errorMessage.value = ''
  
  // Clear all fund errors when any fund is being modified
  fundErrors.value.forEach((_, i) => {
    fundErrors.value[i] = false
  })
  
  const query = fundInputs.value[index].toLowerCase()
  filteredFunds.value[index] = mutualFunds.filter(fund => 
    fund.toLowerCase().includes(query)
  )
}

function selectFund(index, fund) {
  fundInputs.value[index] = fund
  showDropdowns.value[index] = false
  filteredFunds.value[index] = []
  fundErrors.value[index] = false
  errorMessage.value = ''
  
  // Clear errors for all funds when a new selection is made
  fundErrors.value.forEach((_, i) => {
    fundErrors.value[i] = false
  })
}

function hideDropdown(index) {
  setTimeout(() => {
    showDropdowns.value[index] = false
    // Validate if the entered value exists in the list
    if (fundInputs.value[index] && !mutualFunds.includes(fundInputs.value[index])) {
      fundInputs.value[index] = ''
    }
  }, 200)
}

// Helper function to find duplicate values in an array
function findDuplicates(array) {
  const seen = new Set()
  const duplicates = []
  
  array.forEach(item => {
    if (seen.has(item)) {
      if (!duplicates.includes(item)) {
        duplicates.push(item)
      }
    } else {
      seen.add(item)
    }
  })
  
  return duplicates
}

function handleClick() {
  // Clear invalid entries first
  for (let i = 0; i < fundCount.value; i++) {
    if (fundInputs.value[i] && !mutualFunds.includes(fundInputs.value[i])) {
      fundInputs.value[i] = ''
    }
  }
  
  // Validate all required funds
  let hasError = false
  for (let i = 0; i < fundCount.value; i++) {
    if (!fundInputs.value[i]) {
      fundErrors.value[i] = true
      hasError = true
    }
  }
  
  if (hasError) {
    errorMessage.value = `Please select all ${fundCount.value} funds.`
    return
  }
  
  // Check for duplicate funds
  const selectedFunds = fundInputs.value.slice(0, fundCount.value)
  const duplicates = findDuplicates(selectedFunds)
  
  if (duplicates.length > 0) {
    // Highlight duplicate funds with errors
    duplicates.forEach(fundName => {
      for (let i = 0; i < fundCount.value; i++) {
        if (fundInputs.value[i] === fundName) {
          fundErrors.value[i] = true
        }
      }
    })
    
    errorMessage.value = `Cannot compare the same fund multiple times. Please select different funds.`
    return
  }
  
  // Navigate to questionnaire page with selected funds
  const query = {}
  for (let i = 0; i < fundCount.value; i++) {
    query[`fund${i + 1}`] = fundInputs.value[i]
  }
  
  router.push({
    path: '/questionnaire',
    query: query
  })
}
</script>

<style scoped>
.input-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
  max-width: 800px;
  position: relative;
}

h1 {
  max-width: 500px;
}

.input-label {
  margin-right: 12px;
  font-weight: 500;
  font-size: 1.1rem;
  min-width: 60px;
}

.autocomplete-container {
  position: relative;
  flex: 1;
}

input {
  flex: 1;
  margin-bottom: 10px;
  padding: 12px 20px;
  font-size: 1.1rem;
  border-radius: 20px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  width: 100%;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .dropdown {
    background: #2d2d2d;
    border-color: #555;
    color: #ffffff;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
}

.dropdown-item {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

/* Dark mode support for dropdown items */
@media (prefers-color-scheme: dark) {
  .dropdown-item {
    color: #ffffff;
    border-bottom-color: #444;
  }
  
  .dropdown-item:hover {
    background-color: #3d3d3d;
  }
}

.dropdown-item:last-child {
  border-bottom: none;
}

.fund-controls {
  display: flex;
  gap: 10px;
  position: absolute;
  right: -200px;
  top: 50%;
  transform: translateY(-50%);
  align-items: center;
}

.control-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.add-btn {
  background: #28a745;
  color: white;
}

.add-btn:hover:not(.disabled) {
  background: #218838;
}

.remove-btn {
  background: #dc3545;
  color: white;
}

.remove-btn:hover:not(.disabled) {
  background: #c82333;
}

.control-btn.disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.next-btn {
  padding: 12px 24px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.next-btn:hover {
  background: #369870;
}

.error {
  border-color: red;
}

.error-message {
  color: red;
  font-size: 0.9rem;
  margin-top: 5px;
}

/* Dark mode support for main content */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #1a1a1a;
    color: #ffffff;
  }
  
  h1 {
    color: #ffffff;
  }
  
  input {
    background-color: #2d2d2d;
    color: #ffffff;
    border-color: #555;
  }
  
  input::placeholder {
    color: #aaa;
  }
  
  .input-label {
    color: #ffffff;
  }
}
</style>
