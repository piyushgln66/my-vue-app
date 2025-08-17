<template>
  <div>
    <h1>Mutual Fund Comparator</h1>
    <div class="input-row">
      <span class="input-label">Fund 1</span>
      <div class="autocomplete-container">
        <input
          v-model="fund1Input"
          type="text"
          placeholder="Enter the name of the fund..."
          @input="filterFunds1"
          @focus="showDropdown1 = true"
          @blur="hideDropdown1"
          :class="{ 'error': fund1Error }"
        />
        <div v-if="showDropdown1 && filteredFunds1.length > 0" class="dropdown">
          <div
            v-for="fund in filteredFunds1"
            :key="fund"
            class="dropdown-item"
            @click="selectFund1(fund)"
          >
            {{ fund }}
          </div>
        </div>
      </div>
    </div>
    <div class="input-row">
      <span class="input-label">Fund 2</span>
      <div class="autocomplete-container">
        <input
          v-model="fund2Input"
          type="text"
          placeholder="Enter the name of the fund..."
          @input="filterFunds2"
          @focus="showDropdown2 = true"
          @blur="hideDropdown2"
          :class="{ 'error': fund2Error }"
        />
        <div v-if="showDropdown2 && filteredFunds2.length > 0" class="dropdown">
          <div
            v-for="fund in filteredFunds2"
            :key="fund"
            class="dropdown-item"
            @click="selectFund2(fund)"
          >
            {{ fund }}
          </div>
        </div>
      </div>
    </div>
    <button @click="handleClick">Next</button>
    <p v-if="submittedValue">You entered: {{ submittedValue }}</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { mutualFunds } from './data/mutualFunds.js'

const router = useRouter()
const fund1Input = ref('')
const fund2Input = ref('')
const submittedValue = ref('')
const showDropdown1 = ref(false)
const showDropdown2 = ref(false)
const filteredFunds1 = ref([])
const filteredFunds2 = ref([])
const fund1Error = ref(false)
const fund2Error = ref(false)
const errorMessage = ref('')

function filterFunds1() {
  if (fund1Input.value.trim() === '') {
    filteredFunds1.value = []
    return
  }
  
  // Clear errors when user starts typing
  fund1Error.value = false
  errorMessage.value = ''
  
  const query = fund1Input.value.toLowerCase()
  filteredFunds1.value = mutualFunds.filter(fund => 
    fund.toLowerCase().includes(query)
  )
}

function filterFunds2() {
  if (fund2Input.value.trim() === '') {
    filteredFunds2.value = []
    return
  }
  
  // Clear errors when user starts typing
  fund2Error.value = false
  errorMessage.value = ''
  
  const query = fund2Input.value.toLowerCase()
  filteredFunds2.value = mutualFunds.filter(fund => 
    fund.toLowerCase().includes(query)
  )
}

function selectFund1(fund) {
  fund1Input.value = fund
  showDropdown1.value = false
  filteredFunds1.value = []
  fund1Error.value = false
  errorMessage.value = ''
}

function selectFund2(fund) {
  fund2Input.value = fund
  showDropdown2.value = false
  filteredFunds2.value = []
  fund2Error.value = false
  errorMessage.value = ''
}

function hideDropdown1() {
  setTimeout(() => {
    showDropdown1.value = false
    // Validate if the entered value exists in the list
    if (fund1Input.value && !mutualFunds.includes(fund1Input.value)) {
      fund1Input.value = ''
    }
  }, 200)
}

function hideDropdown2() {
  setTimeout(() => {
    showDropdown2.value = false
    // Validate if the entered value exists in the list
    if (fund2Input.value && !mutualFunds.includes(fund2Input.value)) {
      fund2Input.value = ''
    }
  }, 200)
}

function handleClick() {
  // Clear invalid entries first
  if (fund1Input.value && !mutualFunds.includes(fund1Input.value)) {
    fund1Input.value = ''
  }
  if (fund2Input.value && !mutualFunds.includes(fund2Input.value)) {
    fund2Input.value = ''
  }
  
  if (!fund1Input.value) {
    fund1Error.value = true
    errorMessage.value = 'Please select a Fund 1.'
    return
  }
  if (!fund2Input.value) {
    fund2Error.value = true
    errorMessage.value = 'Please select a Fund 2.'
    return
  }
  
  // Navigate to questionnaire page with selected funds
  router.push({
    path: '/questionnaire',
    query: {
      fund1: fund1Input.value,
      fund2: fund2Input.value
    }
  })
}
</script>

<style scoped>
.input-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
  max-width: 500px;
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
.dropdown-item {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}
.dropdown-item:hover {
  background-color: #f5f5f5;
}
.dropdown-item:last-child {
  border-bottom: none;
}
button {
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
.error {
  border-color: red;
}
.error-message {
  color: red;
  font-size: 0.9rem;
  margin-top: 5px;
}
</style>
