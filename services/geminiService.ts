import { GoogleGenAI } from "@google/genai";
import { ProjectFile } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set. Please set it in your .env file.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MAX_CONTENT_LENGTH = 200000; // Character limit for file contents

function formatProjectFiles(files: ProjectFile[]): string {
  let combinedContent = "Project file structure:\n";
  const contentMap: { [key: string]: string } = {};

  // Create a directory structure string
  const fileTree = files.map(file => `- ${file.path}`).join('\n');
  combinedContent += fileTree + "\n\n";
  combinedContent += "Key file contents:\n\n";

  // Prioritize common config/manifest files
  const priorityFiles = [
    'package.json', 'pom.xml', 'build.gradle', 'requirements.txt', 'pyproject.toml',
    'Gemfile', 'composer.json', 'go.mod', 'Cargo.toml', 'docker-compose.yml', 'Dockerfile'
  ];

  // Sort files to process priority ones first
  const sortedFiles = [...files].sort((a, b) => {
    const aIsPriority = priorityFiles.includes(a.name);
    const bIsPriority = priorityFiles.includes(b.name);
    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    return 0;
  });

  for (const file of sortedFiles) {
    // Prevent exceeding the character limit
    if (combinedContent.length + file.content.length > MAX_CONTENT_LENGTH) {
      console.warn(`Skipping content of ${file.name} to stay within content limits.`);
      continue;
    }
    contentMap[file.path] = file.content;
  }
  
  for (const path in contentMap) {
      combinedContent += `--- FILE: ${path} ---\n${contentMap[path]}\n\n`;
  }

  return combinedContent;
}

const generateReadmePrompt = (filesSummary: string): string => {
  return `
    You are an expert software engineer specializing in creating professional and engaging GitHub README.md files.
    Your task is to analyze the following project files and generate a comprehensive README.md file in Markdown format.

    **Instructions:**
    1.  **Analyze the Code:** Infer the project's purpose, main language, framework, and key dependencies from the file structure and content.
    2.  **Generate a Professional README:** The README should be well-structured, clear, and visually appealing.
    3.  **Use Markdown:** The entire output must be a single block of valid Markdown. Do not wrap it in JSON or any other format.
    4.  **Include Relevant Badges:** Start with a project title and add relevant badges from shields.io. For example, for a JavaScript project with an MIT license, you could include:
        \`![Language](https://img.shields.io/badge/language-JavaScript-yellow.svg)\`
        \`![License](https://img.shields.io/badge/license-MIT-green.svg)\`
    5.  **Structure and Embellish:** Structure the README with the following sections. Use relevant emojis for titles to make it more engaging. Omit any sections that are not relevant.
        *   **Project Title:** An H1 header for the project name.
        *   **Description:** A short, compelling paragraph describing the project.
        *   ✨ **Features:** A bulleted list of key features.
        *   📚 **Tech Stack:** A list of the main technologies, frameworks, and libraries used.
        *   🚀 **Installation:** A step-by-step guide on how to get the development environment running. Include code blocks for commands.
        *   ▶️ **Usage:** How to use the application. Provide code examples.
        *   🤝 **Contributing:** A brief statement on how to contribute (e.g., "Pull requests are welcome...").
        *   📝 **License:** State the project's license (e.g., "Distributed under the MIT License."). Try to infer this from files like 'LICENSE' or 'package.json'. If not found, you can suggest adding one.

    **Project Files Data:**
    ${filesSummary}

    Now, generate the complete README.md file.
    `;
};


export const generateReadme = async (files: ProjectFile[]): Promise<string> => {
  if (files.length === 0) {
    return Promise.reject("No files provided.");
  }

  const filesSummary = formatProjectFiles(files);
  const prompt = generateReadmePrompt(filesSummary);
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
    });

    let text = response.text;
    
    // Clean up potential markdown code fences around the entire response
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = text.match(fenceRegex);
    if (match && match[2]) {
      text = match[2].trim();
    }
    
    return text;
  } catch (error) {
    console.error("Error generating README from Gemini:", error);
    throw new Error("Failed to generate README. Please check your API key and try again.");
  }
};