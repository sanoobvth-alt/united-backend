import axios from "axios";
import ApiError from "../../../utils/ApiError.js";

const ALLOWED_ACTIONS = [
  "create_task_direct",
  "create_epic_story_subtasks",
  "create_subtask_under_story",
];

export async function parseJiraPrompt(prompt) {
  if (!prompt || typeof prompt !== "string") {
    throw new ApiError(400, "Prompt required");
  }

  const geminiUrl = buildGeminiUrl();
  const systemInstruction = `
    Extract Jira automation intent and return STRICT JSON only.

    Allowed action values:
    - create_task_direct
    - create_epic_story_subtasks
    - create_subtask_under_story

    JSON shape:
    {
      "action": "create_task_direct | create_epic_story_subtasks | create_subtask_under_story",
      "task": {
        "summary": "",
        "description": "",
        "priority": "Low | Medium | High | Highest",
        "assigneeName": ""
      },
      "epic": {
        "summary": "",
        "description": "",
        "priority": "Low | Medium | High | Highest",
        "assigneeName": ""
      },
      "tasks": [
        {
          "summary": "",
          "description": "",
          "priority": "Low | Medium | High | Highest",
          "assigneeName": ""
        }
      ],
      "story": {
        "summary": "",
        "description": "",
        "priority": "Low | Medium | High | Highest",
        "assigneeName": ""
      },
      "subtasks": [
        {
          "summary": "",
          "description": "",
          "assigneeName": ""
        }
      ],
      "targetStorySummary": ""
    }

    Rules:
    - If prompt asks for only "task", use create_task_direct.
    - If prompt asks for epic + tasks, use create_epic_story_subtasks and fill "tasks".
    - If prompt uses old wording like epic + story + subtasks, convert the work items into "tasks".
    - If prompt asks to create a subtask under an existing story, use create_subtask_under_story and fill targetStorySummary.
    - Always fill best possible summary/description values from prompt.
    - Return only valid JSON without markdown.
    - Return only JSON. No explanation.
  `;

  const response = await axios.post(geminiUrl, {
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${systemInstruction}\n\nUser Prompt: ${prompt}`,
          },
        ],
      },
    ],
  });

  const raw =
    response?.data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("\n") || "";
  let parsed;

  try {
    parsed = JSON.parse(stripCodeFence(raw));
  } catch {
    throw new ApiError(400, "Unable to parse prompt into Jira payload");
  }

  if (!ALLOWED_ACTIONS.includes(parsed?.action)) {
    throw new ApiError(400, "Unsupported action parsed from prompt");
  }

  return parsed;
}

function buildGeminiUrl() {
  if (process.env.GEMINI_API_URL) {
    return process.env.GEMINI_API_URL;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new ApiError(
      500,
      "Gemini API key missing. Set GEMINI_API_KEY or GOOGLE_API_KEY",
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

function stripCodeFence(content = "") {
  return content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}
