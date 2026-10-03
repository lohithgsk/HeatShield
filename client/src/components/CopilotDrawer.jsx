import React, { useState } from 'react';
import { X, Sparkles, Send, FileText, MessageSquare, Radio, Check } from 'lucide-react';

export default function CopilotDrawer({
  isOpen,
  onClose,
  selectedTract,
  persona,
  onSendToAudio
}) {
  const [mode, setMode] = useState('tract'); // 'tract' | 'council' | 'chat'
  const [copilotText, setCopilotText] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // Generate Tract Report
  const handleGenerateTractReport = async () => {
    if (!selectedTract) return;
    setIsGenerating(true);
    setCopilotText(null);
    try {
      const res = await fetch('/api/copilot/tract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tract: selectedTract, persona })
      });
      const data = await res.json();
      setCopilotText(data.report || 'No output generated.');
    } catch (e) {
      setCopilotText('Failed to generate report. Please check API connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Council Memorandum
  const handleGenerateCouncilMemo = async () => {
    setIsGenerating(true);
    setCopilotText(null);
    try {
      const res = await fetch('/api/copilot/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona })
      });
      const data = await res.json();
      setCopilotText(data.memorandum || 'No memorandum generated.');
    } catch (e) {
      setCopilotText('Failed to generate memorandum. Please check API connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Chat message submit
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, persona })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { sender: 'ai', text: data.reply || 'No reply generated.' }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'Error contacting Gemini Climate Copilot.' }]);
    }
  };

  const handleCopy = () => {
    if (!copilotText) return;
    navigator.clipboard.writeText(copilotText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`action-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <div className="drawer-title-group">
          <Sparkles size={20} style={{ color: '#60a5fa' }} />
          <div>
            <h3 className="drawer-title">Urban Climate Copilot</h3>
            <span className="drawer-subtitle">Powered by Google Gemini 3.8 Flash • {persona}</span>
          </div>
        </div>
        <button className="btn-close-drawer" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="drawer-body">
        {/* Mode Switcher */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(30, 41, 59, 0.6)', padding: '4px', borderRadius: '8px' }}>
          <button 
            className={`btn-nav-action ${mode === 'tract' ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setMode('tract')}
          >
            <FileText size={14} />
            <span>Tract Diagnosis</span>
          </button>

          <button 
            className={`btn-nav-action ${mode === 'council' ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setMode('council')}
          >
            <FileText size={14} />
            <span>Council Memo</span>
          </button>

          <button 
            className={`btn-nav-action ${mode === 'chat' ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setMode('chat')}
          >
            <MessageSquare size={14} />
            <span>AI Chat</span>
          </button>
        </div>

        {/* Mode 1: Tract Diagnosis */}
        {mode === 'tract' && (
          <div style={{ display: 'flex', flexDirectio: 'column', gap: '14px' }}>
            {selectedTract ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Target Neighborhood: <b style={{ color: '#f8fafc' }}>{selectedTract.neighborhood}</b> (HVI: {selectedTract.heat_vulnerability_index}/100)
                </div>

                <button 
                  className="btn-primary-action"
                  onClick={handleGenerateTractReport}
                  disabled={isGenerating}
                >
                  <Sparkles size={16} />
                  <span>{isGenerating ? 'Synthesizing with Gemini...' : 'Generate Microclimate Diagnosis'}</span>
                </button>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                👈 Click any census tract on the map or select one in the left panel to run an AI vulnerability diagnosis.
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Council Memorandum */}
        {mode === 'council' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Generates an executive policy memorandum ready for presentation to the <b>Raleigh City Council</b> and <b>Wake County Commissioners</b>, synthesizing dead zones and federal grant eligibility (Justice40, FEMA BRIC).
            </p>
            <button 
              className="btn-primary-action"
              onClick={handleGenerateCouncilMemo}
              disabled={isGenerating}
            >
              <Sparkles size={16} />
              <span>{isGenerating ? 'Drafting Memorandum with Gemini...' : 'Draft Official Council Briefing'}</span>
            </button>
          </div>
        )}

        {/* Mode 3: Interactive Chat */}
        {mode === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            <div style={{ flex: 1, minHeight: '220px', maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chatHistory.length === 0 && (
                <div style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center', marginTop: '40px' }}>
                  Ask any question regarding Raleigh's heat islands, street shade priorities, or cooling infrastructure funding.
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div 
                  key={i}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    background: msg.sender === 'user' ? '#2563eb' : 'rgba(30, 41, 59, 0.7)',
                    color: '#f8fafc',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)'
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text"
                placeholder="Ask Climate Copilot..."
                className="control-select"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <button type="submit" className="btn-primary-action" style={{ padding: '8px 14px' }}>
                <Send size={15} />
              </button>
            </form>
          </div>
        )}

        {/* Generated Output Display */}
        {copilotText && mode !== 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary-action" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={handleCopy}>
                {copied ? <Check size={13} style={{ color: '#10b981' }} /> : null}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
              <button 
                className="btn-primary-action" 
                style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
                onClick={() => onSendToAudio(copilotText)}
              >
                <Radio size={13} />
                <span>Send to Voice Synthesizer</span>
              </button>
            </div>

            <div className="copilot-output-container">
              {copilotText.split('\n').map((line, i) => {
                if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
                  return <h4 key={i}>{line.replace(/^#+\s*/, '')}</h4>;
                }
                if (line.startsWith('> ')) {
                  return <blockquote key={i}>{line.replace(/^>\s*/, '')}</blockquote>;
                }
                if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                  return <li key={i}>{line.replace(/^[\s-*]+/, '')}</li>;
                }
                if (!line.trim()) return <br key={i} />;
                return <p key={i} style={{ marginBottom: '6px' }}>{line}</p>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
