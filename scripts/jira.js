#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();
let baseUrl = "";
let auth = "";

function ensureEnv() {
  const requiredEnv = [
    "JIRA_BASE_URL",
    "JIRA_EMAIL",
    "JIRA_API_TOKEN",
    "JIRA_PROJECT_KEY",
  ];
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  baseUrl = process.env.JIRA_BASE_URL.replace(/\/$/, "");
  auth = Buffer.from(
    `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`,
  ).toString("base64");
}

async function jiraRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Jira API ${response.status} ${response.statusText}: ${body}`,
    );
  }

  return response.json();
}

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

function usage() {
  console.log(`Usage:
  npm run jira:list [-- --jql "project = SCRUM ORDER BY created DESC" --max 10]
  npm run jira:create -- --summary "Task title" [--type Task] [--description "Details"] [--project SCRUM]`);
}

async function listIssues() {
  ensureEnv();
  const project = getArg("project") || process.env.JIRA_PROJECT_KEY;
  const jql = getArg("jql") || `project = ${project} ORDER BY created DESC`;
  const max = Number(getArg("max") || "10");

  const result = await jiraRequest("/rest/api/3/search/jql", {
    method: "POST",
    body: JSON.stringify({
      jql,
      maxResults: max,
      fields: ["summary", "status", "assignee", "issuetype"],
    }),
  });

  if (!result.issues?.length) {
    console.log("No issues found.");
    return;
  }

  for (const issue of result.issues) {
    const status = issue.fields?.status?.name || "Unknown";
    const assignee = issue.fields?.assignee?.displayName || "Unassigned";
    const type = issue.fields?.issuetype?.name || "Issue";
    console.log(
      `${issue.key} | ${type} | ${status} | ${assignee} | ${issue.fields?.summary || ""}`,
    );
  }
}

async function createIssue() {
  ensureEnv();
  const summary = getArg("summary");
  if (!summary) {
    throw new Error("Missing required argument --summary");
  }

  const project = getArg("project") || process.env.JIRA_PROJECT_KEY;
  const type = getArg("type") || "Task";
  const description = getArg("description");

  const payload = {
    fields: {
      project: { key: project },
      summary,
      issuetype: { name: type },
    },
  };

  if (description) {
    payload.fields.description = {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: description }],
        },
      ],
    };
  }

  const result = await jiraRequest("/rest/api/3/issue", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  console.log(`Created issue: ${result.key}`);
  console.log(`${baseUrl}/browse/${result.key}`);
}

async function main() {
  const command = process.argv[2];

  if (!command || command === "--help" || command === "-h") {
    usage();
    return;
  }

  if (command === "list") {
    await listIssues();
    return;
  }

  if (command === "create") {
    await createIssue();
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
