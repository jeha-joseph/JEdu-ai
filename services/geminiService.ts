import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Course, Schedule, Task, Explanation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to get formatted date
const getToday = () => new Date().toISOString().split('T')[0];

export const generateStudySchedule = async (course: Course): Promise<Task[]> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    You are an elite academic strategist for a student named ${course.studentName || 'Student'}. Create a professional, high-performance 7-day study schedule based on the following profile:
    
    Course: ${course.name} (${course.degree}, Semester ${course.semester}).
    Daily Capacity: ${course.dailyStudyHours} hours of focused deep work.
    Subjects & Syllabus:
    ${course.subjects.map(s => `- ${s.name}: ${s.syllabusTopics.join(', ')}`).join('\n')}
    Target Exam Date: ${course.examDate || 'None specified'}.

    Objective:
    Generate a structured, logical sequence of study tasks for the next 7 days starting from ${getToday()}.
    - Ensure topics flow logically (foundational concepts before advanced ones).
    - Break down complex syllabus items into manageable "Deep Work" sessions.
    - Prioritize based on exam proximity and high-yield topics.
    
    Return ONLY JSON.
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subjectId: { type: Type.STRING, description: "Use the subject name as ID" },
        description: { type: Type.STRING },
        durationMinutes: { type: Type.INTEGER },
        priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
        date: { type: Type.STRING, description: "YYYY-MM-DD format" },
      },
      required: ["title", "subjectId", "description", "durationMinutes", "priority", "date"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3, 
      },
    });

    const rawTasks = JSON.parse(response.text || '[]');
    
    // Enrich with IDs and default completion status
    return rawTasks.map((t: any, index: number) => ({
      ...t,
      id: `generated-${Date.now()}-${index}`,
      isCompleted: false,
      xp: Math.round(t.durationMinutes * 1.5) // 1.5 XP per minute of study
    }));
  } catch (error) {
    console.error("Failed to generate schedule:", error);
    return [];
  }
};

export const explainTopic = async (topic: string, context: string): Promise<Explanation | null> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Act as a Professor specializing in this field.
    Topic: ${topic}
    Context: ${context}
    
    Provide a comprehensive academic explanation of this topic.
    
    Structure your response as a JSON object with:
    1. "overview": A professional 2-3 sentence executive summary of the topic.
    2. "sections": An array of objects, where each object has:
       - "point": A clear, academic subheading (e.g., "Theoretical Framework").
       - "detail": A detailed explanation suitable for a university-level student (2-3 paragraphs).
    
    Maintain a formal, educational tone.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        overview: { type: Type.STRING },
        sections: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    point: { type: Type.STRING },
                    detail: { type: Type.STRING }
                },
                required: ["point", "detail"]
            }
        }
    },
    required: ["overview", "sections"]
  };

  try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
      });
      return JSON.parse(response.text || '{}');
  } catch (e) {
      console.error("Failed to explain topic", e);
      return null;
  }
};

export const findStudyResources = async (topic: string, courseContext: string): Promise<{ text: string; resources: any[] }> => {
  // We use the search tool to find real, up-to-date links
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Find authoritative academic resources, certification courses, and high-quality educational content for learning "${topic}".
    Context: The student is studying ${courseContext}.
    
    Prioritize:
    1. University-backed content (MIT OpenCourseWare, Harvard Online, etc.)
    2. Professional Certifications (Coursera, edX, Google Career Certificates)
    3. Reputable technical documentation or tutorials.
    
    Return a professional summary of why these resources are relevant.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No resources found.";
    
    // Extract grounding metadata to get the actual links provided by the tool
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const resources = chunks
      .map((chunk: any) => chunk.web ? {
        title: chunk.web.title,
        url: chunk.web.uri,
        source: new URL(chunk.web.uri).hostname,
        type: 'Web'
      } : null)
      .filter(Boolean);

    return { text, resources };
  } catch (error) {
    console.error("Failed to find resources:", error);
    return { text: "Error searching for resources.", resources: [] };
  }
};

export const chatWithTutor = async (history: {role: string, parts: {text: string}[]}[], message: string, studentName: string = 'Student') => {
    // Basic chat wrapper
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
            systemInstruction: `You are 'JEdu', a highly professional, world-class academic tutor and mentor. 
            
            Your Persona:
            1. **Professional & Articulate**: Communicate with clarity, precision, and a supportive yet formal tone.
            2. **Expert Knowledge**: Provide accurate, deep, and well-structured explanations suitable for a serious student.
            3. **Encouraging**: Motivate the student (${studentName}) to achieve academic excellence.
            4. **Objective**: Avoid slang, sarcasm, or scolding. Focus purely on efficiency, understanding, and results.
            
            Context: You are helping the student study specific topics in their course.`
        }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
}
