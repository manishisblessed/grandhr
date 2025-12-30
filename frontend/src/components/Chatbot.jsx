import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

/**
 * Multi-Chatbot Component
 * Made by Shah Works - www.shahworks.com
 */

const CHATBOT_TYPES = {
  HR_ASSISTANT: { name: 'HR Assistant', icon: '👔', color: 'bg-blue-500' },
  PAYROLL_BOT: { name: 'Payroll Bot', icon: '💰', color: 'bg-green-500' },
  LEAVE_BOT: { name: 'Leave Bot', icon: '📅', color: 'bg-purple-500' },
  ATTENDANCE_BOT: { name: 'Attendance Bot', icon: '⏰', color: 'bg-orange-500' },
  GENERAL_SUPPORT: { name: 'General Support', icon: '💬', color: 'bg-gray-500' }
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
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-all duration-300 z-50 animate-bounce"
          title="Open Chatbots"
        >
          💬
        </button>
      )}

      {/* Chatbot Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
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
            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="font-semibold mb-3 text-gray-700">Choose a Chatbot:</h4>
              <div className="space-y-2">
                {availableBots.map((bot) => (
                  <button
                    key={bot.type}
                    onClick={() => handleBotSelect(bot.type)}
                    className="w-full p-3 bg-gray-50 hover:bg-primary-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-all text-left flex items-center gap-3"
                  >
                    <span className="text-2xl">{bot.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-800">{bot.name}</div>
                      <div className="text-xs text-gray-500">{bot.description}</div>
                    </div>
                  </button>
                ))}
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
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {currentMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.type === 'user'
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.suggestions.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-white border border-white/30"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
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

