import React, { useState, useEffect } from 'react';
import { Task, Course, Explanation } from '../types';
import { explainTopic, findStudyResources, chatWithTutor } from '../services/geminiService';
import { Bot, Lightbulb, PlayCircle, Book, ExternalLink, MessageSquare, ChevronRight, Check, ChevronDown, Download, FileText, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';

interface StudyAssistantProps {
  activeTask: Task | null;
  course: Course;
  onClose: () => void;
  onCompleteTask: (id: string) => void;
}

const StudyAssistant: React.FC<StudyAssistantProps> = ({ activeTask, course, onClose, onCompleteTask }) => {
  const [mode, setMode] = useState<'learn' | 'resources' | 'chat'>('learn');
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [resources, setResources] = useState<{text: string, resources: any[]}>({ text: '', resources: [] });
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);

  useEffect(() => {
    if (activeTask && mode === 'learn' && !explanation) {
      loadExplanation();
    }
    if (activeTask && mode === 'resources' && !resources.text) {
      loadResources();
    }
  }, [activeTask, mode]);

  const loadExplanation = async () => {
    if (!activeTask) return;
    setLoading(true);
    const data = await explainTopic(activeTask.title, `Subject: ${activeTask.subjectId}. Description: ${activeTask.description}`);
    setExplanation(data);
    setLoading(false);
  };

  const loadResources = async () => {
    if (!activeTask) return;
    setLoadingResources(true);
    const data = await findStudyResources(activeTask.title, course.name);
    setResources(data);
    setLoadingResources(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setLoading(true);
    
    const historyForApi = chatHistory.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
    }));

    const response = await chatWithTutor(historyForApi, userMsg, course.studentName);
    setChatHistory(prev => [...prev, { role: 'model', text: response || 'Sorry, I missed that.' }]);
    setLoading(false);
  };

  const downloadNotes = () => {
      if (!explanation || !activeTask) return;

      const doc = new jsPDF();
      let y = 10;

      // Header
      doc.setFontSize(20);
      doc.text(activeTask.title, 10, y);
      y += 10;
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`${activeTask.subjectId} - Study Notes`, 10, y);
      y += 15;

      // Overview
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Overview", 10, y);
      y += 7;
      doc.setFontSize(11);
      const overviewLines = doc.splitTextToSize(explanation.overview, 180);
      doc.text(overviewLines, 10, y);
      y += (overviewLines.length * 5) + 10;

      // Sections
      explanation.sections.forEach((section, idx) => {
          if (y > 270) {
              doc.addPage();
              y = 10;
          }
          doc.setFontSize(13);
          doc.setFont(undefined, 'bold');
          doc.text(`${idx + 1}. ${section.point}`, 10, y);
          y += 7;
          
          doc.setFontSize(11);
          doc.setFont(undefined, 'normal');
          const detailLines = doc.splitTextToSize(section.detail, 180);
          doc.text(detailLines, 10, y);
          y += (detailLines.length * 5) + 10;
      });

      doc.save(`${activeTask.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.pdf`);
  };

  if (!activeTask) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full md:w-[600px] bg-surface h-full shadow-2xl flex flex-col animate-slide-in-right border-l border-borderDark">
        {/* Header */}
        <div className="p-6 border-b border-borderDark flex justify-between items-start bg-indigo-600/20 text-white">
          <div>
            <div className="flex items-center space-x-2 text-indigo-200 text-sm mb-1">
              <span>{activeTask.subjectId}</span>
              <ChevronRight className="w-3 h-3" />
              <span>Study Session</span>
            </div>
            <h2 className="text-2xl font-bold leading-tight">{activeTask.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
             <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-borderDark bg-background">
          <button 
            onClick={() => setMode('learn')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${mode === 'learn' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-surface' : 'text-gray-400 hover:text-gray-200 hover:bg-surfaceHighlight'}`}
          >
            <Lightbulb className="w-4 h-4" /> <span>Explain</span>
          </button>
          <button 
            onClick={() => setMode('resources')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${mode === 'resources' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-surface' : 'text-gray-400 hover:text-gray-200 hover:bg-surfaceHighlight'}`}
          >
            <PlayCircle className="w-4 h-4" /> <span>Resources</span>
          </button>
          <button 
            onClick={() => setMode('chat')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${mode === 'chat' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-surface' : 'text-gray-400 hover:text-gray-200 hover:bg-surfaceHighlight'}`}
          >
            <Bot className="w-4 h-4" /> <span>JEdu</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          
          {mode === 'learn' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400 animate-pulse">Analyzing topic and generating notes...</p>
                </div>
              ) : explanation ? (
                <>
                    {/* Overview Card */}
                    <div className="bg-surface p-6 rounded-xl border border-borderDark shadow-sm">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                            <Target className="w-4 h-4 mr-2" /> Overview
                        </h3>
                        <p className="text-gray-200 leading-relaxed text-lg">
                            {explanation.overview}
                        </p>
                    </div>
                    
                    {/* Key Points */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Key Concepts</h3>
                             <button 
                                onClick={downloadNotes}
                                className="flex items-center text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full hover:bg-indigo-500/20 transition-colors"
                             >
                                <Download className="w-3 h-3 mr-1" /> PDF Notes
                             </button>
                        </div>
                        
                        {explanation.sections.map((section, idx) => {
                            const isExpanded = expandedSection === idx;
                            return (
                                <div key={idx} className="bg-surface rounded-xl border border-borderDark overflow-hidden transition-all duration-300">
                                    <button 
                                        onClick={() => setExpandedSection(isExpanded ? null : idx)}
                                        className="w-full p-4 flex items-center justify-between text-left hover:bg-surfaceHighlight/50 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mr-4 shrink-0 border border-indigo-500/20">
                                                {idx + 1}
                                            </div>
                                            <h4 className="font-semibold text-white">{section.point}</h4>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-0 pl-[4.5rem] animate-fade-in">
                                            <div className="h-px bg-borderDark mb-4 w-full"></div>
                                            <p className="text-gray-300 leading-relaxed text-sm">
                                                {section.detail}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
              ) : (
                  <div className="text-center text-gray-500 mt-10">
                      <p>Could not load explanation. Please try again.</p>
                  </div>
              )}
            </div>
          )}

          {mode === 'resources' && (
            <div className="space-y-6">
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-blue-300">
                        <Book className="w-4 h-4 inline mr-2"/>
                        We've searched for free courses, videos, and articles specifically for this topic.
                    </p>
                </div>

                {loadingResources ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        <p className="text-gray-400 animate-pulse">Searching the web for best content...</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-surface p-5 rounded-xl shadow-lg border border-borderDark">
                            <h3 className="font-semibold text-white mb-2">Summary</h3>
                            <p className="text-sm text-gray-400">{resources.text}</p>
                        </div>
                        
                        <div className="space-y-3">
                            {resources.resources.map((res, idx) => (
                                <a 
                                    key={idx} 
                                    href={res.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="block bg-surface p-4 rounded-xl shadow-sm border border-borderDark hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold text-indigo-400 group-hover:underline group-hover:text-indigo-300">{res.title}</h4>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="text-xs bg-surfaceHighlight text-gray-300 px-2 py-0.5 rounded">{res.source}</span>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-indigo-400" />
                                    </div>
                                </a>
                            ))}
                            {resources.resources.length === 0 && !loadingResources && (
                                <p className="text-center text-gray-500">No direct links found via search tool.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
          )}

          {mode === 'chat' && (
            <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4 mb-4">
                    {chatHistory.length === 0 && (
                        <div className="text-center text-gray-500 mt-10">
                            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>I am here to help you understand "{activeTask.title}". What would you like to know?</p>
                        </div>
                    )}
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${
                                msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-surface border border-borderDark text-gray-200 rounded-bl-none shadow-sm'
                            }`}>
                                <ReactMarkdown className="text-sm prose prose-invert">{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                     {loading && (
                        <div className="flex justify-start">
                            <div className="bg-surfaceHighlight rounded-lg p-3 rounded-bl-none">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Input area is handled in the footer of the modal conceptually or stickied here */}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-borderDark bg-surface">
          {mode === 'chat' ? (
             <div className="flex space-x-2">
                <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Type a question..."
                    className="flex-1 bg-background border border-borderDark rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-500"
                />
                <button 
                    onClick={handleChat}
                    disabled={!chatInput.trim() || loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    Send
                </button>
             </div>
          ) : (
             <button 
                onClick={() => {
                    onCompleteTask(activeTask.id);
                    onClose();
                }}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all ${
                    activeTask.isCompleted 
                    ? 'bg-surfaceHighlight text-gray-500 cursor-not-allowed border border-borderDark'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-500/20'
                }`}
                disabled={activeTask.isCompleted}
            >
                {activeTask.isCompleted ? (
                    <>
                        <Check className="w-5 h-5" /> <span>Quest Completed (+{activeTask.xp || 50} XP)</span>
                    </>
                ) : (
                    <>
                        <Check className="w-5 h-5" /> <span>Complete Task & Claim XP</span>
                    </>
                )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudyAssistant;