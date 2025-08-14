const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  // Analyze text for emotions and sentiment
  async analyzeEmotion(text) {
    try {
      const prompt = `
        Analyze the following text for emotional content and provide:
        1. Primary emotion (anxiety, depression, stress, loneliness, grief, anger, fear, sadness, joy, hope, gratitude, confusion, overwhelm, peace, excitement, calm, or neutral)
        2. Sentiment (positive, negative, or neutral)
        3. Urgency level (low, medium, high, or crisis)
        4. Support type needed (listening, advice, encouragement, shared_experience, or general)
        
        Text: "${text}"
        
        Respond in JSON format:
        {
          "emotion": "primary_emotion",
          "sentiment": "sentiment",
          "urgency": "urgency_level",
          "supportType": "support_type",
          "confidence": 0.85
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();
      
      // Extract JSON from response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format from Gemini');
    } catch (error) {
      console.error('Gemini emotion analysis error:', error);
      return {
        emotion: 'neutral',
        sentiment: 'neutral',
        urgency: 'low',
        supportType: 'general',
        confidence: 0.5
      };
    }
  }

  // Generate response suggestions for support
  async generateResponseSuggestions(context, emotion, supportType) {
    try {
      const prompt = `
        You are a mental health support assistant. Based on the context and emotion, provide 3 supportive response suggestions.
        
        Context: "${context}"
        Emotion: ${emotion}
        Support Type: ${supportType}
        
        Guidelines:
        - Be empathetic and supportive
        - Avoid giving medical advice
        - Encourage professional help if needed
        - Keep responses under 100 words
        - Be encouraging and hopeful
        
        Respond with 3 suggestions in JSON format:
        {
          "suggestions": [
            "Suggestion 1",
            "Suggestion 2", 
            "Suggestion 3"
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();
      
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        suggestions: [
          "I hear you and I'm here to listen.",
          "That sounds really challenging. How are you feeling right now?",
          "You're not alone in this. Would you like to talk more about it?"
        ]
      };
    } catch (error) {
      console.error('Gemini response suggestions error:', error);
      return {
        suggestions: [
          "I hear you and I'm here to listen.",
          "That sounds really challenging. How are you feeling right now?",
          "You're not alone in this. Would you like to talk more about it?"
        ]
      };
    }
  }

  // Summarize chat conversation
  async summarizeChat(messages) {
    try {
      const conversationText = messages
        .map(msg => `${msg.senderAlias}: ${msg.content}`)
        .join('\n');

      const prompt = `
        Summarize this mental health support conversation in 2-3 sentences. Focus on:
        - Main topics discussed
        - Emotional themes
        - Support provided
        - Overall tone
        
        Conversation:
        ${conversationText}
        
        Provide a concise, empathetic summary.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini chat summarization error:', error);
      return 'A supportive conversation took place between peers.';
    }
  }

  // Detect crisis situations
  async detectCrisis(text) {
    try {
      const prompt = `
        Analyze this text for crisis indicators. Look for:
        - Suicidal thoughts or self-harm
        - Severe distress
        - Immediate danger
        - Emergency situations
        
        Text: "${text}"
        
        Respond with JSON:
        {
          "isCrisis": true/false,
          "crisisLevel": "low/medium/high/critical",
          "recommendations": ["recommendation1", "recommendation2"],
          "requiresImmediateAttention": true/false
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();
      
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        isCrisis: false,
        crisisLevel: 'low',
        recommendations: ['Continue monitoring the conversation'],
        requiresImmediateAttention: false
      };
    } catch (error) {
      console.error('Gemini crisis detection error:', error);
      return {
        isCrisis: false,
        crisisLevel: 'low',
        recommendations: ['Continue monitoring the conversation'],
        requiresImmediateAttention: false
      };
    }
  }

  // Generate matching suggestions based on emotions
  async suggestMatches(userEmotions, userInterests) {
    try {
      const prompt = `
        Based on these emotions and interests, suggest what kind of peer would be a good match for support:
        
        Emotions: ${userEmotions.join(', ')}
        Interests: ${userInterests.join(', ')}
        
        Suggest:
        1. Complementary emotions (emotions that would provide good support)
        2. Shared interests that could help with connection
        3. Support approach that would work best
        
        Respond in JSON:
        {
          "complementaryEmotions": ["emotion1", "emotion2"],
          "sharedInterests": ["interest1", "interest2"],
          "supportApproach": "description"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();
      
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        complementaryEmotions: ['hope', 'calm'],
        sharedInterests: userInterests.slice(0, 2),
        supportApproach: 'Active listening and emotional support'
      };
    } catch (error) {
      console.error('Gemini matching suggestions error:', error);
      return {
        complementaryEmotions: ['hope', 'calm'],
        sharedInterests: userInterests.slice(0, 2),
        supportApproach: 'Active listening and emotional support'
      };
    }
  }

  // Validate if the service is working
  async testConnection() {
    try {
      const result = await this.model.generateContent('Hello');
      return result.response.text() ? true : false;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }
}

module.exports = new GeminiService();
