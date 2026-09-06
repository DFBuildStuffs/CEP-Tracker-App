import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { UserAccount, ChatMessage, ChatRoleConfig } from '../types';
import { getProgramTheme } from '../utils/programTheme';
import { sound } from '../utils/sound';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  GraduationCap,
  Calculator,
  Compass,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface Props {
  user: UserAccount;
}

const CHAT_ROLES: ChatRoleConfig[] = [
  {
    id: 'tutor',
    name: 'Board Exam Tutor',
    badge: 'Problem Solving & Theory',
    description: 'Expert engineering coach for Philippine Board Licensure (BSCE, BSABE, BSECE). Provides step-by-step formula derivations, problem solving tips, and engineering concepts.',
    systemInstruction: `You are an elite Engineering Board Exam Tutor and CEP (Competency Enhancement Program) Coach specialized in Philippine Engineering Board Licensure Exams (Civil Engineering - BSCE, Agricultural & Biosystems Engineering - BSABE, and Electronics Engineering - BSECE). 
Your mission is to guide scholars with deep technical rigor, step-by-step problem-solving demonstrations, formula derivations, and clear explanations.
When providing calculations:
1. State given parameters clearly.
2. State the fundamental governing formula and SI units.
3. Show algebraic steps before plugging in numbers.
4. Conclude with the final answer boxed or clearly highlighted with appropriate significant figures.
Be encouraging, academic, and structured.`,
    suggestedPrompts: [
      'Give me 3 high-yield formula review problems with solutions.',
      'Explain the difference between active and passive filters in communications.',
      'How do I calculate moment of inertia for composite structural sections?',
      'Review Bernoulli equation applications in hydraulic pipeline analysis.',
    ],
  },
  {
    id: 'advisor',
    name: 'CEP Passing Advisor',
    badge: 'Criteria & Study Plans',
    description: 'Specialist in CEP rules, passing thresholds, maintaining targets, and personalized study schedules.',
    systemInstruction: `You are the official CEP (Competency Enhancement Program) Academic Advisor.
You help engineering examinees strategize their 6-stage examination progression to conquer all areas.
Explain CEP benchmark rules clearly:
- Initial Pass Target: The student must score at least their set target (e.g. 65% or custom) to achieve initial passing status.
- Maintenance Target: Once initial passing has occurred, subsequent exams require maintaining at least the maintenance target (e.g. 45% or custom).
- Conquering an Area: Successfully completing 6 exams while meeting passing criteria.
- Special Exams: Required if an area is not cleared by exam 6.
Provide structured daily review timetables, Pomodoro pacing advice, and mockboard stress management.`,
    suggestedPrompts: [
      'How does the CEP initial passing vs maintenance target rule work?',
      'How should I divide my study hours between review and mockboard drills?',
      'What should I do if my mock exam score dropped below the maintenance threshold?',
      'Create a 7-day intensive review plan for my weakest area.',
    ],
  },
  {
    id: 'solver',
    name: 'Rapid Formula Solver',
    badge: 'Quick Concept & Units',
    description: 'Fast, concise answers for quick formula lookups, engineering constants, and definition checks.',
    systemInstruction: `You are a Rapid Engineering Reference Assistant. Provide direct, concise, high-yield answers without unnecessary fluff.
Focus on:
- Exact formulas with variable definitions and SI units.
- Standard engineering constants (e.g., g = 9.81 m/s², permittivity, shear modulus).
- Quick concept definitions.
Use bullet points and clean formatting so examinees can review rapidly during timed sessions.`,
    suggestedPrompts: [
      'What are Maxwell’s 4 fundamental equations in differential and integral forms?',
      'List the formulas for Euler critical buckling load and slenderness ratio.',
      'Provide the soil water tension and moisture retention formulas.',
      'State the Nyquist-Shannon sampling theorem and minimum sampling frequency.',
    ],
  },
];

const AVAILABLE_MODELS = [
  { id: 'gemini-3.1-flash-lite', name: 'Flash Lite (Free & Low Traffic)', tag: 'Recommended', icon: Zap },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', tag: 'Standard Flash', icon: Bot },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', tag: 'Balanced', icon: Cpu },
];

