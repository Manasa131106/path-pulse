import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzePulse(
  mood: string, 
  stress: string, 
  motivation: string, 
  last5Moods: string[], 
  completionRate: number
) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze a student's emotional state and detect burnout.
    Current State: Mood: ${mood}, Stress: ${stress}, Motivation: ${motivation}. 
    Last 5 Moods: ${last5Moods.join(", ")}
    Task Completion Rate: ${completionRate}%
    
    Logic:
    - Detect 'Burnout' if: Stress is High AND Completion Rate is < 40% AND Motivation is Low.
    - Detect 'Warning' if: Stress is Medium/High OR Completion Rate is < 60% OR Motivation is Medium/Low.
    - Otherwise: 'Normal'.
    
    Provide a JSON response with:
    - analysis (short summary)
    - suggestion (practical step)
    - motivation (one sentence)
    - burnoutRisk (0-100 number)
    - status (Normal / Warning / Burnout)
    - recommendation (reduce tasks / maintain / push harder)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          suggestion: { type: Type.STRING },
          motivation: { type: Type.STRING },
          burnoutRisk: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ["Normal", "Warning", "Burnout"] },
          recommendation: { type: Type.STRING, enum: ["reduce tasks", "maintain", "push harder"] }
        },
        required: ["analysis", "suggestion", "motivation", "burnoutRisk", "status", "recommendation"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function generateAdaptiveTasks(
  educationLevel: string,
  interests: string,
  currentProgress: number,
  lastCompletedTasks: string[]
) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate exactly 5 specific daily tasks for a student.
    - Education Level: ${educationLevel}
    - Interests: ${interests}
    - Current Progress: ${currentProgress}%
    - Last 3 Completed Tasks: ${lastCompletedTasks.join(", ")}
    
    Constraints:
    1. Tasks must be highly specific to the education level and interests.
    2. NO generic tasks (e.g., "study hard", "read more").
    3. Each task MUST be maximum 10 words.
    4. Difficulty must adapt: 
       - If progress < 30%: Easy/Medium tasks.
       - If progress > 70%: Hard/Challenging tasks.
    
    Provide a JSON array of 5 objects with:
    - text (string, max 10 words)
    - category (string: Career, Skill, Interest, or Mindfulness)
    - difficulty (string: Easy, Medium, or Hard)
    - aiReasoning (string: short explanation of why this fits)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["Career", "Skill", "Interest", "Mindfulness"] },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
            aiReasoning: { type: Type.STRING }
          },
          required: ["text", "category", "difficulty", "aiReasoning"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
}

export async function generateDashboardInsights(user: any, tasks: any[], pulse: any) {
  const isBurnout = user?.burnoutStatus?.level === 'High';
  const isConsistent = tasks.filter(t => t.completed).length > 5;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide high-level dashboard insights for a student.
    User: ${JSON.stringify(user)}
    Tasks: ${JSON.stringify(tasks)}
    Current Pulse: ${JSON.stringify(pulse)}
    Context: ${isBurnout ? 'User is experiencing BURNOUT.' : isConsistent ? 'User is being CONSISTENT.' : 'User is in a normal state.'}
    
    Logic:
    - If burnout: Recommend reducing tasks and focusing on rest.
    - If consistent: Recommend increasing difficulty or taking on a new challenge.
    
    Provide a JSON response with:
    - summary (overall progress summary)
    - nextBigMove (what they should focus on next)
    - burnoutAlert (optional warning if risk is high)
    - recommendedAction (specific action: "reduce tasks", "maintain", or "increase difficulty")`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          nextBigMove: { type: Type.STRING },
          burnoutAlert: { type: Type.STRING },
          recommendedAction: { type: Type.STRING, enum: ["reduce tasks", "maintain", "increase difficulty"] }
        },
        required: ["summary", "nextBigMove", "recommendedAction"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function generateInitialRoadmap(profile: any) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a personalized career roadmap and identify skill gaps for a student.
    Profile: ${JSON.stringify(profile)}
    
    Provide a JSON response with:
    - roadmapTitle (string)
    - roadmapSteps (array of objects with title, description)
    - skillGaps (array of strings)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          roadmapTitle: { type: Type.STRING },
          roadmapSteps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "description"]
            }
          },
          skillGaps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["roadmapTitle", "roadmapSteps", "skillGaps"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function generateWeeklyInsights(
  weeklyCompletion: any[], 
  moodHistory: any[], 
  streak: number
) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate weekly insights for a student.
    Weekly Task Completion: ${JSON.stringify(weeklyCompletion)}
    Mood History: ${JSON.stringify(moodHistory)}
    Current Streak: ${streak} days
    
    Provide a JSON response with:
    - consistencyScore (0-100)
    - emotionalTrend (string: e.g., "Improving", "Stable", "Declining")
    - improvementSuggestion (one practical, AI-driven suggestion)
    - weeklySummary (short paragraph summarizing the week)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          consistencyScore: { type: Type.NUMBER },
          emotionalTrend: { type: Type.STRING },
          improvementSuggestion: { type: Type.STRING },
          weeklySummary: { type: Type.STRING }
        },
        required: ["consistencyScore", "emotionalTrend", "improvementSuggestion", "weeklySummary"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}
