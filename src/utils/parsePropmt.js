import "dotenv/config";
import axios from "axios";
import OpenAI from "openai";

/* -----------------------------
   JIRA SETUP
----------------------------- */

const jira = axios.create({
  baseURL: `https://${process.env.JIRA_DOMAIN}`,
  headers: {
    "Content-Type": "application/json",
  },
  auth: {
    username: process.env.JIRA_EMAIL,
    password: process.env.JIRA_API_TOKEN,
  },
});

/* -----------------------------
   OPENAI SETUP
----------------------------- */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
/* -----------------------------
   PARSE NATURAL PROMPT
----------------------------- */
export async function parsePrompt(prompt) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
        Extract Jira issue fields from user input.
        Return STRICT JSON only in this format:

        {
          "summary": "",
          "description": "",
          "priority": "Low | Medium | High | Highest",
          "issueType": "Task | Story | Bug",
          "assigneeName": ""
        }
        `,
      },
      { role: "user", content: prompt },
    ],
  });

  return JSON.parse(completion.choices[0].message.content);
}

/* -----------------------------
   GET ACCOUNT ID FROM NAME
----------------------------- */
export async function getAccountIdByName(name) {
  const res = await jira.get("/rest/api/3/user/search", {
    params: { query: name },
  });

  if (!res.data.length) {
    throw new Error("User not found in Jira");
  }

  return res.data[0].accountId;
}

/* -----------------------------
   CREATE ISSUE
----------------------------- */
export async function createIssue(data, accountId) {
  const response = await jira.post("/rest/api/3/issue", {
    fields: {
      project: { key: process.env.PROJECT_KEY },
      summary: data.summary,
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: data.description }],
          },
        ],
      },
      issuetype: { name: data.issueType || "Task" },
      priority: { name: data.priority || "Medium" },
      assignee: { accountId },
    },
  });

  return response.data.id;
}

/* -----------------------------
   GET ACTIVE SPRINT
----------------------------- */

async function getActiveSprint() {
  const res = await jira.get(
    `/rest/agile/1.0/board/${process.env.BOARD_ID}/sprint`,
    { params: { state: "active" } },
  );

  if (!res.data.values.length) {
    throw new Error("No active sprint found");
  }

  return res.data.values[0].id;
}

/* -----------------------------
   ADD ISSUE TO SPRINT
----------------------------- */

async function addIssueToSprint(sprintId, issueId) {
  await jira.post(`/rest/agile/1.0/sprint/${sprintId}/issue`, {
    issues: [issueId],
  });
}

/* -----------------------------
   MAIN API ENDPOINT
----------------------------- */

export async function createTTask(req, res) {
  console.log(req?.body, "====");

  try {
    if (!req?.body?.prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    // 1. Parse using AI
    const parsed = await parsePrompt(req.body.prompt);

    // 2. Get Jira account ID
    const accountId = await getAccountIdByName(parsed.assigneeName);

    // 3. Create Issue
    const issueId = await createIssue(parsed, accountId);

    // 4. Get Active Sprint
    const sprintId = await getActiveSprint();

    // 5. Attach to Sprint
    await addIssueToSprint(sprintId, issueId);

    res.json({
      success: true,
      message: "Issue created and added to active sprint",
      issueId,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
}

/* -----------------------------
   START SERVER
----------------------------- */