export const GeminiChatView: React.FC<Props> = ({ user }) => {
  const theme = getProgramTheme(user.program);
  const [selectedRole, setSelectedRole] = useState<string>('tutor');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-lite');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Initialize messages from localStorage or default welcoming message
  const storageChatKey = `cep_chat_${user.id}`;
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageChatKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
    return [
      {
        id: 'welcome_msg',
        role: 'model',
        text: `Hello **${user.userName}**! 👋 I am your **Gemini AI Board Exam Tutor** for **${user.program}**.\n\nWhether you need step-by-step problem solving, formula derivations for your **${user.areas.join(', ')}** modules, or strategic guidance on hitting your **${user.passTarget}%** passing target, I'm here to assist. What are we tackling today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.8-flash',
      },
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persist messages
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageChatKey, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save chat history:', e);
      }
    }
  }, [messages, storageChatKey]);

  const currentRoleConfig = CHAT_ROLES.find((r) => r.id === selectedRole) || CHAT_ROLES[0];

  // Enhanced system instruction tailored with student context
  const fullSystemInstruction = `${currentRoleConfig.systemInstruction}
CURRENT STUDENT CONTEXT:
- Student Name: ${user.userName}
- Engineering Program: ${user.program}
- CEP Areas / Subjects: ${user.areas.join(', ')}
- Initial Pass Target: ${user.passTarget}%
- Maintenance Target: ${user.maintTarget}%
- Active Streak: ${user.streak.count} days`;

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || isLoading) return;

    sound.playTap();
    setApiError(null);

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history (up to last 10 messages for context)
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome_msg')
        .slice(-10)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          history: historyPayload,
          model: selectedModel,
          systemInstruction: fullSystemInstruction,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();

      const aiMessage: ChatMessage = {
        id: `model_${Date.now()}`,
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
        roleId: selectedRole,
      };

      setMessages((prev) => [...prev, aiMessage]);
      sound.playMilestone();
    } catch (err: any) {
      console.error('Chat error:', err);
      setApiError(err.message || 'Unable to connect to Gemini. Please check your connection or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your conversation history?')) {
      const resetMsg: ChatMessage = {
        id: `welcome_${Date.now()}`,
        role: 'model',
        text: `Conversation cleared. How can I help you with your **${user.program}** review today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      };
      setMessages([resetMsg]);
      setApiError(null);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 pb-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      {/* Top Banner & Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl ${theme.classes.accentBgSubtle} flex items-center justify-center font-bold shadow-inner`}>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Gemini AI Study Coach</h2>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${theme.classes.badge}`}>
                  {theme.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-turn engineering reasoning, board formula derivations & CEP guidance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-xs font-bold py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
              title="Select Gemini Model"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.tag})
                </option>
              ))}
            </select>

            {/* Clear history button */}
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Clear Conversation"
              aria-label="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Role Selector Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {CHAT_ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  sound.playTap();
                  setSelectedRole(role.id);
                }}
                className={`p-2.5 rounded-2xl text-left transition-all border ${
                  isSelected
                    ? `${theme.classes.accentBg} text-white shadow-sm border-transparent`
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">{role.name}</span>
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    {role.badge}
                  </span>
                </div>
                <p className={`text-[11px] line-clamp-1 mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                  {role.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Thread */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className={`w-8 h-8 rounded-xl ${theme.classes.accentBgSubtle} flex items-center justify-center flex-shrink-0 mt-1 shadow-sm`}>
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm relative group ${
                  isUser
                    ? `${theme.classes.accentBg} text-white rounded-br-none`
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/70 rounded-bl-none'
                }`}
              >
                {/* Header info in bubble */}
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <span className={`text-[10px] font-bold tracking-wider uppercase ${isUser ? 'text-white/70' : 'text-slate-400'}`}>
                    {isUser ? user.userName : 'Gemini Tutor'}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.modelUsed && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${isUser ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                        {msg.modelUsed.replace('gemini-', '')}
                      </span>
                    )}
                    <span className={`text-[10px] ${isUser ? 'text-white/60' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10 dark:hover:bg-white/10`}
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Markdown Message Content */}
                <div className="text-xs sm:text-sm leading-relaxed space-y-2 break-words">
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
                      <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {msg.text}
                      </Markdown>
                    </div>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black text-xs flex-shrink-0 mt-1 shadow-sm">
                  {user.userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className={`w-8 h-8 rounded-xl ${theme.classes.accentBgSubtle} flex items-center justify-center flex-shrink-0 mt-1 shadow-sm`}>
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl rounded-bl-none p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs font-semibold text-slate-400 pl-2">Gemini is formulating engineering response...</span>
              </div>
            </div>
          </div>
        )}

        {/* API Error Box */}
        {apiError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={() => handleSendMessage()}
              className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Starter Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-shrink-0">
        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> Suggested:
        </span>
        {currentRoleConfig.suggestedPrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="text-[11px] font-medium px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors shadow-2xs disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-800 shadow-lg flex-shrink-0 transition-colors">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask Gemini about ${user.program} formulas, problems, or CEP targets...`}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none"
          />

          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className={`p-3 rounded-2xl ${theme.classes.accentBg} text-white font-bold transition-all shadow-md ${theme.classes.buttonShadow} disabled:opacity-40 disabled:scale-100 active:scale-95 flex items-center justify-center`}
            title="Send to Gemini"
            aria-label="Send to Gemini"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
