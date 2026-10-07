require("dotenv").config();

const axios = require("axios");

export const jira = axios.create({
  baseURL: `https://${process.env.JIRA_DOMAIN}`,
  headers: {
    "Content-Type": "application/json",
  },
  auth: {
    username: process.env.JIRA_EMAIL,
    password: process.env.JIRA_API_TOKEN,
  },
});
