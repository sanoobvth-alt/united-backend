import ApiError from "../../../utils/ApiError.js";
import { jiraDelete, jiraGet, jiraPost } from "../utils/jiraHttp.js";
import { parseJiraPrompt } from "../utils/promptParser.js";

const DEFAULT_PRIORITY = "Medium";

export async function createFromPromptService(prompt, options = {}) {
  const parsed = await parseJiraPrompt(prompt);
  const resolvedSprintId = await resolveSprintId(options);

  if (parsed.action === "create_task_direct") {
    const assigneeId = await resolveAssigneeId(parsed?.task?.assigneeName);

    const task = await createIssue({
      summary: parsed?.task?.summary || "Task",
      description: parsed?.task?.description || "",
      issueType: "Task",
      priority: parsed?.task?.priority || DEFAULT_PRIORITY,
      assigneeId,
    });

    if (resolvedSprintId) {
      await addIssuesToSprint(resolvedSprintId, [task.key]);
    }

    return {
      action: parsed.action,
      task,
      sprintId: resolvedSprintId,
      parsed_prompt: parsed,
    };
  }

  if (parsed.action === "create_epic_story_subtasks") {
    const epicAssignee = await resolveAssigneeId(parsed?.epic?.assigneeName);
    const epic = await createIssue({
      summary: parsed?.epic?.summary || "Epic",
      description: parsed?.epic?.description || "",
      issueType: "Epic",
      priority: parsed?.epic?.priority || DEFAULT_PRIORITY,
      assigneeId: epicAssignee,
    });

    const sourceItems =
      parsed?.tasks?.length > 0
        ? parsed.tasks
        : parsed?.subtasks?.length > 0
          ? parsed.subtasks
          : parsed?.story?.summary
            ? [
                {
                  summary: parsed.story.summary,
                  description: parsed?.story?.description || "",
                  assigneeName: parsed?.story?.assigneeName || "",
                },
              ]
            : [];

    if (!sourceItems.length) {
      throw new ApiError(400, "At least one task is required under epic");
    }

    const tasks = [];
    for (const item of sourceItems) {
      const taskAssignee = await resolveAssigneeId(item?.assigneeName);
      const task = await createTaskUnderEpic({
        summary: item?.summary || "Task",
        description: item?.description || "",
        priority: parsed?.epic?.priority || DEFAULT_PRIORITY,
        assigneeId: taskAssignee,
        epicKey: epic.key,
      });
      tasks.push(task);
    }

    if (resolvedSprintId) {
      await addIssuesToSprint(
        resolvedSprintId,
        tasks.map((item) => item.key),
      );
    }

    return {
      action: parsed.action,
      epic,
      tasks,
      sprintId: resolvedSprintId,
      parsed_prompt: parsed,
    };
  }

  if (parsed.action === "create_subtask_under_story") {
    if (!parsed?.targetStorySummary) {
      throw new ApiError(400, "Story summary is required to create subtask");
    }

    const story = await findStoryBySummary(parsed.targetStorySummary);
    if (!story) {
      throw new ApiError(404, "Story not found for subtask creation");
    }

    const sourceSubtask = parsed?.subtasks?.[0] || {};
    const assigneeId = await resolveAssigneeId(sourceSubtask?.assigneeName);
    const subtask = await createSubtaskUnderStory({
      summary: sourceSubtask?.summary || "Subtask",
      description: sourceSubtask?.description || "",
      parentKey: story.key,
      assigneeId,
    });

    return {
      action: parsed.action,
      story,
      subtask,
      sprintId: resolvedSprintId,
      parsed_prompt: parsed,
    };
  }

  throw new ApiError(400, "Unsupported prompt action");
}

export async function listEpicsService() {
  const data = await searchByJql({
    jql: `project = ${process.env.PROJECT_KEY} AND issuetype = Epic ORDER BY created DESC`,
    maxResults: 100,
    fields: "summary,status,assignee,priority,created",
  });

  return (data?.issues || []).map(mapIssue);
}

