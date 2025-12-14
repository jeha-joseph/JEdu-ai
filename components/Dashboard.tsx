import React from 'react';
import { Course, Task } from '../types';
import { BookOpen, CheckCircle, Clock, TrendingUp, Trophy, Zap, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  course: Course;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onNavigate: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ course, tasks, onTaskClick, onNavigate }) => {
  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(t => t.date === today);
  const completedTasks = tasks.filter(t => t.isCompleted);
  const todaysCompleted = todaysTasks.filter(t => t.isCompleted);
  
  const progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  
  // Calculate total XP earned today
  const dailyXpEarned = todaysCompleted.reduce((acc, curr) => acc + (curr.xp || 50), 0);
  const dailyXpTotal = todaysTasks.reduce((acc, curr) => acc + (curr.xp || 50), 0);

  // Mock data for the chart
  const data = [
    { name: 'Completed', value: completedTasks.length },
    { name: 'Remaining', value: tasks.length - completedTasks.length },
  ];
  const COLORS = ['#10b981', '#334155']; // Emerald and Slate 700

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Hello, {course.studentName || 'Student'}! 👋</h1>
          <p className="text-gray-400 mt-1">Here is your progress for <span className="font-semibold text-primary">{course.name}</span></p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm text-gray-400">Current Semester</p>
          <p className="text-xl font-semibold text-gray-200">{course.semester}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-xl shadow-lg border border-borderDark flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Subjects</p>
            <p className="text-2xl font-bold text-white">{course.subjects.length}</p>
          </div>
        </div>
        
        <div className="bg-surface p-6 rounded-xl shadow-lg border border-borderDark flex items-center space-x-4">
          <div className="p-3 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Tasks Done</p>
            <p className="text-2xl font-bold text-white">{completedTasks.length}/{tasks.length}</p>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl shadow-lg border border-borderDark flex items-center space-x-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Daily XP</p>
            <p className="text-2xl font-bold text-white">{dailyXpEarned} <span className="text-sm font-normal text-gray-500">/ {dailyXpTotal}</span></p>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl shadow-lg border border-borderDark flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Study Hours</p>
            <p className="text-2xl font-bold text-white">{course.dailyStudyHours}h / day</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule - Gamified */}
        <div className="lg:col-span-2 bg-surface rounded-xl shadow-lg border border-borderDark p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
                <Target className="text-accent w-6 h-6" />
                <h2 className="text-xl font-bold text-white">Daily Quests</h2>
            </div>
            <button 
                onClick={() => onNavigate('planner')}
                className="text-sm text-primary hover:text-indigo-400 hover:underline"
            >
                View Full Calendar
            </button>
          </div>

          {todaysTasks.length === 0 ? (
             <div className="text-center py-10 text-gray-500 bg-surfaceHighlight/20 rounded-lg border border-dashed border-borderDark">
                <div className="w-12 h-12 bg-surfaceHighlight rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="text-gray-400 w-6 h-6" />
                </div>
                <p>No quests active for today. Enjoy your rest! ☕️</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
                {todaysTasks.map(task => (
                <div 
                    key={task.id} 
                    onClick={() => onTaskClick(task)}
                    className={`relative overflow-hidden group p-4 rounded-xl border transition-all duration-300 cursor-pointer 
                        ${task.isCompleted 
                            ? 'bg-surfaceHighlight/30 border-borderDark opacity-60' 
                            : 'bg-gradient-to-br from-surface to-surfaceHighlight border-borderDark hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1'
                        }`}
                >
                    {/* XP Badge */}
                    <div className="absolute top-0 right-0 bg-surfaceHighlight px-3 py-1 rounded-bl-lg border-b border-l border-borderDark text-xs font-bold text-accent flex items-center shadow-sm">
                        <Zap className="w-3 h-3 mr-1 fill-accent" />
                        {task.xp || 50} XP
                    </div>

                    <div className="flex items-start mt-2">
                        <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors 
                            ${task.isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-primary'}`}>
                            {task.isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div className="ml-4 flex-1">
                            <h3 className={`font-semibold text-lg ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-100 group-hover:text-primary'}`}>
                                {task.title}
                            </h3>
                            
                            <div className="flex flex-wrap items-center mt-2 gap-3 text-xs">
                                <span className={`px-2 py-0.5 rounded-full border ${
                                    task.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                    task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                    {task.priority} Priority
                                </span>
                                
                                <div className="flex items-center text-gray-400">
                                    <Clock className="w-3 h-3 mr-1"/>
                                    {task.durationMinutes} min
                                </div>
                                
                                <span className="font-medium text-gray-300 bg-surfaceHighlight px-2 py-0.5 rounded border border-borderDark">
                                    {task.subjectId}
                                </span>
                            </div>
                            
                            <p className="text-sm text-gray-500 mt-3 line-clamp-1 group-hover:line-clamp-none transition-all">
                                {task.description}
                            </p>
                        </div>
                    </div>
                </div>
                ))}
            </div>
          )}
        </div>

        {/* Analytics Summary */}
        <div className="bg-surface rounded-xl shadow-lg border border-borderDark p-6 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6">Syllabus Progress</h2>
            <div className="flex-1 flex flex-col justify-center items-center">
                <div className="w-48 h-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-3xl font-bold text-white">{progress}%</span>
                        <span className="text-xs text-gray-400">Completed</span>
                    </div>
                </div>
                <div className="mt-6 space-y-3 w-full">
                    {course.subjects.slice(0, 3).map(sub => (
                        <div key={sub.id} className="w-full">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-gray-300">{sub.name}</span>
                                <span className="text-gray-500">{sub.proficiency}% conf.</span>
                            </div>
                            <div className="w-full bg-background rounded-full h-2">
                                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${sub.proficiency}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;