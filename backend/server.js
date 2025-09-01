const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', // Vue dev server
    'http://localhost:3000', // Local development
    'https://my-vue-app-mocha-delta.vercel.app', // Your Vercel domain (update this)
    'https://yourdomain.com', // Your custom domain (update this)
    'https://www.yourdomain.com' // Your custom domain with www (update this)
  ],
  credentials: true
}))
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Perplexity API proxy endpoint
app.post('/api/compare-funds', async (req, res) => {
  try {
    const { preferences, ...fundData } = req.body

    // Extract fund names dynamically (fund1, fund2, fund3, fund4)
    const funds = []
    for (let i = 1; i <= 4; i++) {
      if (fundData[`fund${i}`]) {
        funds.push(fundData[`fund${i}`])
      }
    }

    // Validate input - need at least 2 funds
    if (funds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 fund names are required'
      })
    }

    // Generate prompt
    const prompt = generatePrompt(funds, preferences)

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            "role": "system",
            "content": "You are an expert financial analyst assistant. Provide detailed, objective, and concise comparisons of multiple mutual funds (2-4 funds) based on user-defined investment preferences. Use bullet points or tables for clarity, cover all requested metrics, and conclude with a recommendation that clearly explains which fund aligns best with the user's profile."
          },
          {
            "role": "user",
            "content": prompt
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    res.json({
      success: true,
      comparison: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    })

  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate comparison',
      details: error.message
    })
  }
})

function generatePrompt(funds, preferences) {
  // Create fund labels dynamically
  const fundLabels = funds.map((fund, index) => {
    const label = String.fromCharCode(65 + index) // A, B, C, D
    return `Fund ${label}: ${fund}`
  }).join('\n')

  return `Compare the following ${funds.length} mutual funds based on the user's investment preferences:

${fundLabels}

User's preferences:
- Investment Time Horizon: ${preferences.time_horizon || 'Not specified'}
- Risk Appetite: ${preferences.risk_appetite || 'Not specified'}
- Return vs Stability Preference (0–100): ${preferences.returns_vs_stability || 'Not specified'}
- Tax Sensitivity: ${preferences.tax_sensitivity || 'Not specified'}
- Liquidity Needs: ${preferences.liquidity_needs || 'Not specified'}
- Preference on Return Consistency: ${preferences.past_returns_preference || 'Not specified'}
- Fund Age Preference: ${preferences.fund_age_bias || 'Not specified'}
- AUM Size Preference: ${preferences.fund_size_preference || 'Not specified'}
- Importance of Fund Manager Experience: ${preferences.fund_manager_experience || 'Not specified'}
- Volatility Tolerance: ${preferences.volatility_tolerance || 'Not specified'}

Please provide a detailed comparison based on these criteria. Include points like historical returns, risk measures (standard deviation, Sharpe ratio), tax efficiency, fund age, AUM, fund manager experience, and overall suitability for the user's profile.

Be concise and use bullet points or tables if needed. 

IMPORTANT: End your analysis with a clear recommendation in this exact format:
"Recommendation: [Fund Name]"

Where [Fund Name] should be one of the following funds: ${funds.join(', ')} based on which fund better aligns with the user's preferences.`
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 