export async function getEpicWithTasksService(epicId, filters = {}) {
  if (!epicId) {
    throw new ApiError(400, "epicId is required");
  }

  const epic = await jiraGet(
    `/rest/api/3/issue/${encodeURIComponent(epicId)}`,
    {
      params: {
        fields: "summary,description,issuetype,status,priority",
      },
    },
  );

  const epicType = epic?.fields?.issuetype?.name || "";
  if (epicType.toLowerCase() !== "epic") {
    throw new ApiError(400, `${epicId} is not an Epic`);
  }

  const taskResponse = await listTasksService({
    epicId,
    sprintId: filters?.sprintId,
  });

  const tasks = (taskResponse?.data || []).map((task) => ({
    scrum_id: task.scrum_id,
    name: task.name,
    description: task.description,
    sprint_id: task.sprint_id,
    story_id: task.story_id,
    issue_type: task.issue_type,
  }));

  return {
    epic: {
      scrum_id: epic?.key || epic?.id,
      name: epic?.fields?.summary || "",
      description: extractDescriptionText(epic?.fields?.description),
      issue_type: epicType,
      status: epic?.fields?.status?.name || "",
      priority: epic?.fields?.priority?.name || "",
    },
    total_tasks: tasks.length,
    tasks,
  };
}

export async function listStoriesService(epicKey, sprintId) {
  const filters = [`project = ${process.env.PROJECT_KEY}`, `issuetype = Story`];

  if (epicKey) {
    filters.push(`parent = ${epicKey}`);
  }

  if (sprintId) {
    filters.push(`sprint = ${sprintId}`);
  }

  const jql = `${filters.join(" AND ")} ORDER BY created DESC`;

  const data = await searchByJql({
    jql,
    maxResults: 100,
    fields: "summary,status,assignee,priority,created,parent",
  });

  const stories = (data?.issues || []).map(mapIssue);
  return enrichStoriesWithEpic(stories);
}

export async function listSprintsService(state) {
  const boardId = process.env.BOARD_ID;
  if (!boardId) {
    throw new ApiError(500, "BOARD_ID is required in environment");
  }

  const allowedStates = ["active", "future", "closed"];
  const normalizedState = (state || "active,future,closed")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => allowedStates.includes(value))
    .join(",");

  const all = [];
  let startAt = 0;
  const maxResults = 50;
  let isLast = false;

  while (!isLast) {
    const data = await jiraGet(`/rest/agile/1.0/board/${boardId}/sprint`, {
      params: {
        state: normalizedState || "active,future,closed",
        startAt,
        maxResults,
      },
    });

    const values = data?.values || [];
    all.push(...values);
    isLast = Boolean(data?.isLast) || values.length === 0;
    startAt += maxResults;
  }

  return all.map((sprint) => ({
    id: sprint.id,
    name: sprint.name,
    state: sprint.state,
    goal: sprint.goal || null,
    startDate: sprint.startDate || null,
    endDate: sprint.endDate || null,
    completeDate: sprint.completeDate || null,
  }));
}

export async function listTasksService(filters = {}) {
  const projectKey = process.env.PROJECT_KEY;
  const where = [
    `project = ${projectKey}`,
    `issuetype in (Task, "Sub-task", Subtask)`,
  ];

  if (filters?.sprintId) {
    where.push(`sprint = ${Number(filters.sprintId)}`);
  }

  if (filters?.epicId) {
    const epicId = String(filters.epicId).trim();
    const epicLinkField = process.env.JIRA_EPIC_LINK_FIELD;

    const epicFilters = [`parent = ${epicId}`];
    if (epicLinkField) {
      epicFilters.push(`${epicLinkField} = ${epicId}`);
    }

    where.push(`(${epicFilters.join(" OR ")})`);
  }

  if (filters?.storyId) {
    where.push(`parent = ${String(filters.storyId).trim()}`);
  }

  const jql = `${where.join(" AND ")} ORDER BY created DESC`;
  const data = await searchByJql({
    jql,
    maxResults: 200,
    fields:
      "summary,description,parent,issuetype,created,sprint,parentEpic,*navigable",
  });

  const rawTasks = data?.issues || [];
  const tasks = await mapTasksWithLinks(rawTasks);

  const groupBy = String(filters?.groupBy || "").toLowerCase();
  if (groupBy === "sprint") {
    return {
      groupBy: "sprint",
      groups: groupByField(tasks, "sprint_id"),
    };
  }

  if (groupBy === "epic") {
    return {
      groupBy: "epic",
      groups: groupByField(tasks, "epic_id"),
    };
  }

  return {
    total: tasks.length,
    data: tasks,
  };
}

