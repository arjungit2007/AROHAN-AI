import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { VoiceInputModal } from '../components/voice/VoiceInputModal';
import { 
  Send, 
  Sparkles, 
  Mic, 
  ArrowLeft, 
  User, 
  Bot, 
  HelpCircle, 
  Compass, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

interface CareerDiscoveryProps {
  onBackToRecommendations: () => void;
  onSelectPathwayRoadmap: (title: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggested_actions?: string[];
  identified_pathways?: string[];
  is_demo_mode?: boolean;
  is_error?: boolean;
  retryText?: string;
}

export const CareerDiscovery: React.FC<CareerDiscoveryProps> = ({
  onBackToRecommendations,
  onSelectPathwayRoadmap
}) => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Vanakkam ${user?.full_name?.split(' ')[0] || 'Friend'}! I am Arohan AI, your career guide. Based on your stage (${profile?.current_class_or_year || 'Class 10'}), I can help you understand subject choices, government scholarships, polytechnic vs 10+2, competitive exams, or technical careers. What questions are on your mind today?`,
      suggested_actions: [
        'Compare Academic vs Vocational after Class 10',
        'Can I learn coding from my village with just a phone?',
        'How do I prepare for TNPSC exams without coaching fees?',
        'Which scholarships cover college tuition and hostel?'
      ],
      is_demo_mode: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isLoading) return;

    const userMessage: Message = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.chatWithAI(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        profile || undefined
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        suggested_actions: response.suggested_actions || [],
        identified_pathways: response.identified_pathways || [],
        is_demo_mode: response.is_demo_mode
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'I apologize, but I could not reach the server. Please check your connectivity and try again.',
          suggested_actions: ['Retry last message'],
          is_error: true,
          retryText: content,
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4 bg-white p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToRecommendations}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Back to pathway cards"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">AI Career Discovery Chat</h2>
              <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-semibold border border-purple-200">
                Rural Advisor
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Personalized guidance grounded in verified schemes & realistic Indian education pathways.
            </p>
          </div>
        </div>

        {profile && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900">{profile.current_class_or_year}</span>
            <span>•</span>
            <span className="truncate max-w-[120px]">{profile.favorite_subjects?.[0] || 'General'}</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-purple-600 text-white shadow-xs'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              role={msg.is_error ? 'alert' : undefined}
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : msg.is_error
                  ? 'bg-red-50 border border-red-200 text-red-900'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>

              {/* Identified Pathways Chips */}
              {msg.identified_pathways && msg.identified_pathways.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Identified Realistic Pathways:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.identified_pathways.map((pName, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => onSelectPathwayRoadmap(pName)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs border border-blue-200 flex items-center gap-1 transition"
                      >
                        <Compass className="w-3 h-3 text-blue-600" />
                        <span>Build Roadmap: {pName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Next Questions / Actions */}
              {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 mb-1">Suggested Next Steps:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggested_actions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        type="button"
                        onClick={() => handleSendMessage(msg.retryText || action)}
                        className="text-left text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition flex items-center gap-1"
                      >
                        <span>{action}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-slate-500 p-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>Arohan AI is formulating guidance...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => setIsVoiceOpen(true)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
            title="Use voice input (Tamil / English)"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            aria-label="Message the career guide"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about careers, courses, scholarships, or doubts..."
            className="flex-1 text-xs sm:text-sm px-3 py-2 outline-none text-slate-800 placeholder-slate-400 bg-transparent"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition shadow-xs"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Voice Modal */}
      <VoiceInputModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onTranscriptComplete={(transcription) => {
          setInputText(transcription);
          handleSendMessage(transcription);
        }}
        initialPrompt="Ask your career question in Tamil or English..."
      />
    </div>
  );
};
