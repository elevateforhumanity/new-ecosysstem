/**
 * Copilot Integration - Add to existing site
 * Integrates conversational AI and business management into current platform
 */

class CopilotIntegration {
  constructor() {
    this.isInitialized = false;
    this.activeCopilot = 'onboarding_copilot';
    this.userProfile = {};
    this.businessConfig = {};
    this.conversationHistory = [];
    this.init();
  }

  init() {
    console.log('🤖 Integrating Copilot into existing site...');
    this.injectCopilotInterface();
    this.setupConversationalFlow();
    this.addBusinessManagementLayer();
    this.enhanceExistingPages();
    console.log('✅ Copilot integration complete');
  }

  injectCopilotInterface() {
    // Create floating copilot interface
    const copilotHTML = `
      <div id="copilot-interface" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform: translateY(450px);
        transition: transform 0.3s ease;
      ">
        <!-- Copilot Header -->
        <div class="copilot-header" style="
          background: rgba(255,255,255,0.1);
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          cursor: pointer;
        " onclick="this.parentElement.style.transform = this.parentElement.style.transform.includes('450px') ? 'translateY(0)' : 'translateY(450px)'">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              🤖
            </div>
            <div>
              <div style="font-weight: bold;" id="active-copilot-name">Alex</div>
              <div style="font-size: 12px; opacity: 0.8;" id="copilot-role">Business Setup Assistant</div>
            </div>
          </div>
          <div style="font-size: 20px;">💬</div>
        </div>

        <!-- Copilot Switcher -->
        <div class="copilot-switcher" style="
          background: rgba(255,255,255,0.05);
          padding: 10px;
          display: flex;
          gap: 5px;
          overflow-x: auto;
        ">
          <button class="copilot-btn active" data-copilot="onboarding" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 11px;
            cursor: pointer;
            white-space: nowrap;
          ">Setup</button>
          <button class="copilot-btn" data-copilot="hr" style="
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 11px;
            cursor: pointer;
            white-space: nowrap;
          ">HR</button>
          <button class="copilot-btn" data-copilot="payroll" style="
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 11px;
            cursor: pointer;
            white-space: nowrap;
          ">Payroll</button>
          <button class="copilot-btn" data-copilot="hiring" style="
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 11px;
            cursor: pointer;
            white-space: nowrap;
          ">Hiring</button>
          <button class="copilot-btn" data-copilot="training" style="
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 11px;
            cursor: pointer;
            white-space: nowrap;
          ">Training</button>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages" style="
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          color: white;
        " id="chat-messages">
          <div class="message copilot-message" style="
            background: rgba(255,255,255,0.1);
            padding: 12px;
            border-radius: 15px;
            margin-bottom: 10px;
          ">
            <div style="font-weight: bold; margin-bottom: 5px;">Alex (Setup Assistant)</div>
            <div>Hi! I'm Alex, your business copilot. I'll help you set up this platform specifically for your business needs. What type of business do you run?</div>
            <div style="margin-top: 10px; display: flex; flex-wrap: gap; gap: 5px;">
              <button class="quick-reply" onclick="copilotIntegration.sendMessage('Technology company')" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 10px;
                font-size: 11px;
                cursor: pointer;
              ">Technology</button>
              <button class="quick-reply" onclick="copilotIntegration.sendMessage('Healthcare business')" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 10px;
                font-size: 11px;
                cursor: pointer;
              ">Healthcare</button>
              <button class="quick-reply" onclick="copilotIntegration.sendMessage('I need to hire people')" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 10px;
                font-size: 11px;
                cursor: pointer;
              ">Need Hiring</button>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="chat-input" style="
          padding: 15px;
          background: rgba(255,255,255,0.1);
          display: flex;
          gap: 10px;
        ">
          <input type="text" id="chat-input" placeholder="Type your message..." style="
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 20px;
            background: rgba(255,255,255,0.2);
            color: white;
            outline: none;
          " onkeypress="if(event.key==='Enter') copilotIntegration.sendMessage(this.value)">
          <button onclick="copilotIntegration.sendMessage(document.getElementById('chat-input').value)" style="
            background: rgba(255,255,255,0.3);
            border: none;
            color: white;
            padding: 10px 15px;
            border-radius: 50%;
            cursor: pointer;
          ">📤</button>
        </div>
      </div>
    `;

    // Inject into existing site
    document.body.insertAdjacentHTML('beforeend', copilotHTML);
    this.setupCopilotEventListeners();
    this.setupInterviewAssessment();
  }

