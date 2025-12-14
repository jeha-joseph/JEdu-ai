import React, { useState } from 'react';
import { Course, Subject } from '../types';
import { Plus, Trash2, BookOpen, Clock, GraduationCap, User } from 'lucide-react';

interface CourseSetupProps {
  onComplete: (course: Course) => void;
}

const CourseSetup: React.FC<CourseSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [studentName, setStudentName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [semester, setSemester] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState(2);
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: '', syllabusTopics: [], proficiency: 50 }
  ]);

  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now().toString(), name: '', syllabusTopics: [], proficiency: 50 }]);
  };

  const updateSubject = (id: string, field: keyof Subject, value: any) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const handleSubmit = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      studentName,
      name: courseName,
      degree: "Not specified", // Removed from UI as requested
      semester,
      examDate,
      dailyStudyHours: dailyHours,
      subjects: subjects.filter(s => s.name.trim() !== '')
    };
    onComplete(newCourse);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-surface rounded-xl shadow-2xl border border-borderDark mt-10 animate-fade-in-up">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">Set Up Your Study Profile</h1>
        <p className="text-gray-400 mt-2">Let AI organize your academic life.</p>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Your Name / Nickname</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-borderDark rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder-gray-600"
                  placeholder="e.g. Alex"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Course / Major Name</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-borderDark rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder-gray-600"
                  placeholder="e.g. Computer Science"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Semester / Year</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-borderDark rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder-gray-600"
                placeholder="e.g. Semester 3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Next Major Exam Date (Optional)</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-borderDark rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Daily Study Hours Goal</label>
            <div className="relative">
                <Clock className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                <input
                    type="number"
                    min="1"
                    max="16"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-borderDark rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
            </div>
            <p className="text-xs text-gray-500 mt-1">We'll plan your tasks to fit this time budget.</p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              disabled={!courseName || !studentName}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg shadow-indigo-500/20"
            >
              Next: Add Subjects
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-indigo-500/10 p-4 rounded-lg border border-indigo-500/20 text-indigo-300 text-sm mb-4">
            Add your subjects and paste syllabus topics separated by commas. The AI will break them down.
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {subjects.map((subject, idx) => (
              <div key={subject.id} className="p-4 border border-borderDark rounded-lg bg-background relative group">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <input
                    type="text"
                    value={subject.name}
                    onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                    placeholder="Subject Name (e.g. Data Structures)"
                    className="w-full px-3 py-2 bg-surface border border-borderDark rounded text-white focus:ring-1 focus:ring-primary outline-none placeholder-gray-600"
                  />
                  <div className="flex items-center space-x-2">
                     <span className="text-xs text-gray-400 w-24">Confidence: {subject.proficiency}%</span>
                     <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={subject.proficiency}
                        onChange={(e) => updateSubject(subject.id, 'proficiency', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-surfaceHighlight rounded-lg appearance-none cursor-pointer accent-primary"
                     />
                  </div>
                </div>
                <textarea
                  value={subject.syllabusTopics.join(', ')}
                  onChange={(e) => updateSubject(subject.id, 'syllabusTopics', e.target.value.split(','))}
                  placeholder="Syllabus Topics (comma separated, e.g. Arrays, Linked Lists, Trees)"
                  className="w-full px-3 py-2 bg-surface border border-borderDark rounded text-white focus:ring-1 focus:ring-primary outline-none text-sm h-20 resize-none placeholder-gray-600"
                />
                
                {subjects.length > 1 && (
                  <button
                    onClick={() => removeSubject(subject.id)}
                    className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addSubject}
            className="flex items-center text-primary hover:text-indigo-400 font-medium text-sm"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Another Subject
          </button>

          <div className="flex justify-between pt-6 border-t border-borderDark">
            <button
              onClick={() => setStep(1)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-2 bg-secondary text-white rounded-lg hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transform hover:scale-105 transition-all font-medium"
            >
              Generate My Plan ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSetup;