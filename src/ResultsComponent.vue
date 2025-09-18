<template>
  <div class="results-container">
    <div class="results-header">
      <h1>Fund Comparison Results</h1>
      <p class="subtitle">Detailed analysis based on your investment preferences</p>
    </div>

    <!-- Fund Selection Summary -->
    <div class="fund-summary">
      <div v-for="(fund, index) in selectedFunds" :key="index" class="fund-card">
        <h3>Fund {{ String.fromCharCode(65 + index) }}</h3>
        <p class="fund-name">{{ fund }}</p>
      </div>
    </div>

    <!-- User Preferences Summary -->
    <div class="preferences-summary">
      <h3>Your Investment Profile</h3>
      <div class="preferences-grid">
        <div class="preference-item">
          <span class="label">Time Horizon:</span>
          <span class="value">{{ preferences.time_horizon }}</span>
        </div>
        <div class="preference-item">
          <span class="label">Risk Appetite:</span>
          <span class="value">{{ preferences.risk_appetite }}</span>
        </div>
        <div class="preference-item">
          <span class="label">Returns vs Stability:</span>
          <span class="value">{{ preferences.returns_vs_stability }}%</span>
        </div>
        <div class="preference-item">
          <span class="label">Tax Sensitivity:</span>
          <span class="value">{{ preferences.tax_sensitivity }}</span>
        </div>
        <div class="preference-item">
          <span class="label">Liquidity Needs:</span>
          <span class="value">{{ preferences.liquidity_needs }}</span>
        </div>
        <div class="preference-item">
          <span class="label">Return Consistency:</span>
          <span class="value">{{ preferences.past_returns_preference }}</span>
        </div>
      </div>
    </div>

    <!-- Comparison Results -->
    <div class="comparison-results">
      <h3>Detailed Comparison</h3>
      


      <!-- Detailed Analysis -->
      <div class="detailed-analysis">
        <h4>Detailed Analysis</h4>
        <div class="analysis-content" v-html="formattedAnalysis"></div>
      </div>

      <!-- Recommendation -->
      <div class="recommendation">
        <h4>Final Recommendation</h4>
        <div class="recommendation-content">
          <div class="recommendation-badge">
            <span class="recommended-fund">{{ recommendation.fund }}</span>
            <span class="recommendation-reason">{{ recommendation.reason }}</span>
          </div>
        </div>
      </div>
      

    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button @click="goBack" class="btn-secondary">Back to Questionnaire</button>
      <button @click="startNewComparison" class="btn-primary">Start New Comparison</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Extract data from route
const preferences = ref(route.query.preferences ? JSON.parse(route.query.preferences) : {})
const comparisonData = ref(route.query.comparison || '')

// Extract all funds dynamically (fund1, fund2, fund3, fund4)
const selectedFunds = computed(() => {
  const funds = []
  for (let i = 1; i <= 4; i++) {
    if (route.query[`fund${i}`]) {
      funds.push(route.query[`fund${i}`])
    }
  }
  return funds
})