  setupCopilotEventListeners() {
    // Copilot switcher
    document.querySelectorAll('.copilot-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.copilot-btn').forEach(b => {
          b.style.background = 'rgba(255,255,255,0.1)';
          b.classList.remove('active');
        });
        e.target.style.background = 'rgba(255,255,255,0.2)';
        e.target.classList.add('active');
        this.switchCopilot(e.target.dataset.copilot);
      });
    });

    // Auto-expand on first visit
    setTimeout(() => {
      if (!localStorage.getItem('copilot_seen')) {
        document.getElementById('copilot-interface').style.transform = 'translateY(0)';
        localStorage.setItem('copilot_seen', 'true');
      }
    }, 2000);
  }

  setupConversationalFlow() {
    this.copilots = {
      onboarding: {
        name: "Alex",
        role: "Business Setup Assistant",
        responses: {
          "technology company": "Great! I'll configure this platform for a tech business. How many employees do you have?",
          "healthcare business": "Perfect! Healthcare businesses have specific compliance needs. I'll set that up. How many employees?",
          "education/training": "Excellent! I'll enable student management and codebase cloning features. How many students do you train?",
          "default": "I understand. Let me help you set up the platform. How many people work in your business?"
        },
        followUp: {
          "employees": "Now, what's your biggest challenge? Finding talent, managing payroll, training staff, or growing revenue?",
          "students": "Do you also need to manage business operations like payroll and hiring for your staff?"
        }
      },
      
      hr: {
        name: "Sarah",
        role: "HR Manager",
        responses: {
          "onboarding": "I'll help you create smooth employee onboarding. What information do you collect from new hires?",
          "performance": "Let's set up performance reviews. How often do you evaluate employees?",
          "compliance": "I'll ensure you're compliant. What industry regulations do you need to follow?",
          "default": "I handle all HR matters. What do you need help with - onboarding, performance, or compliance?"
        }
      },
      
      payroll: {
        name: "Marcus", 
        role: "Payroll Specialist",
        responses: {
          "setup": "I'll configure payroll processing. Are your employees hourly, salary, or both?",
          "taxes": "I'll handle tax calculations. What state are you in for tax purposes?",
          "benefits": "Let's set up benefits. Do you offer health insurance, retirement plans, or PTO?",
          "default": "I manage all payroll and benefits. What do you need - setup, tax help, or benefits administration?"
        }
      },
      
      hiring: {
        name: "Jordan",
        role: "Talent Acquisition",
        responses: {
          "posting": "I'll help you post jobs. What position are you hiring for?",
          "screening": "I'll set up candidate screening with intelligent skill assessment. What skills are most important for this role?",
          "interviewing": "I'll conduct first interviews with real-time skill testing. Candidates who score 85%+ automatically advance to second interviews. Ready to start?",
          "assessment": "I'll test their skills during the first interview and automatically decide if they advance. What position are you interviewing for?",
          "skills": "I can assess technical skills, problem-solving, communication, and role-specific abilities in real-time during interviews.",
          "default": "I help you find great talent with intelligent skill assessment. I test candidates during first interviews and automatically advance qualified ones. What do you need?"
        }
      },
      
      training: {
        name: "Dr. Kim",
        role: "Learning Coordinator", 
        responses: {
          "students": "I'll set up student management. What programming languages or skills do you teach?",
          "codebase": "I'll clone codebases for each student. What type of projects do they work on?",
          "progress": "I'll track student progress. How do you currently assess their learning?",
          "default": "I manage student learning and code environments. Do you need student setup, codebase cloning, or progress tracking?"
        }
      }
    };
  }

  sendMessage(message) {
    if (!message.trim()) return;
    
    // Add user message
    this.addMessageToChat('user', message);
    
    // Clear input
    document.getElementById('chat-input').value = '';
    
    // Process message and get response
    setTimeout(() => {
      const response = this.processMessage(message);
      this.addMessageToChat('copilot', response);
    }, 1000);
  }

  addMessageToChat(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    if (sender === 'user') {
      messageDiv.style.cssText = `
        background: rgba(255,255,255,0.2);
        padding: 10px;
        border-radius: 15px;
        margin-bottom: 10px;
        margin-left: 20px;
        text-align: right;
      `;
      messageDiv.innerHTML = message;
    } else {
      const copilot = this.getCurrentCopilot();
      messageDiv.style.cssText = `
        background: rgba(255,255,255,0.1);
        padding: 12px;
        border-radius: 15px;
        margin-bottom: 10px;
      `;
      messageDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">${copilot.name} (${copilot.role})</div>
        <div>${message}</div>
      `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  processMessage(message) {
    const copilot = this.getCurrentCopilot();
    const lowerMessage = message.toLowerCase();
    
    // Check for Wix Studio requests first
    if (lowerMessage.includes('wix') || lowerMessage.includes('studio') || 
        lowerMessage.includes('landing page') || lowerMessage.includes('website') ||
        lowerMessage.includes('design')) {
      return this.handleWixStudioRequest(message);
    }
    
    // Simple keyword matching for demo
    for (const [key, response] of Object.entries(copilot.responses)) {
      if (lowerMessage.includes(key) || key === 'default') {
        return response;
      }
    }
    
    return copilot.responses.default;
  }

  handleWixStudioRequest(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('wix') && lowerMessage.includes('studio')) {
      return "🎨 I can access Wix Studio through dev mode and build your page automatically! I'll navigate to your Wix dashboard, enter dev mode, find the studio, and create a professional layout. What type of business page do you need?";
    }
    
    if (lowerMessage.includes('landing page')) {
      return "🚀 Perfect! I'll access Wix Studio and build a high-converting landing page for you. I can create the layout, add sections, apply professional design, and optimize for conversions. Tell me about your business - what industry and what's your main goal?";
    }
    
    if (lowerMessage.includes('website')) {
      return "🌐 I'll create a complete website in Wix Studio! I can access dev mode, build multiple pages, set up navigation, and apply professional branding. What type of business website do you need?";
    }
    
    if (lowerMessage.includes('design')) {
      return "🎨 I'll design and build your page in Wix Studio automatically! I can access the studio interface, place elements, apply design systems, and optimize for mobile. What's your business focus?";
    }
    
    return "🎯 I can help you build amazing pages in Wix Studio! I'll access dev mode, find the studio, and create professional layouts automatically. What would you like me to build?";
  }

  switchCopilot(copilotType) {
    this.activeCopilot = copilotType;
    const copilot = this.copilots[copilotType];
    
    // Update header
    document.getElementById('active-copilot-name').textContent = copilot.name;
    document.getElementById('copilot-role').textContent = copilot.role;
    
    // Add introduction message
    const introMessage = `Hi! I'm ${copilot.name}, your ${copilot.role}. ${copilot.responses.default}`;
    this.addMessageToChat('copilot', introMessage);
  }

  getCurrentCopilot() {
    return this.copilots[this.activeCopilot] || this.copilots.onboarding;
  }

  setupInterviewAssessment() {
    // Add interview assessment capabilities
    this.interviewAssessment = {
      activeInterview: null,
      skillTests: new Map(),
      realTimeScoring: {},
      
      startSkillAssessment: (position, candidateName) => {
        this.interviewAssessment.activeInterview = {
          position,
          candidateName,
          startTime: new Date(),
          scores: {},
          responses: []
        };
        
        return this.generateSkillTestQuestions(position);
      },
      
      scoreResponse: (response, expectedAnswer) => {
        const score = this.calculateSkillScore(response, expectedAnswer);
        this.interviewAssessment.realTimeScoring.currentScore = score;
        
        // Check if candidate should advance
        if (score >= 85) {
          return {
            advance: true,
            message: "Excellent! You're automatically advancing to the second interview.",
            confidence: "HIGH"
          };
        } else if (score >= 70) {
          return {
            advance: "conditional",
            message: "Good performance. Manager review required for advancement.",
            confidence: "MEDIUM"
          };
        } else {
          return {
            advance: false,
            message: "Thank you for your time. We'll provide feedback for future opportunities.",
            confidence: "LOW"
          };
        }
      }
    };
  }

  generateSkillTestQuestions(position) {
    const skillTests = {
      "software developer": [
        "Write a function to reverse a string without using built-in methods",
        "Explain the difference between let, const, and var in JavaScript",
        "How would you optimize a slow database query?",
        "Debug this code: function add(a, b) { return a + b; } add('5', 3)"
      ],
      "data analyst": [
        "Write a SQL query to find the top 5 customers by revenue",
        "How would you handle missing data in a dataset?",
        "Explain the difference between correlation and causation",
        "Design a dashboard for tracking sales performance"
      ],
      "project manager": [
        "How would you handle a project that's 2 weeks behind schedule?",
        "Describe your approach to managing conflicting stakeholder priorities",
        "Create a project plan for launching a new product feature",
        "How do you ensure effective team communication?"
      ],
      "sales representative": [
        "Sell me this pen (role-play scenario)",
        "How would you handle a customer objection about price?",
        "Describe your process for qualifying leads",
        "How do you maintain relationships with existing customers?"
      ]
    };
    
    return skillTests[position.toLowerCase()] || [
      "Tell me about your relevant experience for this role",
      "How do you handle challenging situations?",
      "What are your strengths and areas for improvement?",
      "Why are you interested in this position?"
    ];
  }

  calculateSkillScore(response, expectedCriteria) {
    // Simple scoring algorithm (in real implementation, this would be more sophisticated)
    let score = 0;
    const responseLength = response.length;
    const hasKeywords = this.checkForKeywords(response, expectedCriteria);
    const isStructured = this.checkResponseStructure(response);
    
    // Length scoring (10-30 points)
    if (responseLength > 50 && responseLength < 500) score += 20;
    else if (responseLength > 20) score += 10;
    
    // Keyword relevance (20-40 points)
    if (hasKeywords) score += 30;
    
    // Structure and clarity (20-30 points)
    if (isStructured) score += 25;
    
    // Randomize remaining points for demo (in real implementation, use NLP analysis)
    score += Math.floor(Math.random() * 25);
    
    return Math.min(score, 100);
  }

  checkForKeywords(response, criteria) {
    // Simple keyword checking (in real implementation, use advanced NLP)
    const keywords = ['experience', 'project', 'team', 'problem', 'solution', 'result'];
    return keywords.some(keyword => response.toLowerCase().includes(keyword));
  }

  checkResponseStructure(response) {
    // Check if response has good structure
    return response.length > 30 && response.includes('.') && !response.includes('um') && !response.includes('uh');
  }

  addBusinessManagementLayer() {
    // Add business management overlay to existing pages
    this.addBusinessDashboard();
    this.enhanceNavigationWithBusiness();
    this.addQuickActions();
  }

  addBusinessDashboard() {
    // Check if we're on the main hub page
    if (window.location.pathname.includes('hub.html') || window.location.pathname === '/') {
      const businessDashboard = `
        <div id="business-dashboard" style="
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 20px;
          margin: 20px 0;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        ">
          <h3 style="color: #2c3e50; margin-bottom: 20px;">🏢 Business Management Hub</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            
            <div class="business-card" style="
              background: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              cursor: pointer;
              transition: transform 0.3s ease;
              border-left: 4px solid #007bff;
            " onclick="copilotIntegration.switchCopilot('hr')">
              <div style="font-size: 2rem; margin-bottom: 10px;">👥</div>
              <h4 style="color: #2c3e50; margin-bottom: 5px;">HR Management</h4>
              <p style="color: #6c757d; font-size: 14px;">Employee onboarding, performance, compliance</p>
            </div>

            <div class="business-card" style="
              background: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              cursor: pointer;
              transition: transform 0.3s ease;
              border-left: 4px solid #28a745;
            " onclick="copilotIntegration.switchCopilot('payroll')">
              <div style="font-size: 2rem; margin-bottom: 10px;">💰</div>
              <h4 style="color: #2c3e50; margin-bottom: 5px;">Payroll & Benefits</h4>
              <p style="color: #6c757d; font-size: 14px;">Automated payroll, taxes, benefits</p>
            </div>

            <div class="business-card" style="
              background: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              cursor: pointer;
              transition: transform 0.3s ease;
              border-left: 4px solid #dc3545;
            " onclick="copilotIntegration.switchCopilot('hiring')">
              <div style="font-size: 2rem; margin-bottom: 10px;">🎯</div>
              <h4 style="color: #2c3e50; margin-bottom: 5px;">Smart Hiring</h4>
              <p style="color: #6c757d; font-size: 14px;">AI interviews with skill testing & auto-advancement</p>
            </div>

            <div class="business-card" style="
              background: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              cursor: pointer;
              transition: transform 0.3s ease;
              border-left: 4px solid #6f42c1;
            " onclick="copilotIntegration.switchCopilot('training')">
              <div style="font-size: 2rem; margin-bottom: 10px;">🎓</div>
              <h4 style="color: #2c3e50; margin-bottom: 5px;">Student Training</h4>
              <p style="color: #6c757d; font-size: 14px;">Codebase cloning, progress tracking</p>
            </div>

          </div>
        </div>
      `;

      // Insert after the main hero section
      const mainContent = document.querySelector('main') || document.querySelector('.hero') || document.body;
      mainContent.insertAdjacentHTML('afterbegin', businessDashboard);
    }
  }

  enhanceNavigationWithBusiness() {
    // Add business menu to existing navigation
    const nav = document.querySelector('nav') || document.querySelector('.nav');
    if (nav) {
      const businessMenu = `
        <div class="business-menu" style="
          display: inline-block;
          position: relative;
          margin-left: 20px;
        ">
          <button style="
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
          " onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
            🏢 Business Tools
          </button>
          <div style="
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            background: white;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            border-radius: 5px;
            min-width: 200px;
            z-index: 1000;
          ">
            <a href="#" onclick="copilotIntegration.switchCopilot('hr')" style="
              display: block;
              padding: 10px 15px;
              text-decoration: none;
              color: #333;
              border-bottom: 1px solid #eee;
            ">👥 HR Management</a>
            <a href="#" onclick="copilotIntegration.switchCopilot('payroll')" style="
              display: block;
              padding: 10px 15px;
              text-decoration: none;
              color: #333;
              border-bottom: 1px solid #eee;
            ">💰 Payroll & Benefits</a>
            <a href="#" onclick="copilotIntegration.switchCopilot('hiring')" style="
              display: block;
              padding: 10px 15px;
              text-decoration: none;
              color: #333;
              border-bottom: 1px solid #eee;
            ">🎯 Hiring & Recruitment</a>
            <a href="#" onclick="copilotIntegration.switchCopilot('training')" style="
              display: block;
              padding: 10px 15px;
              text-decoration: none;
              color: #333;
            ">🎓 Student Training</a>
          </div>
        </div>
      `;
      nav.insertAdjacentHTML('beforeend', businessMenu);
    }
  }

  addQuickActions() {
    // Add floating quick actions
    const quickActions = `
      <div id="quick-actions" style="
        position: fixed;
        left: 20px;
        bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 9999;
      ">
        <button onclick="copilotIntegration.quickAction('hire')" style="
          background: #28a745;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          font-size: 16px;
        " title="Quick Hire">👥</button>
        
        <button onclick="copilotIntegration.quickAction('payroll')" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          font-size: 16px;
        " title="Run Payroll">💰</button>
        
        <button onclick="copilotIntegration.quickAction('student')" style="
          background: #6f42c1;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          font-size: 16px;
        " title="Add Student">🎓</button>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', quickActions);
  }

  quickAction(action) {
    // Open copilot and start specific action
    document.getElementById('copilot-interface').style.transform = 'translateY(0)';
    
    switch(action) {
      case 'hire':
        this.switchCopilot('hiring');
        setTimeout(() => {
          this.addMessageToChat('copilot', "I'll help you hire with intelligent skill assessment! I'll test candidates during first interviews and automatically advance qualified ones. What position are you hiring for?");
        }, 500);
        break;
      case 'payroll':
        this.switchCopilot('payroll');
        setTimeout(() => {
          this.addMessageToChat('copilot', "Ready to run payroll! Do you want to process this week's payroll or set up automatic processing?");
        }, 500);
        break;
      case 'student':
        this.switchCopilot('training');
        setTimeout(() => {
          this.addMessageToChat('copilot', "Let's add a new student! What's their name and what program are they joining?");
        }, 500);
        break;
    }
  }

  enhanceExistingPages() {
    // Add business context to existing pages
    this.addBusinessContextToPrograms();
    this.addBusinessContextToStudentPortal();
    this.addBusinessContextToEmployerPages();
  }

  addBusinessContextToPrograms() {
    // Enhance programs page with business training options
    if (window.location.pathname.includes('programs.html')) {
      const businessTraining = `
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          margin: 20px 0;
          border-radius: 15px;
        ">
          <h3>🏢 Business Training Programs</h3>
          <p>Train your employees or students with our integrated learning platform</p>
          <button onclick="copilotIntegration.switchCopilot('training')" style="
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            margin-top: 10px;
          ">Set Up Business Training</button>
        </div>
      `;
      
      const programsContainer = document.querySelector('.programs') || document.querySelector('main');
      if (programsContainer) {
        programsContainer.insertAdjacentHTML('afterbegin', businessTraining);
      }
    }
  }

  addBusinessContextToStudentPortal() {
    // Enhance student portal with business management
    if (window.location.pathname.includes('student-portal.html')) {
      const businessIntegration = `
        <div style="
          background: #f8f9fa;
          padding: 20px;
          margin: 20px 0;
          border-radius: 10px;
          border-left: 4px solid #007bff;
        ">
          <h4>💼 Business Integration</h4>
          <p>This student portal is integrated with business management tools</p>
          <button onclick="copilotIntegration.switchCopilot('training')" style="
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
          ">Manage Students</button>
        </div>
      `;
      
      const portalContainer = document.querySelector('.student-portal') || document.querySelector('main');
      if (portalContainer) {
        portalContainer.insertAdjacentHTML('afterbegin', businessIntegration);
      }
    }
  }

  addBusinessContextToEmployerPages() {
    // Enhance employer pages with full business management
    if (window.location.pathname.includes('employer')) {
      const fullBusinessSuite = `
        <div style="
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          padding: 30px;
          margin: 20px 0;
          border-radius: 15px;
        ">
          <h3>🚀 Complete Business Management</h3>
          <p>Beyond hiring - manage HR, payroll, training, and more</p>
          <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
            <button onclick="copilotIntegration.switchCopilot('hr')" style="
              background: rgba(255,255,255,0.2);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 20px;
              cursor: pointer;
            ">HR Tools</button>
            <button onclick="copilotIntegration.switchCopilot('payroll')" style="
              background: rgba(255,255,255,0.2);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 20px;
              cursor: pointer;
            ">Payroll</button>
            <button onclick="copilotIntegration.switchCopilot('training')" style="
              background: rgba(255,255,255,0.2);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 20px;
              cursor: pointer;
            ">Training</button>
          </div>
        </div>
      `;
      
      const employerContainer = document.querySelector('.employer') || document.querySelector('main');
      if (employerContainer) {
        employerContainer.insertAdjacentHTML('afterbegin', fullBusinessSuite);
      }
    }
  }
}

// Initialize copilot integration when page loads
const copilotIntegration = new CopilotIntegration();

// Make it globally available
window.copilotIntegration = copilotIntegration;