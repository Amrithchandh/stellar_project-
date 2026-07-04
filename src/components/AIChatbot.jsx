import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Key, Sparkles, Shield, Compass } from 'lucide-react';
import { callGemini } from '../services/gemini';

// Predefined fallback responses if no API key is supplied
const PREDEFINED_ANSWERS = {
  'what is wage streaming?': `**Wage Streaming** is a payroll revolution! 
  
Instead of waiting 30 days for a monthly salary lump-sum, your earnings are credited to your account continuously, second-by-second. 

This gives you real-time liquidity and prevents the "lump-sum trap" where you run out of cash before the next payday.`,

  'how do the 4 vaults work?': `StreamSave divides your accruing wages into **4 mental accounting vaults**:
  
1. 🛒 **Spending (Instant):** Cash you can withdraw immediately for daily living costs.
2. 🏦 **Savings (Auto-DCA):** Cash reserved for auto-converting into Digital Gold (XAU).
3. 🔒 **Goals (Locked):** Cash locked for long-term targets.
4. 📅 **Bills (Auto-Pay):** Cash auto-allocated for EMIs and rent.`,

  'why is there a withdrawal delay?': `The 3-second delay on Savings and 5-second delay on Goals are examples of **intentional behavioral friction**. 
  
According to behavioral economics, humans suffer from *present bias* (impulsively choosing short-term dopamine over long-term stability). Adding a physical timer countdown breaks that impulsive trigger, letting you reconsider the withdrawal.`,

  'explain dca and digital gold': `StreamSave converts your Savings vault into **Digital Gold (XAU tokens on Stellar)**. 
  
Instead of guessing when to buy, it uses **Dollar-Cost Averaging (DCA)**. It splits your buys continuously, lowering the impact of price volatility. The price is sourced live from Stellar-native Reflector Oracles.`,

  'how does stellar/freighter help?': `**Stellar** provides a low-cost, decentralized ledger for sending micro-credits.
  
**Freighter Wallet** (https://freighter.app/) is a browser extension that securely stores your private keys locally on your device. When you connect, StreamSave only reads your public address to show testnet balances. The app never sees your keys, keeping your funds 100% safe.`
};

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('streamsave_gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: '👋 Hello! I am your StreamSave Explainer Guide.\n\nI can help you explore and understand concepts like **Wage Streaming, Vaults, Behavioral Friction, and DCA**.\n\n*Note: I am sandboxed from all money functions and have no access to your wallet/funds.*',
      timestamp: Date.now()
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isLoading]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('streamsave_gemini_api_key', apiKey.trim());
    setShowKeyInput(false);
    alert('Gemini API Key saved locally!');
  };

  const handleClearKey = () => {
    localStorage.removeItem('streamsave_gemini_api_key');
    setApiKey('');
    alert('API Key cleared.');
  };

  const sendBotResponse = async (userText, updatedHistory) => {
    setIsLoading(true);

    const lowercaseText = userText.toLowerCase().trim();
    
    // Check if we have a predefined match
    let answer = null;
    for (const key of Object.keys(PREDEFINED_ANSWERS)) {
      if (lowercaseText.includes(key)) {
        answer = PREDEFINED_ANSWERS[key];
        break;
      }
    }

    if (answer) {
      // Small simulated delay for realistic feel
      setTimeout(() => {
        setChatHistory(prev => [
          ...prev,
          {
            id: 'bot_' + Date.now(),
            sender: 'bot',
            text: answer,
            timestamp: Date.now()
          }
        ]);
        setIsLoading(false);
      }, 800);
      return;
    }

    // Otherwise, attempt to call Gemini API if key is present
    const storedKey = localStorage.getItem('streamsave_gemini_api_key');
    if (!storedKey) {
      setTimeout(() => {
        setChatHistory(prev => [
          ...prev,
          {
            id: 'bot_no_key_' + Date.now(),
            sender: 'bot',
            text: `⚠️ **API Key Required for custom questions.**\n\nTo ask custom questions, please click the ⚙️ settings icon at the top of this chat and enter a free Gemini API Key from [aistudio.google.com](https://aistudio.google.com).\n\nOtherwise, feel free to explore by clicking any of the quick-action topic buttons below!`,
            timestamp: Date.now()
          }
        ]);
        setIsLoading(false);
      }, 800);
      return;
    }

    try {
      const response = await callGemini(storedKey, updatedHistory);
      setChatHistory(prev => [
        ...prev,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: response,
          timestamp: Date.now()
        }
      ]);
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        {
          id: 'bot_err_' + Date.now(),
          sender: 'bot',
          text: `❌ **API Error:** ${err.message || 'Failed to get response.'} Please check your API key in settings.`,
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: Date.now()
    };

    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setInputMessage('');
    sendBotResponse(userMsg.text, newHistory);
  };

  const handleQuickTopic = (topicText) => {
    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: topicText,
      timestamp: Date.now()
    };

    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    sendBotResponse(userMsg.text, newHistory);
  };

  return (
    <>
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            border: 'none',
            boxShadow: '0 8px 24px rgba(45, 106, 79, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            zIndex: 900,
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className="chatbot-trigger"
          title="Open Explainer Guide"
        >
          <Sparkles size={24} className="sparkle-glow" />
        </button>
      )}

      {/* Slide-Up Chat Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '12px',
            right: '12px',
            height: '520px',
            background: 'var(--surface)',
            borderRadius: '24px',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 950
          }}
          className="animate-fade"
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-color)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(45, 106, 79, 0.1)', display: 'flex', alignItems: 'center', justifyContainer: 'center', color: 'var(--primary)', paddingLeft: '6px' }}>
                <Compass size={16} />
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '800', display: 'block', color: 'var(--text-main)' }}>StreamSave Guide</span>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={10} /> Safe / Sandboxed Agent
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Settings button */}
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: showKeyInput ? 'var(--primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                title="API Settings"
              >
                <Key size={16} />
              </button>
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Collapsible Key Config Panel */}
          {showKeyInput && (
            <div style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', padding: '12px 16px' }} className="animate-fade">
              <form onSubmit={handleSaveKey} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)' }}>GEMINI API KEY (LOCAL STORAGE)</label>
                  {localStorage.getItem('streamsave_gemini_api_key') && (
                    <button type="button" onClick={handleClearKey} style={{ fontSize: '9px', color: '#d93025', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '700' }}>
                      Clear Key
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="password"
                    placeholder="AIStudio Gemini API Key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '12px', outline: 'none' }}
                  />
                  <button type="submit" className="btn-premium btn-primary" style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px' }}>
                    Save
                  </button>
                </div>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
                  Get a free key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: '700' }}>Google AI Studio</a>. Key stays local to your browser.
                </span>
              </form>
            </div>
          )}

          {/* Chat Messages */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#fafcfb'
            }}
          >
            {chatHistory.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      background: isUser ? 'var(--primary)' : 'white',
                      color: isUser ? 'white' : 'var(--text-main)',
                      padding: '10px 14px',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      border: isUser ? 'none' : '1px solid var(--border)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      fontSize: '12px',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {/* Basic Markdown rendering for bold formatting */}
                    {msg.text.split('\n').map((line, lIdx) => (
                      <p key={lIdx} style={{ margin: 0, marginBottom: lIdx === msg.text.split('\n').length - 1 ? 0 : '8px' }}>
                        {line.split('**').map((part, pIdx) => {
                          if (pIdx % 2 === 1) {
                            return <strong key={pIdx}>{part}</strong>;
                          }
                          return part;
                        })}
                      </p>
                    ))}
                  </div>
                  <span style={{ fontSize: '8px', color: 'var(--text-secondary)', marginTop: '4px', padding: '0 4px' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', background: 'white', padding: '10px 16px', borderRadius: '16px 16px 16px 2px', border: '1px solid var(--border)' }}>
                <span className="dot-loading" style={{ animationDelay: '0s' }} />
                <span className="dot-loading" style={{ animationDelay: '0.2s' }} />
                <span className="dot-loading" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Action Chips */}
          <div
            style={{
              padding: '8px 12px',
              background: '#f8fafc',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}
            className="people-grid"
          >
            <button onClick={() => handleQuickTopic('What is Wage Streaming?')} className="quick-chip">
              🕒 Stream Wage?
            </button>
            <button onClick={() => handleQuickTopic('How do the 4 Vaults work?')} className="quick-chip">
              🏦 4 Vaults?
            </button>
            <button onClick={() => handleQuickTopic('Why is there a withdrawal delay?')} className="quick-chip">
              ⏳ Friction delay?
            </button>
            <button onClick={() => handleQuickTopic('Explain DCA and Digital Gold')} className="quick-chip">
              🪙 DCA Gold?
            </button>
            <button onClick={() => handleQuickTopic('How does Stellar/Freighter help?')} className="quick-chip">
              🦊 Freighter/Stellar?
            </button>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '12px 16px',
              background: 'white',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              placeholder="Ask anything about the app..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1.5px solid var(--border)',
                borderRadius: '20px',
                fontSize: '12px',
                outline: 'none',
                background: '#fafcfb'
              }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: inputMessage.trim() ? 'var(--primary)' : 'var(--border)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: inputMessage.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s'
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Injected style for sparkles and loading dots */}
      <style>{`
        @keyframes sparkleRotate {
          0% { transform: scale(1) rotate(0deg); opacity: 0.9; }
          50% { transform: scale(1.1) rotate(180deg); opacity: 1; box-shadow: 0 0 12px rgba(45, 106, 79, 0.6); }
          100% { transform: scale(1) rotate(360deg); opacity: 0.9; }
        }
        .sparkle-glow {
          animation: sparkleRotate 4s linear infinite;
        }
        .quick-chip {
          background: white;
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 6px 12px;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-secondary);
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quick-chip:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(45, 106, 79, 0.02);
        }
        .dot-loading {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-secondary);
          animation: bounce 1.4s infinite ease-in-out both;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default AIChatbot;