const formattedAnalysis = computed(() => {
  // Display raw Perplexity response with basic formatting
  const rawText = comparisonData.value || 'No comparison data available'
  return rawText
    .replace(/###\s+(.*)/g, '<h4>$1</h4>')  // Convert ### to h4 headings
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Convert **text** to bold
    .replace(/\n/g, '<br>')  // Convert newlines to <br>
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')  // Convert tabs to spaces
})



// Parse markdown tables and convert to HTML
function parseMarkdownTables(text) {
  if (!text) return 'No comparison data available'
  
  // Split text into lines
  const lines = text.split('\n')
  let result = ''
  let inTable = false
  let tableHTML = ''
  let tableRows = []
  
  // Helper to strip citation-like markers such as [1], [2], [3]
  const stripCitations = (s) => s.replace(/\[\d+\]/g, '')
  
  for (let i = 0; i < lines.length; i++) {
    const line = stripCitations(lines[i].trim())
    
    // Check if this line starts a table (contains |)
    if (line.includes('|') && line.split('|').length > 2) {
      if (!inTable) {
        // Start of table
        inTable = true
        tableRows = []
      }
      tableRows.push(line)
    } else if (inTable) {
      // End of table, process it
      inTable = false
      tableHTML = convertTableToHTML(tableRows)
      result += tableHTML
      result += '<br><br>'
      tableRows = []
    }
    
    // If not in table, add line as regular text
    if (!inTable) {
      const headingMatch = line.match(/^###\s+(.*)/)
      if (headingMatch) {
        result += `<h4>${headingMatch[1]}</h4>`
      } else {
        result += line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>') + '<br>'
      }
    }
  }
  
  // Handle case where table is at the end
  if (inTable && tableRows.length > 0) {
    tableHTML = convertTableToHTML(tableRows)
    result += tableHTML
  }
  
  return result
}

// Convert markdown table rows to HTML table
function convertTableToHTML(tableRows) {
  if (tableRows.length < 2) return ''
  
  let html = '<div class="table-container"><table class="comparison-table">'
  const stripCitations = (s) => s.replace(/\[\d+\]/g, '')
  
  // Process each row
  tableRows.forEach((row, index) => {
    const cells = row.split('|').filter(cell => cell.trim())
    
    if (index === 0) {
      // Header row
      html += '<thead><tr>'
      cells.forEach(cell => {
        const cleanCell = stripCitations(cell.trim()).replace(/\*\*/g, '').replace(/\*/g, '')
        html += `<th>${cleanCell}</th>`
      })
      html += '</tr></thead>'
    } else if (index === 1) {
      // Separator row - skip
      return
    } else {
      // Data rows
      html += '<tr>'
      cells.forEach(cell => {
        const cleanCell = stripCitations(cell.trim())
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
        html += `<td>${cleanCell}</td>`
      })
      html += '</tr>'
    }
  })
  
  html += '</table></div>'
  return html
}

// Extract the actual recommendation from Perplexity response
function extractRecommendationFromResponse(response) {
  if (!response) {
    return {
      fund: 'No recommendation available',
      reason: 'Better aligned with your risk profile and investment timeline'
    }
  }
  
  // Get selected funds from computed property
  const funds = selectedFunds.value
  
  // Look for the new consistent format: "Recommendation: [Fund Name]"
  const recommendationMatch = response.match(/Recommendation:\s*(.+?)(?:\n|$)/i)
  
  let recommendedFund = 'Analysis complete'
  const fixedReason = 'Better aligned with your risk profile and investment timeline'
  
  if (recommendationMatch) {
    const extractedFundName = recommendationMatch[1].trim()
    
    // Check if the extracted fund name contains any of our selected funds
    for (let i = 0; i < funds.length; i++) {
      if (extractedFundName.toLowerCase().includes(funds[i].toLowerCase())) {
        recommendedFund = funds[i]
        break
      }
    }
    
    // If no match found, try to find the first occurrence
    if (recommendedFund === 'Analysis complete') {
      let firstIndex = -1
      let firstFund = ''
      
      for (let i = 0; i < funds.length; i++) {
        const fundIndex = response.toLowerCase().indexOf(funds[i].toLowerCase())
        if (fundIndex !== -1 && (firstIndex === -1 || fundIndex < firstIndex)) {
          firstIndex = fundIndex
          firstFund = funds[i]
        }
      }
      
      if (firstFund) {
        recommendedFund = firstFund
      }
    }
  } else {
    // Fallback: if no "Recommendation:" format found, search for first occurrence
    let firstIndex = -1
    let firstFund = ''
    
    for (let i = 0; i < funds.length; i++) {
      const fundIndex = response.toLowerCase().indexOf(funds[i].toLowerCase())
      if (fundIndex !== -1 && (firstIndex === -1 || fundIndex < firstIndex)) {
        firstIndex = fundIndex
        firstFund = funds[i]
      }
    }
    
    if (firstFund) {
      recommendedFund = firstFund
    }
  }
  
  return {
    fund: recommendedFund,
    reason: fixedReason
  }
}

const recommendation = computed(() => {
  // Extract recommendation from the actual Perplexity response
  return extractRecommendationFromResponse(comparisonData.value)
})

function goBack() {
  router.go(-1)
}

function startNewComparison() {
  router.push('/second')
}

onMounted(() => {
  console.log('Results page loaded with:', { funds: selectedFunds.value, preferences: preferences.value })
})
</script>

<style scoped>
.results-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

.results-header {
  text-align: center;
  margin-bottom: 30px;
}

.results-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.fund-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.fund-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
  min-width: 200px;
}

.fund-card h3 {
  color: #7f8c8d;
  margin-bottom: 10px;
  font-size: 1rem;
}

.fund-name {
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
}

.vs-divider {
  background: #42b983;
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.1rem;
}

.preferences-summary {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.preferences-summary h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.preferences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ecf0f1;
}

.preference-item:last-child {
  border-bottom: none;
}

.label {
  color: #7f8c8d;
  font-weight: 500;
}

.value {
  color: #2c3e50;
  font-weight: 600;
}

.comparison-results {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.comparison-results h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}



.detailed-analysis {
  margin-bottom: 30px;
}

.detailed-analysis h4 {
  color: #34495e;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.analysis-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  line-height: 1.6;
  color: #2c3e50;
  /* Mobile text improvements */
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  font-family: monospace;
  text-align: left;
}

.table-container {
  margin: 20px 0;
  overflow-x: auto;
  /* Mobile table improvements */
  -webkit-overflow-scrolling: touch;
  border-radius: 8px;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin: 15px 0;
}

.comparison-table th {
  background: #42b983;
  color: white;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 2px solid #369870;
}

.comparison-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
  vertical-align: top;
}

