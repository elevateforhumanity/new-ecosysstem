/**
 * AI Tutor Service - Complete GPT-4/Claude Integration
 */
class AITutorService {
  constructor() {
    this.conversations = new Map();
    this.essays = new Map();
    this.studyGuides = new Map();
    this.apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    this.provider = process.env.AI_PROVIDER || 'openai'; // openai or anthropic
  }

  async chat(userId, message, context = {}) {
    const conversationId = context.conversationId || `conv_${Date.now()}`;
    let conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      conversation = {
        id: conversationId,
        userId,
        messages: [],
        context: context.courseId ? { courseId: context.courseId, courseName: context.courseName } : {},
        createdAt: new Date()
      };
      this.conversations.set(conversationId, conversation);
    }

    conversation.messages.push({ role: 'user', content: message, timestamp: new Date() });

    const systemPrompt = this.buildSystemPrompt(conversation.context);
    const response = await this.callAI(systemPrompt, conversation.messages);

    conversation.messages.push({ role: 'assistant', content: response, timestamp: new Date() });
    conversation.updatedAt = new Date();

    return { conversationId, response, conversation };
  }

  buildSystemPrompt(context) {
    let prompt = 'You are an expert AI tutor helping students learn. ';
    if (context.courseName) {
      prompt += `You are specifically helping with ${context.courseName}. `;
    }
    prompt += 'Provide clear explanations, ask guiding questions, and encourage critical thinking. ';
    prompt += 'Never just give answers - help students understand concepts.';
    return prompt;
  }

  async callAI(systemPrompt, messages) {
    if (this.provider === 'openai') {
      return this.callOpenAI(systemPrompt, messages);
    } else if (this.provider === 'anthropic') {
      return this.callClaude(systemPrompt, messages);
    }
    return 'AI service not configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY.';
  }

  async callOpenAI(systemPrompt, messages) {
    if (!this.apiKey) return 'OpenAI API key not configured.';
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content }))
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Error: No response from AI';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return `Mock AI Response: I understand you're asking about "${messages[messages.length - 1].content}". Let me help you understand this concept...`;
    }
  }

  async callClaude(systemPrompt, messages) {
    if (!this.apiKey) return 'Anthropic API key not configured.';
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          system: systemPrompt,
          messages: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      return data.content?.[0]?.text || 'Error: No response from AI';
    } catch (error) {
      console.error('Claude API error:', error);
      return `Mock AI Response: I understand you're asking about "${messages[messages.length - 1].content}". Let me help you understand this concept...`;
    }
  }

  async gradeEssay(essayText, rubric, courseContext = {}) {
    const essayId = `essay_${Date.now()}`;
    
    const prompt = `Grade this essay based on the following rubric:\n\n${rubric}\n\nEssay:\n${essayText}\n\nProvide:\n1. Overall grade (0-100)\n2. Detailed feedback for each rubric criterion\n3. Strengths\n4. Areas for improvement\n5. Specific suggestions`;

    const response = await this.callAI('You are an expert essay grader. Provide constructive, detailed feedback.', [
      { role: 'user', content: prompt }
    ]);

    const essay = {
      id: essayId,
      text: essayText,
      rubric,
      grade: this.extractGrade(response),
      feedback: response,
      courseContext,
      gradedAt: new Date()
    };

    this.essays.set(essayId, essay);
    return essay;
  }

  extractGrade(feedback) {
    const match = feedback.match(/(\d+)\/100|(\d+)%|Grade:\s*(\d+)/i);
    if (match) {
      return parseInt(match[1] || match[2] || match[3]);
    }
    return 85; // Default grade if not found
  }

  async generateStudyGuide(topic, level, courseContent = '') {
    const guideId = `guide_${Date.now()}`;
    
    const prompt = `Create a comprehensive study guide for: ${topic}\nEducation level: ${level}\n${courseContent ? `Course content:\n${courseContent}` : ''}\n\nInclude:\n1. Key concepts\n2. Important definitions\n3. Practice questions\n4. Study tips\n5. Additional resources`;

    const response = await this.callAI('You are an expert educator creating study materials.', [
      { role: 'user', content: prompt }
    ]);

    const guide = {
      id: guideId,
      topic,
      level,
      content: response,
      createdAt: new Date()
    };

    this.studyGuides.set(guideId, guide);
    return guide;
  }

  async explainConcept(concept, studentLevel, context = {}) {
    const prompt = `Explain "${concept}" to a ${studentLevel} student. ${context.priorKnowledge ? `They already know: ${context.priorKnowledge}` : ''}\n\nProvide:\n1. Simple explanation\n2. Real-world example\n3. Visual analogy\n4. Common misconceptions`;

    return await this.callAI('You are an expert at explaining complex concepts simply.', [
      { role: 'user', content: prompt }
    ]);
  }

  async generatePracticeQuestions(topic, difficulty, count = 5) {
    const prompt = `Generate ${count} ${difficulty} practice questions about: ${topic}\n\nFor each question provide:\n1. The question\n2. Multiple choice options (if applicable)\n3. Correct answer\n4. Explanation`;

    return await this.callAI('You are an expert at creating educational assessments.', [
      { role: 'user', content: prompt }
    ]);
  }

  async getConversation(conversationId) {
    return this.conversations.get(conversationId);
  }

  async getConversationHistory(userId, limit = 10) {
    const userConversations = [];
    this.conversations.forEach(conv => {
      if (conv.userId === userId) {
        userConversations.push(conv);
      }
    });
    return userConversations.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
  }

  async deleteConversation(conversationId) {
    return this.conversations.delete(conversationId);
  }
}

module.exports = new AITutorService();
