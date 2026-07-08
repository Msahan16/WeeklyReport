import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import './ChatWidget.css';
import chatIcon from './chat.png';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.REACT_APP_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true
});

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi there! I can analyze recent team reports. Ask me a question or generate a summary.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Render for all authenticated users
  if (!user) {
    return null;
  }

  const handleSend = async (textOverride) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const openRouterMessages = newMessages.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.text
      }));

      const apiResponse = await client.chat.completions.create({
        model: 'tencent/hy3:free',
        messages: openRouterMessages,
      });

      const responseText = apiResponse.choices[0]?.message?.content || 'I received an empty response. Please try again.';
      setMessages([...newMessages, { role: 'ai', text: responseText }]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      const errorMsg = err?.status === 429
        ? 'Too many requests. Please wait a moment and try again.'
        : `Sorry, I encountered an error: ${err.message}`;
      setMessages([...newMessages, { role: 'ai', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-title">
              <img src={chatIcon} alt="AI Icon" style={{ width: '20px', height: '20px' }} /> AI Chat Assistant
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>&times;</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                {msg.role === 'ai' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {isLoading && (
              <div className="chat-typing">Assistant is thinking...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <div className="chat-quick-actions">
              {user?.role === 'MANAGER' ? (
                <>
                  <button
                    className="quick-action-btn"
                    onClick={() => handleSend("Generate a summary of the team's completed work, recurring blockers, and workload imbalances over the last few weeks.")}
                  >
                    Generate Team Summary
                  </button>
                  <button
                    className="quick-action-btn"
                    onClick={() => handleSend("What are the most common blockers right now?")}
                  >
                    Common Blockers
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="quick-action-btn"
                    onClick={() => handleSend("Summarize my completed work over the last few weeks.")}
                  >
                    My Recent Work
                  </button>
                  <button
                    className="quick-action-btn"
                    onClick={() => handleSend("What are the blockers I've been facing recently?")}
                  >
                    My Blockers
                  </button>
                </>
              )}
            </div>
            <form
              className="chat-input-form"
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            >
              <input
                type="text"
                className="chat-input-field"
                placeholder="Ask about team activity..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" className="chat-send-btn" disabled={isLoading || !input.trim()}>
                &#10148;
              </button>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <button className="chat-bubble-btn" onClick={() => setIsOpen(true)} title="AI Chat Assistant">
          <img src={chatIcon} alt="Chat Icon" style={{ width: '28px', height: '28px' }} />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