.comparison-table tr:nth-child(even) {
  background: #f8f9fa;
}

.comparison-table tr:hover {
  background: #e8f5e8;
}

.comparison-table strong {
  color: #2c3e50;
  font-weight: 600;
}

.comparison-table em {
  color: #7f8c8d;
  font-style: italic;
}

.recommendation {
  background: #e8f5e8;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #27ae60;
}

.recommendation h4 {
  color: #27ae60;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.recommendation-badge {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recommended-fund {
  font-size: 1.2rem;
  font-weight: 700;
  color: #27ae60;
}

.recommendation-reason {
  color: #2c3e50;
  line-height: 1.5;
}



.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-primary:hover {
  background: #369870;
}

.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-secondary:hover {
  background: #d5dbdb;
}

@media (max-width: 768px) {
  .results-container {
    padding: 15px;
  }
  
  .results-header h1 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  .results-header .subtitle {
    font-size: 0.9rem;
  }
  
  .fund-summary {
    flex-direction: column;
    gap: 15px;
  }
  
  .fund-card {
    padding: 15px;
    margin-bottom: 10px;
  }
  
  .fund-card h3 {
    font-size: 1rem;
  }
  
  .fund-name {
    font-size: 0.9rem;
    word-break: break-word;
  }
  
  .preferences-summary {
    padding: 15px;
  }
  
  .preferences-summary h3 {
    font-size: 1.1rem;
    margin-bottom: 15px;
  }
  
  .preferences-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .preference-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .preference-item .label {
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  .preference-item .value {
    font-size: 0.9rem;
  }
  
  .comparison-results {
    padding: 15px;
  }
  
  .comparison-results h3 {
    font-size: 1.1rem;
    margin-bottom: 15px;
  }
  
  .detailed-analysis {
    margin-bottom: 20px;
  }
  
  .detailed-analysis h4 {
    font-size: 1rem;
    margin-bottom: 12px;
  }
  
  .analysis-content {
    padding: 15px;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  .table-container {
    margin: 15px 0;
  }
  
  .comparison-table {
    font-size: 0.8rem;
    margin: 10px 0;
  }
  
  .comparison-table th,
  .comparison-table td {
    padding: 8px 6px;
    font-size: 0.8rem;
  }
  
  .recommendation {
    padding: 15px;
  }
  
  .recommendation h4 {
    font-size: 1rem;
    margin-bottom: 12px;
  }
  
  .recommendation-badge {
    gap: 8px;
  }
  
  .recommended-fund {
    font-size: 1.1rem;
  }
  
  .recommendation-reason {
    font-size: 0.9rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-top: 30px;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    max-width: 300px;
    padding: 15px 20px;
    font-size: 1rem;
  }
}

/* Extra small mobile devices */
@media (max-width: 480px) {
  .results-container {
    padding: 10px;
  }
  
  .results-header h1 {
    font-size: 1.3rem;
  }
  
  .fund-card {
    padding: 12px;
  }
  
  .preferences-summary,
  .comparison-results {
    padding: 12px;
  }
  
  .analysis-content {
    padding: 12px;
    font-size: 0.85rem;
  }
  
  .comparison-table th,
  .comparison-table td {
    padding: 6px 4px;
    font-size: 0.75rem;
  }
  
  .btn-primary, .btn-secondary {
    padding: 12px 16px;
    font-size: 0.9rem;
  }
}
</style> 