import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

/**
 * Next-Level Futuristic Chatbot Component
 * GrandHR - AI-Powered Multi-Bot System
 */

const FUTURISTIC_BOTS = {
  HR_ASSISTANT: { 
    name: 'HR Assistant AI', 
    icon: '🤖',
    emoji: '👔',
    gradient: 'from-accent-600 via-purple-600 to-accent-700',
    bgGradient: 'from-accent-50 via-purple-50 to-accent-100',
    borderColor: 'border-accent-300',
    description: 'AI-powered HR management assistant',
    capabilities: ['Employee Management', 'Policy Queries', 'Smart Recommendations']
  },
  PAYROLL_BOT: { 
    name: 'Payroll AI', 
    icon: '💰',
    emoji: '💵',
    gradient: 'from-green-500 via-emerald-600 to-green-700',
    bgGradient: 'from-green-50 via-emerald-50 to-green-100',
    borderColor: 'border-green-300',
    description: 'Intelligent payroll processing assistant',
    capabilities: ['Salary Calculations', 'Tax Compliance', 'Payslip Generation']
  },
  LEAVE_BOT: { 
    name: 'Leave AI', 
    icon: '📅',
    emoji: '🗓️',
    gradient: 'from-blue-500 via-cyan-600 to-blue-700',
    bgGradient: 'from-blue-50 via-cyan-50 to-blue-100',
    borderColor: 'border-blue-300',
    description: 'Smart leave management assistant',
    capabilities: ['Leave Balance', 'Approval Workflow', 'Calendar Integration']
  },
  ATTENDANCE_BOT: { 
    name: 'Attendance AI', 
    icon: '⏰',
    emoji: '🕐',
    gradient: 'from-orange-500 via-amber-600 to-orange-700',
    bgGradient: 'from-orange-50 via-amber-50 to-orange-100',
    borderColor: 'border-orange-300',
    description: 'Advanced attendance tracking assistant',
    capabilities: ['Time Tracking', 'Shift Management', 'Analytics']
  },
  ANALYTICS_BOT: {
    name: 'Analytics AI',
    icon: '📊',
    emoji: '📈',
    gradient: 'from-indigo-500 via-purple-600 to-indigo-700',
    bgGradient: 'from-indigo-50 via-purple-50 to-indigo-100',
    borderColor: 'border-indigo-300',
    description: 'Predictive analytics and insights',
    capabilities: ['Trend Analysis', 'Predictions', 'Reports']
  },
  COMPLIANCE_BOT: {
    name: 'Compliance AI',
    icon: '⚖️',
    emoji: '📋',
    gradient: 'from-red-500 via-rose-600 to-red-700',
    bgGradient: 'from-red-50 via-rose-50 to-red-100',
    borderColor: 'border-red-300',
    description: 'Legal compliance and regulations assistant',
    capabilities: ['Compliance Checks', 'Regulatory Updates', 'Risk Assessment']
  },
  RECRUITMENT_BOT: {
    name: 'Recruitment AI',
    icon: '🎯',
    emoji: '👥',
    gradient: 'from-teal-500 via-cyan-600 to-teal-700',
    bgGradient: 'from-teal-50 via-cyan-50 to-teal-100',
    borderColor: 'border-teal-300',
    description: 'Smart recruitment and hiring assistant',
    capabilities: ['Candidate Screening', 'Interview Scheduling', 'Talent Matching']
  },
  GENERAL_SUPPORT: { 
    name: 'Support AI', 
    icon: '💬',
    emoji: '🤝',
    gradient: 'from-gray-500 via-slate-600 to-gray-700',
    bgGradient: 'from-gray-50 via-slate-50 to-gray-100',
    borderColor: 'border-gray-300',
    description: 'General support and assistance',
    capabilities: ['FAQ', 'Troubleshooting', 'Guidance']
  }
};