export async function deleteIssueService(issueIdOrKey, options = {}) {
  const dryRun = Boolean(options?.dryRun);

  if (!issueIdOrKey) {
    throw new ApiError(400, "issueIdOrKey is required");
  }

  const issue = await getIssueByIdOrKey(issueIdOrKey);
  if (!issue) {
    throw new ApiError(404, "Jira issue not found");
  }

  const issueTypeName = issue?.fields?.issuetype?.name || "";
  const isSubtask = Boolean(issue?.fields?.issuetype?.subtask);
  const isEpic = issueTypeName.toLowerCase() === "epic";

  const baseIssue = {
    id: issue.id,
    key: issue.key,
    name: issue?.fields?.summary || "",
    issueType: issueTypeName,
  };

  if (isSubtask) {
    if (dryRun) {
      return {
        dryRun: true,
        deleteCount: 1,
        wouldDelete: [baseIssue],
      };
    }

    await deleteIssueByIdOrKey(issue.key || issue.id);
    return {
      deleted: [baseIssue],
    };
  }

  if (isEpic) {
    const descendants = await findEpicDescendants(issue.key);
    const subtaskIssues = [
      ...new Map(
        descendants
          .flatMap((child) => child?.fields?.subtasks || [])
          .filter((subtask) => Boolean(subtask?.key))
          .map((subtask) => [subtask.key, subtask]),
      ).values(),
    ];

    const subtaskKeys = subtaskIssues.map((subtask) => subtask.key);

    const childKeys = [
      ...new Set(descendants.map((child) => child?.key).filter(Boolean)),
    ];

    const toDelete = [...new Set([...subtaskKeys, ...childKeys, issue.key])];

    const detailedByKey = new Map();
    detailedByKey.set(baseIssue.key, baseIssue);

    for (const child of descendants) {
      if (!child?.key) {
        continue;
      }

      detailedByKey.set(child.key, {
        id: child.id,
        key: child.key,
        name: child?.fields?.summary || "",
        issueType: child?.fields?.issuetype?.name || "",
      });
    }

    for (const subtask of subtaskIssues) {
      if (!subtask?.key) {
        continue;
      }

      detailedByKey.set(subtask.key, {
        id: subtask.id,
        key: subtask.key,
        name: subtask?.fields?.summary || "",
        issueType: subtask?.fields?.issuetype?.name || "Sub-task",
      });
    }

    const wouldDelete = toDelete.map((key) => {
      return (
        detailedByKey.get(key) || {
          id: null,
          key,
          name: "",
          issueType: "",
        }
      );
    });

    if (dryRun) {
      return {
        dryRun: true,
        deleteCount: toDelete.length,
        wouldDelete,
        rootIssue: baseIssue,
      };
    }

    for (const key of toDelete) {
      await deleteIssueByIdOrKey(key);
    }

    return {
      deletedCount: toDelete.length,
      deletedKeys: toDelete,
      rootIssue: baseIssue,
    };
  }

  if (dryRun) {
    return {
      dryRun: true,
      deleteCount: 1,
      wouldDelete: [baseIssue],
    };
  }

  await deleteIssueByIdOrKey(issue.key || issue.id);
  return {
    deleted: [baseIssue],
  };
}

export async function deleteMultipleIssuesService(
  issueIdsOrKeys,
  options = {},
) {
  if (!Array.isArray(issueIdsOrKeys) || issueIdsOrKeys.length === 0) {
    throw new ApiError(400, "issueIdsOrKeys must be a non-empty array");
  }

  const normalized = [
    ...new Set(
      issueIdsOrKeys
        .map((value) => (value ?? "").toString().trim())
        .filter(Boolean),
    ),
  ];

  if (!normalized.length) {
    throw new ApiError(400, "issueIdsOrKeys must contain valid values");
  }

  const results = [];
  for (const issueIdOrKey of normalized) {
    try {
      const result = await deleteIssueService(issueIdOrKey, options);
      results.push({
        issueIdOrKey,
        success: true,
        result,
      });
    } catch (error) {
      results.push({
        issueIdOrKey,
        success: false,
        error: error?.message || "Delete failed",
      });
    }
  }

  const successCount = results.filter((item) => item.success).length;
  const failedCount = results.length - successCount;

  return {
    dryRun: Boolean(options?.dryRun),
    total: results.length,
    successCount,
    failedCount,
    results,
  };
}

