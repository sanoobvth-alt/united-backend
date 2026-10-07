import axios from "axios";
import ApiError from "../../../utils/ApiError.js";

function resolveJiraBaseUrl() {
  const raw = process.env.JIRA_BASE_URL || process.env.JIRA_DOMAIN || "";

  if (!raw) {
    throw new ApiError(
      500,
      "JIRA_BASE_URL or JIRA_DOMAIN is required in environment",
    );
  }

  const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return normalized.replace(/\/+$/, "");
}

const jira = axios.create({
  baseURL: resolveJiraBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  auth: {
    username: process.env.JIRA_EMAIL,
    password: process.env.JIRA_API_TOKEN,
  },
});

export async function jiraGet(url, config = {}) {
  try {
    const response = await jira.get(url, config);
    return response.data;
  } catch (error) {
    throw normalizeJiraError(error);
  }
}

export async function jiraPost(url, payload = {}, config = {}) {
  try {
    const response = await jira.post(url, payload, config);
    return response.data;
  } catch (error) {
    console.log(error);

    throw normalizeJiraError(error);
  }
}

export async function jiraDelete(url, config = {}) {
  try {
    const response = await jira.delete(url, config);
    return response.data;
  } catch (error) {
    throw normalizeJiraError(error);
  }
}

function normalizeJiraError(error) {
  if (error?.response?.data) {
    const fieldErrors = Object.values(error.response.data.errors || {}).filter(
      Boolean,
    );

    const jiraMessage =
      error.response.data.errorMessages?.join(", ") ||
      fieldErrors.join(", ") ||
      error.response.data.message ||
      "Jira request failed";

    return new ApiError(error.response.status || 500, jiraMessage);
  }

  return new ApiError(500, error.message || "Jira request failed");
}
