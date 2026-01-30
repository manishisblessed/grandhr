import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

/**
 * Multi-Chatbot Component
 * Made by Shah Works - www.shahworks.com
 */

const CHATBOT_TYPES = {
  HR_ASSISTANT: { 
    name: 'HR Assistant', 
    icon: '👔', 
    gradient: 'from-accent-600 to-accent-700',
    bgGradient: 'from-accent-50 to-accent-100',
    borderColor: 'border-accent-200'
  },
  PAYROLL_BOT: { 
    name: 'Payroll Bot', 
    icon: '💰', 
    gradient: 'from-success-500 to-success-600',
    bgGradient: 'from-success-50 to-success-100',
    borderColor: 'border-success-200'
  },
  LEAVE_BOT: { 
    name: 'Leave Bot', 
    icon: '📅', 
    gradient: 'from-accent-500 to-accent-600',
    bgGradient: 'from-accent-50 to-accent-100',
    borderColor: 'border-accent-200'
  },
  ATTENDANCE_BOT: { 
    name: 'Attendance Bot', 
    icon: '⏰', 
    gradient: 'from-warning-500 to-warning-600',
    bgGradient: 'from-warning-50 to-warning-100',
    borderColor: 'border-warning-200'
  },
  GENERAL_SUPPORT: { 
    name: 'General Support', 
    icon: '💬', 
    gradient: 'from-gray-500 to-gray-600',
    bgGradient: 'from-gray-50 to-gray-100',
    borderColor: 'border-gray-200'
  }
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [availableBots, setAvailableBots] = useState([]);
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAvailableBots();
  }, []);

  useEffect(() => {
    if (selectedBot && !messages[selectedBot]) {
      setMessages(prev => ({
        ...prev,
        [selectedBot]: [{
          type: 'bot',
          message: `Hello! I'm the ${CHATBOT_TYPES[selectedBot]?.name || 'Assistant'}. How can I help you today?`,
          timestamp: new Date()
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
      setAvailableBots(response.data.chatbots || []);
    } catch (error) {
      console.error('Error loading chatbots:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedBot || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Add user message
    setMessages(prev => ({
      ...prev,
      [selectedBot]: [
        ...(prev[selectedBot] || []),
        {
          type: 'user',
          message: userMessage,
          timestamp: new Date()
        }
      ]
    }));

    try {
      const response = await api.post('/chatbot/message', {
        chatbotType: selectedBot,
        message: userMessage
      });

      const botResponse = response.data.response;

      // Add bot response
      setMessages(prev => ({
        ...prev,
        [selectedBot]: [
          ...(prev[selectedBot] || []),
          {
            type: 'bot',
            message: botResponse.message,
            suggestions: botResponse.suggestions,
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
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => ({
        ...prev,
        [selectedBot]: [
          ...(prev[selectedBot] || []),
          {
            type: 'bot',
            message: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date()
          }
        ]
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const handleBotSelect = (botType) => {
    setSelectedBot(botType);
    if (!messages[botType]) {
      setMessages(prev => ({
        ...prev,
        [botType]: [{
          type: 'bot',
          message: `Hello! I'm the ${CHATBOT_TYPES[botType]?.name || 'Assistant'}. How can I help you today?`,
          timestamp: new Date()
        }]
      }));
    }
  };

  const currentMessages = selectedBot ? (messages[selectedBot] || []) : [];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-all duration-300 z-50 animate-bounce-subtle hover:shadow-accent-500/50 group"
          title="Open Chatbots"
        >
          <span className="group-hover:scale-110 transition-transform duration-300">💬</span>
          <span className="absolute inset-0 rounded-full bg-accent-400 opacity-0 group-hover:opacity-20 animate-ping"></span>
        </button>
      )}

      {/* Chatbot Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 animate-scale-in backdrop-blur-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-accent-600 to-accent-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">GrandHR Chatbots</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Bot Selection */}
          {!selectedBot ? (
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-white">
              <h4 className="font-semibold mb-4 text-gray-800 text-lg">Choose a Chatbot:</h4>
              <div className="space-y-3">
                {availableBots.map((bot, idx) => {
                  const botConfig = CHATBOT_TYPES[bot.type] || CHATBOT_TYPES.GENERAL_SUPPORT;
                  return (
                    <button
                      key={bot.type}
                      onClick={() => handleBotSelect(bot.type)}
                      className={`w-full p-4 bg-gradient-to-r ${botConfig.bgGradient} rounded-xl border-2 ${botConfig.borderColor} hover:border-accent-400 transition-all duration-300 text-left flex items-center gap-4 group hover:shadow-lg hover:scale-[1.02] animate-slide-up`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{bot.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 group-hover:text-accent-700 transition-colors">{bot.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{bot.description}</div>
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
              {/* Bot Header */}
              <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedBot(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-xl">{CHATBOT_TYPES[selectedBot]?.icon}</span>
                  <span className="font-semibold text-gray-800">{CHATBOT_TYPES[selectedBot]?.name}</span>
                </div>
                <button
                  onClick={() => {
                    setMessages(prev => ({
                      ...prev,
                      [selectedBot]: [{
                        type: 'bot',
                        message: `Hello! I'm the ${CHATBOT_TYPES[selectedBot]?.name || 'Assistant'}. How can I help you today?`,
                        timestamp: new Date()
                      }]
                    }));
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                  title="Clear chat"
                >
                  Clear
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 via-white to-gray-50">
                {currentMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-md ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-accent-600 to-accent-700 text-white'
                          : 'bg-white text-gray-800 border-2 border-gray-200'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</div>
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.suggestions.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs px-3 py-2 bg-white/20 hover:bg-white/40 rounded-lg text-white border border-white/30 transition-all duration-200 hover:scale-[1.02]"
                            >
                              {suggestion}
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
                {loading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-white rounded-2xl p-4 border-2 border-accent-200 shadow-sm">
                      <div className="flex gap-2 items-center">
                        <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        <span className="text-xs text-gray-500 ml-2">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-gray-200 bg-gradient-to-r from-white to-gray-50">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 bg-white"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl hover:from-accent-700 hover:to-accent-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
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

export default Chatbot;

