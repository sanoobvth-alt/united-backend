import {
  createFromPromptService,
  deleteIssueService,
  deleteMultipleIssuesService,
  getEpicWithTasksService,
  listEpicsService,
  listSprintsService,
  listStoriesService,
  listTasksService,
} from "../service/jira.service.js";

export async function createJiraFromPrompt(req, res, next) {
  try {
    const result = await createFromPromptService(req?.body?.prompt, {
      sprintId: req?.body?.sprintId,
      autoAssignSprint: req?.body?.autoAssignSprint,
    });
    res.status(201).json({
      success: true,
      message: "Jira items created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function listEpics(req, res, next) {
  try {
    const data = await listEpicsService();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEpicWithTasks(req, res, next) {
  try {
    const data = await getEpicWithTasksService(req?.params?.epicId, {
      sprintId: req?.query?.sprintId,
    });
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function listStories(req, res, next) {
  try {
    const data = await listStoriesService(
      req?.query?.epicKey,
      req?.query?.sprintId,
    );
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function listSprints(req, res, next) {
  try {
    const data = await listSprintsService(req?.query?.state);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function listTasks(req, res, next) {
  try {
    const data = await listTasksService({
      sprintId: req?.query?.sprintId,
      epicId: req?.query?.epicId,
      storyId: req?.query?.storyId,
      groupBy: req?.query?.groupBy,
    });
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteJiraIssue(req, res, next) {
  try {
    const dryRunValue = String(req?.query?.dryRun || "").toLowerCase();
    const dryRun = ["true", "1", "yes"].includes(dryRunValue);

    const data = await deleteIssueService(req?.params?.issueIdOrKey, {
      dryRun,
    });

    res.json({
      success: true,
      message: dryRun
        ? "Dry run preview generated"
        : "Jira issue deleted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMultipleJiraIssues(req, res, next) {
  try {
    const queryDryRunValue = String(req?.query?.dryRun || "").toLowerCase();
    const queryDryRun = ["true", "1", "yes"].includes(queryDryRunValue);

    const bodyDryRunValue = String(req?.body?.dryRun || "").toLowerCase();
    const bodyDryRun = ["true", "1", "yes"].includes(bodyDryRunValue);

    const dryRun = queryDryRun || bodyDryRun;

    const data = await deleteMultipleIssuesService(req?.body?.issueIdsOrKeys, {
      dryRun,
    });

    res.json({
      success: true,
      message: dryRun
        ? "Dry run preview generated for multiple issues"
        : "Multiple Jira issues processed",
      data,
    });
  } catch (error) {
    next(error);
  }
}
