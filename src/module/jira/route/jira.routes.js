import express from "express";
import multer from "multer";

import {
  createJiraFromPrompt,
  deleteMultipleJiraIssues,
  deleteJiraIssue,
  getEpicWithTasks,
  listEpics,
  listSprints,
  listStories,
  listTasks,
} from "../controller/jira.controller.js";

let upload = multer();
const router = express.Router();

router.get("/epics", upload.none(), listEpics);
router.get("/epics/:epicId", upload.none(), getEpicWithTasks);
router.get("/sprints", upload.none(), listSprints);
router.get("/stories", upload.none(), listStories);
router.get("/tasks", upload.none(), listTasks);
router.post("/create", upload.none(), createJiraFromPrompt);
router.post("/create-task", upload.none(), createJiraFromPrompt);
router.delete("/:issueIdOrKey", upload.none(), deleteJiraIssue);
router.post("/delete-multiple", upload.none(), deleteMultipleJiraIssues);

export default router;
