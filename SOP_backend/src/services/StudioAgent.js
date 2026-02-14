import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";

const llm = new ChatOpenAI({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
    configuration: {
        baseURL: "https://api.groq.com/openai/v1",
    },
});

// const TOOL_PROMPTS = {
//     quiz: "Generate a 5-question multiple choice quiz based on the provided context. Return valid JSON: { questions: [{ question, options: [], answer }] }",
//     mindmap: "Create a hierarchical mind map structure from the context. Return valid JSON: { title, children: [{ title, children: [] }] }",
//     reports: "Generate a comprehensive summary report of the documents. Return valid JSON: { title, summary, key_findings: [], conclusion }",
//     flashcards: "Create a set of 5 flashcards (question/answer pairs) for studying the context. Return valid JSON: { flashcards: [{ front, back }] }",
//     audio: "Create a script for a 2-minute podcast overview of the documents. Return valid JSON: { title, script: '' }",
//     video: "Create a storyboard/script for a short video overview. Return valid JSON: { title, scenes: [{ description, dialogue }] }",
//     infographic: "Identify the top 5 statistical or key facts for an infographic. Return valid JSON: { title, points: [{ label, value, icon_suggestion }] }",
//     slides: "Outline a 5-slide presentation based on the context. Return valid JSON: { title, slides: [{ slide_title, bullet_points: [] }] }",
//     datatable: "Extract key entities or data into a tabular format. Return valid JSON: { headers: [], rows: [[]] }",
//     notes: "Generate structured study notes. Return valid JSON: { title, sections: [{ heading, content }] }",
// };



const TOOL_PROMPTS = {
    quiz: "Create a 10-question multiple-choice quiz based on the context. Ensure questions vary in difficulty (Bloom's Taxonomy). Distractors (wrong options) must be plausible. Return valid JSON: { questions: [{ question: string, options: [string, string, string, string], answer: string, explanation: string }] }",

    mindmap: "Analyze the core themes and sub-topics of the context to create a hierarchical mind map. Limit to 3 levels of depth for clarity. Return valid JSON: { title: string, children: [{ title: string, children: [{ title: string }] }] }",

    reports: "Draft a formal executive summary of the provided documents. Focus on objectives, methodology (if apparent), and outcomes. Return valid JSON: { title: string, summary: string, key_findings: [string], action_items: [string], conclusion: string }",

    flashcards: "Extract 5 high-impact concepts from the context to create study flashcards. Focus on definitions, formulas, or key dates. Return valid JSON: { flashcards: [{ front: string, back: string, category: string }] }",

    audio: "Write a conversational script for a 2-minute 'Explain Like I'm Five' podcast episode. Use an engaging intro and a summary outro. Return valid JSON: { title: string, script: string, speaker_notes: string }",

    video: "Develop a visual storyboard for a 60-second educational video. Describe the visual composition and the accompanying narration for 4 key scenes. Return valid JSON: { title: string, scenes: [{ visual_description: string, audio_script: string, duration_seconds: number }] }",

    infographic: "Identify 5 data points or categorical facts suitable for a visual dashboard. Suggest a specific Lucide-react or FontAwesome icon for each. Return valid JSON: { title: string, points: [{ label: string, value: string, icon_key: string, significance: string }] }",

    slides: "Design a professional 10-slide presentation outline. Slide 1 is Intro, Slide 5 is Conclusion. Ensure logical flow between points. Return valid JSON: { title: string, slides: [{ slide_number: number, slide_title: string, bullet_points: [string], visual_cue: string }] }",

    datatable: "Perform Named Entity Recognition (NER) to extract key data (e.g., Names, Metrics, Dates, or Locations) into a structured table. Return valid JSON: { title: string, headers: [string], rows: [[string]] }",

    notes: "Organize the context into structured Cornell-style study notes. Use Markdown formatting within the content strings for bolding and lists. Return valid JSON: { title: string, sections: [{ heading: string, content: string, keywords: [string] }] }"
};

export const runStudioAgent = async (toolId, context) => {
    const prompt = TOOL_PROMPTS[toolId] || "Summarize the context.";

    const response = await llm.invoke([
        new SystemMessage(`You are a specialized content creator. ${prompt} Ensure the output is strictly valid JSON and based ONLY on the provided context.`),
        new HumanMessage(`CONTEXT:\n${context}`)
    ]);

    try {
        // Attempt to extract JSON if the model included conversational filler
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : response.content);
    } catch (error) {
        console.error("AI failed to return valid JSON for tool:", toolId, response.content);
        throw new Error("Failed to generate structured content");
    }
};