async function resolveSprintId(options = {}) {
  const rawSprintId = options?.sprintId;
  if (rawSprintId !== undefined && rawSprintId !== null && rawSprintId !== "") {
    return Number(rawSprintId);
  }

  const autoAssignRaw = options?.autoAssignSprint;
  const autoAssignSprint =
    autoAssignRaw === undefined
      ? true
      : String(autoAssignRaw).toLowerCase() !== "false";

  if (!autoAssignSprint) {
    return null;
  }

  return getActiveSprintId();
}

async function getIssueByIdOrKey(issueIdOrKey) {
  return jiraGet(`/rest/api/3/issue/${encodeURIComponent(issueIdOrKey)}`, {
    params: {
      fields: "summary,issuetype,subtasks,parent",
    },
  });
}

async function deleteIssueByIdOrKey(issueIdOrKey) {
  await jiraDelete(`/rest/api/3/issue/${encodeURIComponent(issueIdOrKey)}`, {
    params: {
      deleteSubtasks: true,
    },
  });
}

async function findEpicDescendants(epicKey) {
  const childIssues = [];

  const parentBased = await safeSearchByJql({
    jql: `project = ${process.env.PROJECT_KEY} AND parent = ${epicKey}`,
    fields: "summary,issuetype,subtasks,parent",
    maxResults: 200,
  });
  childIssues.push(...parentBased);

  const parentEpicBased = await safeSearchByJql({
    jql: `project = ${process.env.PROJECT_KEY} AND parentEpic = ${epicKey}`,
    fields: "summary,issuetype,subtasks,parent",
    maxResults: 200,
  });
  childIssues.push(...parentEpicBased);

  const epicLinkField = process.env.JIRA_EPIC_LINK_FIELD;
  if (epicLinkField) {
    const epicLinkBased = await safeSearchByJql({
      jql: `project = ${process.env.PROJECT_KEY} AND ${epicLinkField} = ${epicKey}`,
      fields: "summary,issuetype,subtasks,parent",
      maxResults: 200,
    });
    childIssues.push(...epicLinkBased);
  }

  const dedupe = new Map();
  for (const issue of childIssues) {
    if (issue?.key) {
      dedupe.set(issue.key, issue);
    }
  }

  return [...dedupe.values()];
}

async function getActiveSprintId() {
  const boardId = process.env.BOARD_ID;
  if (!boardId) {
    return null;
  }

  const data = await jiraGet(`/rest/agile/1.0/board/${boardId}/sprint`, {
    params: {
      state: "active",
      maxResults: 1,
      startAt: 0,
    },
  });

  return data?.values?.[0]?.id || null;
}

async function addIssuesToSprint(sprintId, issueKeys = []) {
  const keys = issueKeys.filter(Boolean);
  if (!sprintId || !keys.length) {
    return;
  }

  await jiraPost(`/rest/agile/1.0/sprint/${sprintId}/issue`, {
    issues: keys,
  });
}

async function resolveAssigneeId(name) {
  if (!name) {
    return null;
  }

  const res = await jiraGet("/rest/api/3/user/search", {
    params: { query: name },
  });

  if (!res?.length) {
    throw new ApiError(404, `User not found in Jira: ${name}`);
  }

  return res[0].accountId;
}

async function createIssue({
  summary,
  description,
  issueType,
  priority = DEFAULT_PRIORITY,
  assigneeId,
  parentKey,
  extraFields = {},
}) {
  const fields = {
    project: { key: process.env.PROJECT_KEY },
    summary,
    description: toJiraDoc(description || summary),
    issuetype: { name: issueType },
    priority: { name: priority },
    ...extraFields,
  };

  if (assigneeId) {
    fields.assignee = { accountId: assigneeId };
  }

  if (parentKey) {
    fields.parent = { key: parentKey };
  }

  const created = await jiraPost("/rest/api/3/issue", { fields });
  return {
    id: created.id,
    key: created.key,
    name: summary,
  };
}

