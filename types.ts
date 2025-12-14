export interface Subject {
  id: string;
  name: string;
  syllabusTopics: string[]; // Raw text or list
  proficiency: number; // 0-100
}

export interface Course {
  id: string;
  studentName: string;
  name: string;
  degree: string;
  semester: string;
  subjects: Subject[];
  examDate?: string;
  dailyStudyHours: number;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  description: string;
  durationMinutes: number;
  isCompleted: boolean;
  priority: 'High' | 'Medium' | 'Low';
  date: string; // YYYY-MM-DD
  xp: number;
}

export interface Schedule {
  weekStartDate: string;
  tasks: Task[];
}

export interface ExplanationPoint {
  point: string;
  detail: string;
}

export interface Explanation {
  overview: string;
  sections: ExplanationPoint[];
}

export interface Resource {
  title: string;
  url: string;
  source: string;
  type: 'Course' | 'Video' | 'Article' | 'Tutorial';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: Resource[];
}

export type ViewState = 'setup' | 'dashboard' | 'planner' | 'study' | 'analytics';