const QuickActions = {
  'View Dashboard': '/hr/dashboard',
  'Apply Leave': '/hr/leaves',
  'Check Payroll': '/hr/payroll',
  'View Attendance': '/hr/attendance',
  'Contact Support': '/hr/support',
  'View Employees': '/hr/employees'
};

const EnhancedChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [availableBots, setAvailableBots] = useState([]);
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAvailableBots();
  }, []);

  useEffect(() => {
    if (selectedBot && !messages[selectedBot]) {
      const botConfig = FUTURISTIC_BOTS[selectedBot] || FUTURISTIC_BOTS.GENERAL_SUPPORT;
      setMessages(prev => ({
        ...prev,
        [selectedBot]: [{
          type: 'bot',
          message: `👋 Hello! I'm ${botConfig.name}, your ${botConfig.description.toLowerCase()}. I can help you with:\n\n${botConfig.capabilities.map(cap => `✨ ${cap}`).join('\n')}\n\nHow can I assist you today?`,
          timestamp: new Date(),
          quickActions: Object.keys(QuickActions).slice(0, 3)
        }]
      }));
    }
  }, [selectedBot]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedBot]);

  const loadAvailableBots = async () => {
    try {
      const response = await api.get('/chatbot');
      const bots = response.data.chatbots || [];
      // Add futuristic bots if not present
      const allBots = [
        ...bots,
        { type: 'ANALYTICS_BOT', name: 'Analytics AI', description: 'Predictive analytics' },
        { type: 'COMPLIANCE_BOT', name: 'Compliance AI', description: 'Legal compliance' },
        { type: 'RECRUITMENT_BOT', name: 'Recruitment AI', description: 'Smart recruitment' }
      ];
      setAvailableBots(allBots);
    } catch (error) {
      console.error('Error loading chatbots:', error);
      // Fallback to default bots
      setAvailableBots([
        { type: 'HR_ASSISTANT', name: 'HR Assistant AI', description: 'AI-powered HR management' },
        { type: 'PAYROLL_BOT', name: 'Payroll AI', description: 'Intelligent payroll processing' },
        { type: 'LEAVE_BOT', name: 'Leave AI', description: 'Smart leave management' },
        { type: 'ATTENDANCE_BOT', name: 'Attendance AI', description: 'Advanced attendance tracking' },
        { type: 'ANALYTICS_BOT', name: 'Analytics AI', description: 'Predictive analytics' },
        { type: 'COMPLIANCE_BOT', name: 'Compliance AI', description: 'Legal compliance' },
        { type: 'RECRUITMENT_BOT', name: 'Recruitment AI', description: 'Smart recruitment' },
        { type: 'GENERAL_SUPPORT', name: 'Support AI', description: 'General support' }
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const analyzeSentiment = (text) => {
    const positiveWords = ['good', 'great', 'excellent', 'thanks', 'helpful', 'perfect', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'wrong', 'error', 'problem', 'issue', 'broken'];
    const textLower = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedBot || loading) return;

    const userMessage = inputMessage.trim();
    const messageSentiment = analyzeSentiment(userMessage);
    setSentiment(messageSentiment);
    setInputMessage('');
    setLoading(true);
    setIsTyping(true);

    // Add user message
    setMessages(prev => ({
      ...prev,
      [selectedBot]: [
        ...(prev[selectedBot] || []),
        {
          type: 'user',
          message: userMessage,
          timestamp: new Date(),
          sentiment: messageSentiment
        }
      ]
    }));

    // Simulate typing delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const response = await api.post('/chatbot/message', {
        chatbotType: selectedBot,
        message: userMessage
      });

      const botResponse = response.data.response || {
        message: `I understand you're asking about "${userMessage}". Let me help you with that.`,
        suggestions: ['Tell me more', 'Show examples', 'Related topics'],
        actionRequired: false
      };

      // Add bot response with typing animation
      setIsTyping(false);
      await new Promise(resolve => setTimeout(resolve, 500));

      setMessages(prev => ({
        ...prev,
        [selectedBot]: [
          ...(prev[selectedBot] || []),
          {
            type: 'bot',
            message: botResponse.message,
            suggestions: botResponse.suggestions,
            quickActions: botResponse.quickActions || Object.keys(QuickActions).slice(0, 3),
            actionRequired: botResponse.actionRequired,
            actionType: botResponse.actionType,
            actionData: botResponse.actionData,
            timestamp: new Date()
          }
        ]
      }));

      // Handle navigation if action required
      if (botResponse.actionRequired && botResponse.actionType === 'navigate' && botResponse.actionData?.path) {
        setTimeout(() => {
          navigate(botResponse.actionData.path);
          setIsOpen(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setMessages(prev => ({
        ...prev,
        [selectedBot]: [
          ...(prev[selectedBot] || []),
          {
            type: 'bot',
            message: 'I apologize, but I encountered an issue. Please try rephrasing your question or contact support if the problem persists.',
            timestamp: new Date()
          }
        ]
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (QuickActions[action]) {
      navigate(QuickActions[action]);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleBotSelect = (botType) => {
    setSelectedBot(botType);
    setSentiment(null);
  };

  const currentMessages = selectedBot ? (messages[selectedBot] || []) : [];
  const botConfig = selectedBot ? (FUTURISTIC_BOTS[selectedBot] || FUTURISTIC_BOTS.GENERAL_SUPPORT) : null;

  return (
    <>
      {/* Futuristic Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-20 h-20 bg-gradient-to-r from-accent-600 via-purple-600 to-accent-700 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-all duration-300 z-50 group relative overflow-hidden"
          title="Open AI Chatbots"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
          <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">🤖</span>
          <span className="absolute inset-0 rounded-full bg-accent-400 opacity-0 group-hover:opacity-30 animate-ping"></span>
          {/* Notification Badge */}
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Enhanced Chatbot Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[420px] h-[700px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 border-2 border-gray-200 animate-scale-in backdrop-blur-sm overflow-hidden">
          {/* Futuristic Header */}
          <div className={`bg-gradient-to-r ${botConfig?.gradient || 'from-accent-600 to-accent-700'} text-white p-5 rounded-t-3xl flex items-center justify-between relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
                {botConfig?.emoji || '🤖'}
              </div>
              <div>
                <h3 className="font-bold text-lg">GrandHR AI</h3>
                <p className="text-xs text-white/80">{botConfig?.name || 'AI Assistant'}</p>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-2">
              {/* Voice Mode Toggle */}
              <button
                onClick={() => setVoiceMode(!voiceMode)}
                className={`p-2 rounded-lg transition-all ${voiceMode ? 'bg-white/30' : 'hover:bg-white/20'}`}
                title={voiceMode ? 'Disable Voice' : 'Enable Voice'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zM19 10a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM5 10a1 1 0 001 1h2a1 1 0 100-2H6a1 1 0 00-1 1zM12 18a1 1 0 01-1 1v2a1 1 0 112 0v-2a1 1 0 01-1-1zM18.364 6.636a1 1 0 010 1.414l-1.414 1.414a1 1 0 11-1.414-1.414l1.414-1.414a1 1 0 011.414 0zM7.05 16.95a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.414-1.414l1.414-1.414a1 1 0 011.414 0zM18.364 17.364a1 1 0 01-1.414 0l-1.414-1.414a1 1 0 111.414-1.414l1.414 1.414a1 1 0 010 1.414zM7.05 7.05a1 1 0 011.414 0l1.414 1.414a1 1 0 11-1.414 1.414L7.05 8.464a1 1 0 010-1.414z"/>
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bot Selection */}
          {!selectedBot ? (
            <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-br from-gray-50 via-white to-gray-50">
              <h4 className="font-bold mb-4 text-gray-800 text-lg flex items-center gap-2">
                <span>🚀</span> Choose Your AI Assistant
              </h4>
              <div className="space-y-3">
                {availableBots.map((bot, idx) => {
                  const botConfig = FUTURISTIC_BOTS[bot.type] || FUTURISTIC_BOTS.GENERAL_SUPPORT;
                  return (
                    <button
                      key={bot.type}
                      onClick={() => handleBotSelect(bot.type)}
                      className={`w-full p-4 bg-gradient-to-r ${botConfig.bgGradient} rounded-xl border-2 ${botConfig.borderColor} hover:border-accent-400 transition-all duration-300 text-left flex items-center gap-4 group hover:shadow-xl hover:scale-[1.02] animate-slide-up`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className={`w-14 h-14 bg-gradient-to-r ${botConfig.gradient} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        {botConfig.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 group-hover:text-accent-700 transition-colors">{botConfig.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{botConfig.description}</div>
                        <div className="flex gap-2 mt-2">
                          {botConfig.capabilities.slice(0, 2).map((cap, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-white/60 rounded-full text-gray-700">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-accent-600 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Bot Header with Back */}
              <div className="p-4 border-b-2 border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedBot(null)}
                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className={`w-10 h-10 bg-gradient-to-r ${botConfig.gradient} rounded-full flex items-center justify-center text-xl shadow-lg`}>
                    {botConfig.icon}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">{botConfig.name}</span>
                    <div className="text-xs text-gray-500">AI Powered</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMessages(prev => ({
                      ...prev,
                      [selectedBot]: [{
                        type: 'bot',
                        message: `👋 Hello! I'm ${botConfig.name}, your ${botConfig.description.toLowerCase()}. How can I assist you today?`,
                        timestamp: new Date(),
                        quickActions: Object.keys(QuickActions).slice(0, 3)
                      }]
                    }));
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Clear chat"
                >
                  Clear
                </button>
              </div>

              {/* Messages with Sentiment */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 via-white to-gray-50">
                {currentMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl ${
                        msg.type === 'user'
                          ? `bg-gradient-to-r ${botConfig.gradient} text-white`
                          : 'bg-white text-gray-800 border-2 border-gray-200'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</div>
                      
                      {/* Sentiment Indicator */}
                      {msg.sentiment && (
                        <div className="mt-2 flex items-center gap-1 text-xs opacity-70">
                          {msg.sentiment === 'positive' && '😊'}
                          {msg.sentiment === 'negative' && '😔'}
                          {msg.sentiment === 'neutral' && '😐'}
                        </div>
                      )}

                      {/* Quick Actions */}
                      {msg.quickActions && msg.quickActions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-semibold text-gray-600 mb-2">Quick Actions:</div>
                          {msg.quickActions.map((action, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => handleQuickAction(action)}
                              className="block w-full text-left text-xs px-3 py-2 bg-white/20 hover:bg-white/40 rounded-lg text-white border border-white/30 transition-all duration-200 hover:scale-[1.02]"
                            >
                              ⚡ {action}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.suggestions.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-all duration-200 hover:scale-[1.02]"
                            >
                              💡 {suggestion}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className={`text-xs mt-2 ${msg.type === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {(loading || isTyping) && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-white rounded-2xl p-4 border-2 border-accent-200 shadow-sm">
                      <div className="flex gap-2 items-center">
                        <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        <span className="text-xs text-gray-500 ml-2">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Input with Voice */}
              <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-gray-200 bg-gradient-to-r from-white to-gray-50">
                {voiceMode && (
                  <div className="mb-2 text-xs text-center text-accent-600 font-semibold animate-pulse">
                    🎤 Voice mode active - Click to speak
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={voiceMode ? "🎤 Voice input active..." : "Type your message or ask a question..."}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 bg-white"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className={`px-6 py-3 bg-gradient-to-r ${botConfig.gradient} text-white rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg font-semibold flex items-center gap-2`}
                  >
                    <span>Send</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default EnhancedChatbot;

