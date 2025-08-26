<template>
  <div class="results-container">
    <div class="results-header">
      <h1>Fund Comparison Results</h1>
      <p class="subtitle">Detailed analysis based on your investment preferences</p>
    </div>

    <!-- Fund Selection Summary -->
    <div class="fund-summary">
      <div class="fund-card">
        <h3>Fund A</h3>
        <p class="fund-name">{{ fund1 }}</p>
      </div>
      <div class="vs-divider">
        <span>VS</span>
      </div>
      <div class="fund-card">
        <h3>Fund B</h3>
        <p class="fund-name">{{ fund2 }}</p>
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
      
      <!-- Key Metrics Table -->
      <div class="metrics-table">
        <h4>Key Performance Metrics</h4>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>{{ fund1 }}</th>
              <th>{{ fund2 }}</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="metric in keyMetrics" :key="metric.name">
              <td class="metric-name">{{ metric.name }}</td>
              <td class="fund-a-value">{{ metric.fundA }}</td>
              <td class="fund-b-value">{{ metric.fundB }}</td>
              <td class="winner">
                <span :class="['winner-badge', metric.winner]">
                  {{ metric.winner === 'fundA' ? 'Fund A' : metric.winner === 'fundB' ? 'Fund B' : 'Tie' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
const fund1 = ref(route.query.fund1 || 'Fund A')
const fund2 = ref(route.query.fund2 || 'Fund B')
const preferences = ref(route.query.preferences ? JSON.parse(route.query.preferences) : {})
const comparisonData = ref(route.query.comparison || '')

// Parse comparison data to extract key metrics
const keyMetrics = computed(() => {
  // This is a placeholder - you'll need to parse the actual Perplexity response
  return [
    { name: 'Historical Returns', fundA: '12.5%', fundB: '15.2%', winner: 'fundB' },
    { name: 'Risk (Std Dev)', fundA: '8.2%', fundB: '12.1%', winner: 'fundA' },
    { name: 'Sharpe Ratio', fundA: '1.52', fundB: '1.25', winner: 'fundA' },
    { name: 'Expense Ratio', fundA: '1.2%', fundB: '1.8%', winner: 'fundA' },
    { name: 'Fund Age', fundA: '15 years', fundB: '8 years', winner: 'fundA' }
  ]
})

const formattedAnalysis = computed(() => {
  // Parse markdown tables and format the Perplexity response
  return parseMarkdownTables(comparisonData.value)
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
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
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
  
  // Process each row
  tableRows.forEach((row, index) => {
    const cells = row.split('|').filter(cell => cell.trim())
    
    if (index === 0) {
      // Header row
      html += '<thead><tr>'
      cells.forEach(cell => {
        const cleanCell = cell.trim().replace(/\*\*/g, '').replace(/\*/g, '')
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
        const cleanCell = cell.trim()
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
  
  // Extract fund names from the route
  const fund1Name = fund1.value
  const fund2Name = fund2.value
  
  // Look for the new consistent format: "Recommendation: [Fund Name]"
  const recommendationMatch = response.match(/Recommendation:\s*(.+?)(?:\n|$)/i)
  
  let recommendedFund = 'Analysis complete'
  const fixedReason = 'Better aligned with your risk profile and investment timeline'
  
  if (recommendationMatch) {
    const extractedFundName = recommendationMatch[1].trim()
    
    // Check if the extracted fund name contains either of our fund names
    if (extractedFundName.toLowerCase().includes(fund1Name.toLowerCase())) {
      recommendedFund = fund1Name
    } else if (extractedFundName.toLowerCase().includes(fund2Name.toLowerCase())) {
      recommendedFund = fund2Name
    } else {
      // If the extracted name doesn't match exactly, try to find the first occurrence
      const fund1Index = response.toLowerCase().indexOf(fund1Name.toLowerCase())
      const fund2Index = response.toLowerCase().indexOf(fund2Name.toLowerCase())
      
      if (fund1Index !== -1 && fund2Index !== -1) {
        recommendedFund = fund1Index < fund2Index ? fund1Name : fund2Name
      } else if (fund1Index !== -1) {
        recommendedFund = fund1Name
      } else if (fund2Index !== -1) {
        recommendedFund = fund2Name
      }
    }
  } else {
    // Fallback: if no "Recommendation:" format found, search for first occurrence
    const fund1Index = response.toLowerCase().indexOf(fund1Name.toLowerCase())
    const fund2Index = response.toLowerCase().indexOf(fund2Name.toLowerCase())
    
    if (fund1Index !== -1 && fund2Index !== -1) {
      recommendedFund = fund1Index < fund2Index ? fund1Name : fund2Name
    } else if (fund1Index !== -1) {
      recommendedFund = fund1Name
    } else if (fund2Index !== -1) {
      recommendedFund = fund2Name
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
  console.log('Results page loaded with:', { fund1: fund1.value, fund2: fund2.value, preferences: preferences.value })
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
  gap: 30px;
  margin-bottom: 40px;
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

.metrics-table {
  margin-bottom: 30px;
}

.metrics-table h4 {
  color: #34495e;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

th {
  background: #42b983;
  color: white;
  font-weight: 600;
}

.metric-name {
  font-weight: 600;
  color: #2c3e50;
}

.fund-a-value, .fund-b-value {
  text-align: center;
  font-weight: 500;
}

.winner {
  text-align: center;
}

.winner-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.winner-badge.fundA {
  background: #e8f5e8;
  color: #27ae60;
}

.winner-badge.fundB {
  background: #e8f5e8;
  color: #27ae60;
}

.winner-badge.tie {
  background: #fef9e7;
  color: #f39c12;
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
}

.table-container {
  margin: 20px 0;
  overflow-x: auto;
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
  .fund-summary {
    flex-direction: column;
    gap: 20px;
  }
  
  .preferences-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style> 