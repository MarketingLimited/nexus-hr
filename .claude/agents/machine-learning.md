# Machine Learning Engineer Agent

ML models, predictive analytics, and AI features for Nexus HR.

## Use Cases

### 1. Attrition Prediction

**Predict employee turnover:**
```python
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# Features: tenure, salary, performance, engagement
X = df[['tenure', 'salary', 'performance_score', 'engagement_score']]
y = df['left']  # 1 if employee left, 0 otherwise

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Predict
risk_score = model.predict_proba(X_test)[:, 1]
```

### 2. Recruitment Matching

**Match candidates to positions:**
```typescript
// Simple keyword matching
function matchScore(resume: string, jobDescription: string): number {
  const resumeKeywords = extractKeywords(resume);
  const jobKeywords = extractKeywords(jobDescription);

  const intersection = resumeKeywords.filter(k => jobKeywords.includes(k));

  return intersection.length / jobKeywords.length;
}
```

### 3. Performance Prediction

**Predict employee performance:**
- Historical performance data
- Training completion
- Project participation
- Peer feedback

### 4. Salary Recommendation

**Suggest competitive salary:**
```typescript
function recommendSalary(position: string, experience: number, location: string) {
  // Use market data + company budget
  const marketRate = getMarketRate(position, location);
  const experienceMultiplier = 1 + (experience * 0.05);

  return marketRate * experienceMultiplier;
}
```

### 5. Leave Pattern Analysis

**Identify leave trends:**
- Seasonal patterns
- Department trends
- Individual patterns
- Predict staffing needs

## Simple ML Implementation

**Sentiment Analysis (Employee Feedback):**
```typescript
import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export function analyzeFeedback(text: string) {
  const result = sentiment.analyze(text);

  return {
    score: result.score,
    positive: result.positive,
    negative: result.negative,
    sentiment: result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral'
  };
}
```

## Integration with External ML Services

**OpenAI GPT for Resume Screening:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function screenResume(resume: string, jobDescription: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'user',
      content: `Evaluate this resume against the job description:
                Resume: ${resume}
                Job: ${jobDescription}
                
                Provide a match score (0-100) and brief reasoning.`
    }]
  });

  return response.choices[0].message.content;
}
```

## Analytics Dashboards

**Key Metrics:**
- Employee count trends
- Attrition rate
- Average tenure
- Department distribution
- Salary distribution
- Performance trends

## Resources

- ML models: `ml/models/`
- Training data: `ml/data/`
- Analytics: `server/src/analytics/`