async function createStoryUnderEpic({
  summary,
  description,
  priority,
  assigneeId,
  epicKey,
}) {
  try {
    return await createIssue({
      summary,
      description,
      issueType: "Story",
      priority,
      assigneeId,
      parentKey: epicKey,
    });
  } catch (error) {
    const epicLinkField = process.env.JIRA_EPIC_LINK_FIELD;

    if (!epicLinkField) {
      throw error;
    }

    return createIssue({
      summary,
      description,
      issueType: "Story",
      priority,
      assigneeId,
      extraFields: {
        [epicLinkField]: epicKey,
      },
    });
  }
}

async function createTaskUnderEpic({
  summary,
  description,
  priority,
  assigneeId,
  epicKey,
}) {
  try {
    return await createIssue({
      summary,
      description,
      issueType: "Task",
      priority,
      assigneeId,
      parentKey: epicKey,
    });
  } catch (error) {
    const epicLinkField = process.env.JIRA_EPIC_LINK_FIELD;

    if (!epicLinkField) {
      throw error;
    }

    return createIssue({
      summary,
      description,
      issueType: "Task",
      priority,
      assigneeId,
      extraFields: {
        [epicLinkField]: epicKey,
      },
    });
  }
}

async function createSubtaskUnderStory({
  summary,
  description,
  parentKey,
  assigneeId,
}) {
  try {
    return await createIssue({
      summary,
      description,
      issueType: "Sub-task",
      parentKey,
      assigneeId,
    });
  } catch {
    try {
      return await createIssue({
        summary,
        description,
        issueType: "Subtask",
        parentKey,
        assigneeId,
      });
    } catch {
      const subtaskTypeId = await getProjectSubtaskIssueTypeId();
      return createIssue({
        summary,
        description,
        issueType: "Sub-task",
        parentKey,
        assigneeId,
        extraFields: {
          issuetype: { id: subtaskTypeId },
        },
      });
    }
  }
}

async function getProjectSubtaskIssueTypeId() {
  const issueTypes = await jiraGet("/rest/api/3/issuetype");
  const projectKey = process.env.PROJECT_KEY;
  const candidateNames = ["Sub-task", "Subtask"];

  const subtaskType = (issueTypes || []).find((type) => {
    const name = (type?.name || "").toLowerCase();
    const inCandidates = candidateNames.some(
      (candidate) => candidate.toLowerCase() === name,
    );

    const inProject = !projectKey
      ? true
      : (type?.scope?.project?.key || "") === projectKey;

    return Boolean(type?.subtask) && inProject && inCandidates;
  });

  if (!subtaskType?.id) {
    throw new ApiError(
      400,
      "Unable to find a subtask issue type in Jira for this project",
    );
  }

  return subtaskType.id;
}

async function findStoryBySummary(summary) {
  const escapedSummary = summary.replaceAll('"', '\\"');
  const data = await searchByJql({
    jql: `project = ${process.env.PROJECT_KEY} AND issuetype = Story AND summary ~ "${escapedSummary}" ORDER BY created DESC`,
    maxResults: 1,
    fields: "summary,status,assignee,priority,created,parent",
  });

  const issue = data?.issues?.[0];
  if (!issue) {
    return null;
  }

  return mapIssue(issue);
}

function toJiraDoc(text) {
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  };
}

async function searchByJql({ jql, maxResults = 50, fields }) {
  return jiraGet("/rest/api/3/search/jql", {
    params: {
      jql,
      maxResults,
      fields,
    },
  });
}

