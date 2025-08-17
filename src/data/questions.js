export const questions = [
  {
    "id": "time_horizon",
    "question": "What is your intended investment time horizon?",
    "type": "single_choice",
    "options": [
      "Less than 1 year",
      "1 to 3 years",
      "3 to 5 years",
      "More than 5 years"
    ]
  },
  {
    "id": "risk_appetite",
    "question": "How would you describe your risk appetite?",
    "type": "single_choice",
    "options": [
      "Low (Prefer stability, can't afford losses)",
      "Moderate (Balanced growth and safety)",
      "High (Willing to take more risk for higher returns)",
      "Very High (Aggressive, focused on long-term high growth)"
    ]
  },
  {
    "id": "returns_vs_stability",
    "question": "What do you value more in a mutual fund?",
    "type": "slider",
    "range": {
      "min": 0,
      "max": 100,
      "labelMin": "Stability",
      "labelMax": "Returns",
      "default": 50
    }
  },
  {
    "id": "tax_sensitivity",
    "question": "Are you concerned about tax efficiency of your investment?",
    "type": "single_choice",
    "options": [
      "Not important",
      "Somewhat important",
      "Very important"
    ]
  },
  {
    "id": "liquidity_needs",
    "question": "How likely are you to withdraw money from this investment within the next 3 years?",
    "type": "single_choice",
    "options": [
      "Very likely",
      "Somewhat likely",
      "Unlikely",
      "Definitely not"
    ]
  },
  {
    "id": "past_returns_preference",
    "question": "Would you prefer a fund with consistent returns over the years or one with high peaks and drops?",
    "type": "single_choice",
    "options": [
      "Consistent moderate returns",
      "Occasional high returns, even with some drops",
      "Doesn't matter"
    ]
  },
  {
    "id": "fund_age_bias",
    "question": "Do you prefer investing in older funds with long performance history or newer funds with recent growth?",
    "type": "single_choice",
    "options": [
      "Older, proven funds",
      "Newer, high-growth potential",
      "No preference"
    ]
  },
  {
    "id": "fund_size_preference",
    "question": "What's your comfort level with the size of the fund's Assets Under Management (AUM)?",
    "type": "single_choice",
    "options": [
      "Large AUM (more stable)",
      "Medium AUM (balanced)",
      "Small AUM (more agile)",
      "No preference"
    ]
  },
  {
    "id": "fund_manager_experience",
    "question": "Is the experience of the fund manager important to you?",
    "type": "single_choice",
    "options": [
      "Very important",
      "Somewhat important",
      "Not important"
    ]
  },
  {
    "id": "volatility_tolerance",
    "question": "How comfortable are you with fluctuations in your investment value (volatility)?",
    "type": "single_choice",
    "options": [
      "I prefer minimal ups and downs",
      "Some volatility is okay for better returns",
      "I'm okay with high volatility if it means higher growth",
      "Doesn't matter to me"
    ]
  }
] 