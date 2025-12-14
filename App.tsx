import React, { useState, useEffect } from 'react';
import { Course, Task, ViewState } from './types';
import CourseSetup from './components/CourseSetup';
import Dashboard from './components/Dashboard';
import StudyAssistant from './components/StudyAssistant';
import { generateStudySchedule } from './services/geminiService';
import { Calendar, LayoutDashboard, Settings, User } from 'lucide-react';

const App: React.FC = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<ViewState>('setup');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load state from local storage on mount (simple persistence)
  useEffect(() => {
    const savedCourse = localStorage.getItem('scholar_course');
    const savedTasks = localStorage.getItem('scholar_tasks');
    if (savedCourse) {
      setCourse(JSON.parse(savedCourse));
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);
      setView('dashboard');
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (course) localStorage.setItem('scholar_course', JSON.stringify(course));
    if (tasks.length > 0) localStorage.setItem('scholar_tasks', JSON.stringify(tasks));
  }, [course, tasks]);

  const handleCourseComplete = async (newCourse: Course) => {
    setCourse(newCourse);
    setIsGenerating(true);
    // Generate initial schedule
    const newTasks = await generateStudySchedule(newCourse);
    setTasks(newTasks);
    setIsGenerating(false);
    setView('dashboard');
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const resetData = () => {
    if(confirm("Are you sure you want to reset your profile? This cannot be undone.")) {
        localStorage.clear();
        setCourse(null);
        setTasks([]);
        setView('setup');
    }
  };

  if (view === 'setup') {
    if (isGenerating) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <h2 className="text-2xl font-bold text-white">Analyzing Syllabus...</h2>
                <p className="text-gray-400 mt-2">JEdu ai is creating your personalized study plan.</p>
            </div>
        )
    }
    return (
      <div className="min-h-screen bg-background py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center mb-8 space-x-3">
             <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                <User className="text-white w-6 h-6"/>
             </div>
             <span className="text-2xl font-bold tracking-tight text-white">JEdu ai</span>
          </div>
          <CourseSetup onComplete={handleCourseComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-textMain">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-surface border-r border-borderDark hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center space-x-3">
           <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <User className="text-white w-5 h-5"/>
           </div>
           <span className="text-xl font-bold tracking-tight text-white hidden lg:block">JEdu ai</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 ${view === 'dashboard' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-400 hover:bg-surfaceHighlight hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden lg:block font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setView('planner')}
            className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 ${view === 'planner' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-400 hover:bg-surfaceHighlight hover:text-white'}`}
          >
            <Calendar className="w-5 h-5" />
            <span className="hidden lg:block font-medium">Planner</span>
          </button>
        </nav>

        <div className="p-4 border-t border-borderDark">
            <button 
                onClick={resetData}
                className="flex items-center space-x-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
                <Settings className="w-5 h-5" />
                <span className="hidden lg:block font-medium">Reset Data</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-surface border-b border-borderDark p-4 flex justify-between items-center sticky top-0 z-30">
            <span className="font-bold text-lg text-white">JEdu ai</span>
            <button onClick={() => setView(view === 'dashboard' ? 'planner' : 'dashboard')} className="p-2 text-gray-300">
                {view === 'dashboard' ? <Calendar /> : <LayoutDashboard />}
            </button>
        </div>

        {view === 'dashboard' && course && (
          <Dashboard 
            course={course} 
            tasks={tasks} 
            onTaskClick={setActiveTask}
            onNavigate={setView}
          />
        )}

        {view === 'planner' && (
            <div className="p-6 max-w-5xl mx-auto animate-fade-in">
                <h1 className="text-3xl font-bold text-white mb-6">Weekly Study Plan</h1>
                <div className="space-y-8">
                    {/* Group tasks by date */}
                    {Array.from(new Set(tasks.map(t => t.date))).sort().map(date => (
                        <div key={date as string} className="bg-surface rounded-xl shadow-lg border border-borderDark overflow-hidden">
                            <div className="bg-surfaceHighlight/50 px-6 py-3 border-b border-borderDark flex justify-between items-center">
                                <h3 className="font-semibold text-gray-200">
                                    {new Date(date as string).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                </h3>
                                {date === new Date().toISOString().split('T')[0] && (
                                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2 py-1 rounded-full font-bold">TODAY</span>
                                )}
                            </div>
                            <div className="divide-y divide-borderDark">
                                {tasks.filter(t => t.date === date).map(task => (
                                    <div 
                                        key={task.id}
                                        onClick={() => setActiveTask(task)}
                                        className="p-4 hover:bg-surfaceHighlight cursor-pointer flex items-center group transition-colors"
                                    >
                                        <div className={`w-4 h-4 rounded border mr-4 flex items-center justify-center ${task.isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                                            {task.isCompleted && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <h4 className={`font-medium ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-200 group-hover:text-indigo-400'}`}>{task.title}</h4>
                                                <span className="text-xs text-gray-500">{task.durationMinutes}m</span>
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">{task.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>

      {/* Slide-over Assistant */}
      {activeTask && course && (
        <StudyAssistant 
            activeTask={activeTask}
            course={course}
            onClose={() => setActiveTask(null)}
            onCompleteTask={toggleTaskCompletion}
        />
      )}
    </div>
  );
};

export default App;