async function mapTasksWithLinks(issues) {
  const base = issues.map((issue) => {
    const taskType = issue?.fields?.issuetype?.name || "";
    const parentKey = issue?.fields?.parent?.key || null;
    const parentType = issue?.fields?.parent?.fields?.issuetype?.name || "";

    let epicId = null;
    let storyId = null;

    if (parentType.toLowerCase() === "epic") {
      epicId = parentKey;
    } else if (parentType.toLowerCase() === "story") {
      storyId = parentKey;
    }

    const sprintId = extractSprintId(issue?.fields || {});

    return {
      scrum_id: issue?.key || issue?.id || null,
      name: issue?.fields?.summary || "",
      description: extractDescriptionText(issue?.fields?.description),
      sprint_id: sprintId,
      epic_id: epicId,
      story_id: storyId,
      issue_type: taskType,
    };
  });

  const storyKeys = [
    ...new Set(base.map((item) => item.story_id).filter(Boolean)),
  ];
  if (!storyKeys.length) {
    return base;
  }

  const storyData = await searchByJql({
    jql: `project = ${process.env.PROJECT_KEY} AND key in (${storyKeys.join(",")})`,
    maxResults: storyKeys.length,
    fields: "parent,parentEpic,*navigable",
  });

  const epicByStory = new Map();
  for (const story of storyData?.issues || []) {
    const storyKey = story?.key;
    const parentKey = story?.fields?.parent?.key || null;
    const parentType = story?.fields?.parent?.fields?.issuetype?.name || "";

    if (parentType.toLowerCase() === "epic" && parentKey) {
      epicByStory.set(storyKey, parentKey);
      continue;
    }

    const parentEpic = story?.fields?.parentEpic;
    if (typeof parentEpic === "string") {
      epicByStory.set(storyKey, parentEpic);
    } else if (parentEpic?.key) {
      epicByStory.set(storyKey, parentEpic.key);
    }
  }

  return base.map((item) => ({
    ...item,
    epic_id: item.epic_id || epicByStory.get(item.story_id) || null,
  }));
}

function extractDescriptionText(description) {
  if (!description) {
    return "";
  }

  if (typeof description === "string") {
    return description;
  }

  const texts = [];
  collectTextNodes(description, texts);
  return texts.join(" ").trim();
}

function collectTextNodes(node, bucket) {
  if (!node) {
    return;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      collectTextNodes(child, bucket);
    }
    return;
  }

  if (typeof node === "object") {
    if (typeof node.text === "string" && node.text.trim()) {
      bucket.push(node.text.trim());
    }

    if (node.content) {
      collectTextNodes(node.content, bucket);
    }
  }
}

function extractSprintId(fields) {
  for (const value of Object.values(fields || {})) {
    if (Array.isArray(value)) {
      const sprint = value.find((item) => isSprintLike(item));
      if (sprint?.id) {
        return sprint.id;
      }
    } else if (isSprintLike(value) && value?.id) {
      return value.id;
    }
  }

  return null;
}

function isSprintLike(value) {
  return (
    Boolean(value?.id) &&
    (Boolean(value?.state) || Boolean(value?.originBoardId))
  );
}

function groupByField(items, field) {
  const grouped = {};

  for (const item of items) {
    const rawKey = item?.[field];
    const key =
      rawKey === null || rawKey === undefined || rawKey === ""
        ? "none"
        : String(rawKey);

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(item);
  }

  return grouped;
}

async function safeSearchByJql({ jql, maxResults = 50, fields }) {
  try {
    const data = await searchByJql({ jql, maxResults, fields });
    return data?.issues || [];
  } catch {
    return [];
  }
}

async function enrichStoriesWithEpic(stories) {
  const epicKeys = [
    ...new Set(stories.map((story) => story.parentKey).filter(Boolean)),
  ];

  if (!epicKeys.length) {
    return stories.map((story) => ({
      ...story,
      epicKey: null,
      epicName: null,
    }));
  }

  const data = await searchByJql({
    jql: `project = ${process.env.PROJECT_KEY} AND key in (${epicKeys.join(",")})`,
    maxResults: epicKeys.length,
    fields: "summary",
  });

  const epicNameByKey = (data?.issues || []).reduce((acc, epic) => {
    acc[epic.key] = epic?.fields?.summary || null;
    return acc;
  }, {});

  return stories.map((story) => ({
    ...story,
    epicKey: story.parentKey || null,
    epicName: epicNameByKey[story.parentKey] || null,
  }));
}

function mapIssue(issue) {
  const summary = issue?.fields?.summary || "";

  return {
    id: issue.id,
    key: issue.key,
    name: summary,
    summary,
    status: issue?.fields?.status?.name || "",
    priority: issue?.fields?.priority?.name || "",
    assignee: issue?.fields?.assignee?.displayName || null,
    createdAt: issue?.fields?.created || null,
    parentKey: issue?.fields?.parent?.key || null,
  };
}
