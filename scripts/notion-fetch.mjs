import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const NOTION_VERSION = "2022-06-28";
const NOTION_API_BASE = "https://api.notion.com/v1";
const ARCHIVE_SECTION_MAP = {
  bike: "bikes",
  note: "notes",
  post: "posts",
};
const PUBLISHED_STATUS = new Set(["published", "done", "complete", "completed", "已發佈", "已发布", "已完成"]);
const DRAFT_STATUS = new Set(["draft", "in progress", "進行中", "整理中", "草稿"]);

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

function normalizeId(value) {
  return value.replace(/-/g, "");
}

function insertIdDashes(value) {
  const raw = normalizeId(value);
  if (raw.length !== 32) {
    throw new Error("NOTION_ID must be a 32-character Notion page or database id.");
  }

  return [
    raw.slice(0, 8),
    raw.slice(8, 12),
    raw.slice(12, 16),
    raw.slice(16, 20),
    raw.slice(20),
  ].join("-");
}

async function notionRequest(endpoint, options = {}) {
  const token = getRequiredEnv("NOTION_TOKEN");
  const response = await fetch(`${NOTION_API_BASE}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notion API request failed: ${response.status} ${body}`);
  }

  return response.json();
}

function richTextToPlain(richText = []) {
  return richText.map((item) => item.plain_text ?? "").join("");
}

function richTextToMarkdown(richText = []) {
  return richText
    .map((item) => {
      const text = item.plain_text ?? "";
      const href = item.href;
      const annotations = item.annotations ?? {};
      let value = href ? `[${text}](${href})` : text;

      if (annotations.code) value = `\`${value}\``;
      if (annotations.bold) value = `**${value}**`;
      if (annotations.italic) value = `*${value}*`;
      if (annotations.strikethrough) value = `~~${value}~~`;

      return value;
    })
    .join("");
}

function blockToMarkdown(block, depth = 0) {
  const indent = "  ".repeat(depth);

  switch (block.type) {
    case "paragraph":
      return `${indent}${richTextToMarkdown(block.paragraph.rich_text)}\n`;
    case "heading_1":
      return `# ${richTextToMarkdown(block.heading_1.rich_text)}\n`;
    case "heading_2":
      return `## ${richTextToMarkdown(block.heading_2.rich_text)}\n`;
    case "heading_3":
      return `### ${richTextToMarkdown(block.heading_3.rich_text)}\n`;
    case "bulleted_list_item":
      return `${indent}- ${richTextToMarkdown(block.bulleted_list_item.rich_text)}\n`;
    case "numbered_list_item":
      return `${indent}1. ${richTextToMarkdown(block.numbered_list_item.rich_text)}\n`;
    case "to_do": {
      const checked = block.to_do.checked ? "x" : " ";
      return `${indent}- [${checked}] ${richTextToMarkdown(block.to_do.rich_text)}\n`;
    }
    case "quote":
      return `${indent}> ${richTextToMarkdown(block.quote.rich_text)}\n`;
    case "code": {
      const language = block.code.language ?? "";
      const content = richTextToPlain(block.code.rich_text);
      return `\n\`\`\`${language}\n${content}\n\`\`\`\n`;
    }
    case "divider":
      return "\n---\n";
    case "callout": {
      const icon = block.callout.icon?.emoji ?? "Note";
      return `${indent}> ${icon} ${richTextToMarkdown(block.callout.rich_text)}\n`;
    }
    case "toggle":
      return `${indent}<details>\n${indent}<summary>${richTextToMarkdown(block.toggle.rich_text)}</summary>\n`;
    default:
      return `\n<!-- Unsupported Notion block: ${block.type} -->\n`;
  }
}

function renderTableRowCells(row) {
  return (row.table_row?.cells ?? []).map((cell) =>
    richTextToMarkdown(cell).replace(/\|/g, "\\|").replace(/\n/g, " ").trim()
  );
}

function tableRowsToMarkdown(rows, depth = 0) {
  if (!rows.length) return "";

  const indent = "  ".repeat(depth);
  const renderedRows = rows.map(renderTableRowCells);
  const columnCount = Math.max(...renderedRows.map((row) => row.length), 1);
  const normalizedRows = renderedRows.map((row) => {
    const cells = [...row];
    while (cells.length < columnCount) cells.push("");
    return cells;
  });

  const header = normalizedRows[0];
  const bodyRows = normalizedRows.slice(1);
  const lines = [
    `${indent}| ${header.join(" | ")} |`,
    `${indent}| ${header.map(() => "---").join(" | ")} |`,
  ];

  for (const row of bodyRows) {
    lines.push(`${indent}| ${row.join(" | ")} |`);
  }

  return `${lines.join("\n")}\n`;
}

function prefixQuotedMarkdown(markdown, depth = 0) {
  const indent = "  ".repeat(depth);
  return markdown
    .trim()
    .split("\n")
    .map((line) => (line.trim() ? `${indent}> ${line}` : `${indent}>`))
    .join("\n");
}

async function fetchBlockChildren(blockId) {
  let hasMore = true;
  let nextCursor;
  const blocks = [];

  while (hasMore) {
    const query = new URLSearchParams();
    if (nextCursor) {
      query.set("start_cursor", nextCursor);
    }

    const suffix = query.toString() ? `?${query.toString()}` : "";
    const data = await notionRequest(`/blocks/${blockId}/children${suffix}`);
    blocks.push(...data.results);
    hasMore = data.has_more;
    nextCursor = data.next_cursor;
  }

  return blocks;
}

async function renderBlock(block, depth = 0) {
  if (block.type === "table") {
    const rows = await fetchBlockChildren(block.id);
    return `\n${tableRowsToMarkdown(rows, depth)}`;
  }

  let markdown = blockToMarkdown(block, depth);

  if (block.has_children) {
    const childDepth = block.type === "toggle" ? depth : depth + 1;
    const children = await fetchBlockChildren(block.id);
    const childMarkdown = await renderBlocks(children, childDepth);

    if (block.type === "toggle") {
      markdown += `\n${childMarkdown}${"  ".repeat(depth)}</details>\n`;
    } else if (block.type === "callout" && childMarkdown.trim()) {
      markdown += `${prefixQuotedMarkdown(childMarkdown, depth)}\n`;
    } else if (childMarkdown.trim()) {
      markdown += childMarkdown;
    }
  }

  return markdown;
}

async function renderBlocks(blocks, depth = 0) {
  const chunks = [];

  for (const block of blocks) {
    const markdown = await renderBlock(block, depth);
    if (markdown.trim()) {
      chunks.push(markdown.trimEnd());
    }
  }

  return `${chunks.join("\n\n")}\n`.replace(/\n{3,}/g, "\n\n");
}

function extractPageTitle(properties = {}) {
  for (const property of Object.values(properties)) {
    if (property.type === "title") {
      return richTextToPlain(property.title) || "Untitled";
    }
  }

  return "Untitled";
}

async function fetchPageTitle(pageId) {
  const page = await notionRequest(`/pages/${pageId}`);
  return extractPageTitle(page.properties ?? {});
}

function propertyToPlainText(property) {
  switch (property?.type) {
    case "title":
      return richTextToPlain(property.title);
    case "rich_text":
      return richTextToPlain(property.rich_text);
    case "number":
      return property.number == null ? "" : String(property.number);
    case "select":
      return property.select?.name ?? "";
    case "multi_select":
      return (property.multi_select ?? []).map((item) => item.name).join(", ");
    case "status":
      return property.status?.name ?? "";
    case "date":
      return property.date?.start ?? "";
    case "checkbox":
      return property.checkbox ? "true" : "false";
    case "url":
      return property.url ?? "";
    case "email":
      return property.email ?? "";
    case "phone_number":
      return property.phone_number ?? "";
    case "people":
      return (property.people ?? []).map((person) => person.name ?? person.id).join(", ");
    case "relation":
      return (property.relation ?? []).map((item) => item.id).join(", ");
    case "created_time":
      return property.created_time ?? "";
    case "last_edited_time":
      return property.last_edited_time ?? "";
    case "formula":
      return propertyToPlainText(property.formula);
    case "created_by":
      return property.created_by?.name ?? property.created_by?.id ?? "";
    case "last_edited_by":
      return property.last_edited_by?.name ?? property.last_edited_by?.id ?? "";
    default:
      return "";
  }
}

function propertyToArray(property) {
  switch (property?.type) {
    case "multi_select":
      return (property.multi_select ?? []).map((item) => item.name).filter(Boolean);
    case "people":
      return (property.people ?? []).map((person) => person.name ?? person.id).filter(Boolean);
    case "relation":
      return (property.relation ?? []).map((item) => item.id).filter(Boolean);
    case "rich_text": {
      const value = richTextToPlain(property.rich_text).trim();
      return value ? [value] : [];
    }
    case "title": {
      const value = richTextToPlain(property.title).trim();
      return value ? [value] : [];
    }
    default:
      return [];
  }
}

async function queryDatabase(databaseId) {
  let hasMore = true;
  let nextCursor;
  const pages = [];

  while (hasMore) {
    const body = nextCursor ? { start_cursor: nextCursor } : {};
    const data = await notionRequest(`/databases/${databaseId}/query`, {
      method: "POST",
      body,
    });

    pages.push(...data.results);
    hasMore = data.has_more;
    nextCursor = data.next_cursor;
  }

  return pages;
}

function getCheckboxValue(property) {
  if (!property) return false;
  if (property.type === "checkbox") return property.checkbox;
  if (property.type === "formula" && property.formula?.type === "boolean") {
    return Boolean(property.formula.boolean);
  }
  return false;
}

function getProperty(page, name) {
  return page.properties?.[name];
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "untitled";
}

function yamlEscape(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function yamlArray(values = []) {
  if (!values.length) return "[]";
  return `[${values.map((value) => yamlEscape(value)).join(", ")}]`;
}

function yamlNullable(value) {
  return value ? yamlEscape(value) : "null";
}

function normalizeArchiveType(value) {
  const normalized = value.trim().toLowerCase();
  if (ARCHIVE_SECTION_MAP[normalized]) {
    return normalized;
  }
  return "";
}

function getArchiveType(page) {
  return normalizeArchiveType(propertyToPlainText(getProperty(page, "HugoArchives")));
}

function getPageSlug(page, title) {
  const slugProperty =
    propertyToPlainText(getProperty(page, "Slug")) ||
    propertyToPlainText(getProperty(page, "slug"));

  return slugify(slugProperty || title);
}

function uniqueValues(values = []) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
}

function normalizeStatus(status) {
  return status.trim().toLowerCase();
}

function resolveDraft(status) {
  if (!status) return false;
  if (PUBLISHED_STATUS.has(status)) return false;
  if (DRAFT_STATUS.has(status)) return true;
  return false;
}

function buildFrontMatter(page, title, archiveType, slug) {
  const createdAt = page.created_time ?? "";
  const updatedAt = page.last_edited_time ?? "";
  const archiveSection = ARCHIVE_SECTION_MAP[archiveType];
  const author = uniqueValues(propertyToArray(getProperty(page, "Author")));
  const description = propertyToPlainText(getProperty(page, "Description")).trim();
  const summary = propertyToPlainText(getProperty(page, "Summary")).trim();
  const tags = uniqueValues(propertyToArray(getProperty(page, "Tags")));
  const categories = uniqueValues([
    ...propertyToArray(getProperty(page, "Categories")),
    archiveType,
  ]);
  const series = uniqueValues(propertyToArray(getProperty(page, "Series")));
  const status = normalizeStatus(propertyToPlainText(getProperty(page, "Status")));
  const lines = [
    "---",
    `author: ${yamlArray(author.length ? author : ["PenguinPig"])}`,
    `title: ${yamlNullable(title)}`,
    `description: ${yamlNullable(description)}`,
    `summary: ${yamlNullable(summary)}`,
    `tags: ${yamlArray(tags)}`,
    `categories: ${yamlArray(categories)}`,
    `series: ${yamlArray(series)}`,
    "ShowToc: true",
    "TocOpen: true",
    `draft: ${resolveDraft(status) ? "true" : "false"}`,
    `slug: ${yamlEscape(slug)}`,
    `archives: ${yamlEscape(archiveType)}`,
    `section: ${yamlEscape(archiveSection)}`,
    `notion_id: ${yamlEscape(page.id)}`,
    `date: ${yamlNullable(createdAt)}`,
    `lastmod: ${yamlNullable(updatedAt)}`,
    `status: ${yamlNullable(status)}`,
    "---",
    "",
  ];

  return lines.join("\n");
}

async function writeHugoPage(page, contentRoot) {
  const title = extractPageTitle(page.properties ?? {});
  const archiveType = getArchiveType(page);

  if (!getCheckboxValue(getProperty(page, "SyncToGit"))) {
    return { status: "skipped", reason: "SyncToGit is false", title };
  }

  if (!archiveType) {
    return { status: "skipped", reason: "HugoArchives is missing or invalid", title };
  }

  const slug = getPageSlug(page, title);
  const blocks = await fetchBlockChildren(page.id);
  const body = await renderBlocks(blocks);
  const frontMatter = buildFrontMatter(page, title, archiveType, slug);
  const section = ARCHIVE_SECTION_MAP[archiveType];
  const markdown = `${frontMatter}${body.trim()}\n`;
  const filePath = path.join(contentRoot, section, `${slug}.md`);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, markdown, "utf8");

  return { status: "written", title, filePath };
}

async function syncDatabaseToHugo(database) {
  const contentRoot = getEnv("HUGO_CONTENT_ROOT", "content");
  const pages = await queryDatabase(database.id);
  const results = [];

  for (const page of pages) {
    results.push(await writeHugoPage(page, contentRoot));
  }

  const written = results.filter((item) => item.status === "written");
  const skipped = results.filter((item) => item.status === "skipped");
  const databaseTitle = richTextToPlain(database.title) || "Untitled Database";

  const lines = [
    `# ${databaseTitle} Sync Report`,
    "",
    `<!-- Generated from Notion database ${database.id} -->`,
    "",
    `Written: ${written.length}`,
    `Skipped: ${skipped.length}`,
    "",
  ];

  if (written.length) {
    lines.push("## Written", "");
    for (const item of written) {
      lines.push(`- ${item.title} -> ${item.filePath}`);
    }
    lines.push("");
  }

  if (skipped.length) {
    lines.push("## Skipped", "");
    for (const item of skipped) {
      lines.push(`- ${item.title}: ${item.reason}`);
    }
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

async function detectNotionObject(id) {
  try {
    const page = await notionRequest(`/pages/${id}`);
    return { type: "page", data: page };
  } catch (error) {
    if (!String(error.message).includes("is a database, not a page")) {
      throw error;
    }
  }

  const database = await notionRequest(`/databases/${id}`);
  return { type: "database", data: database };
}

async function buildPageMarkdown(pageId) {
  const title = await fetchPageTitle(pageId);
  const blocks = await fetchBlockChildren(pageId);
  const content = await renderBlocks(blocks);
  return `# ${title}\n\n<!-- Generated from Notion page ${pageId} -->\n\n${content}`.trimEnd() + "\n";
}

async function main() {
  const rawId = getEnv("NOTION_ID") || getEnv("NOTION_PAGE_ID");
  if (!rawId) {
    throw new Error("Missing required environment variable: NOTION_ID or NOTION_PAGE_ID");
  }

  const notionId = insertIdDashes(rawId);
  const outputPath = process.env.OUTPUT_PATH || "synced/notion-sync-report.md";
  const notionObject = await detectNotionObject(notionId);
  let markdown = "";

  if (notionObject.type === "page") {
    markdown = await buildPageMarkdown(notionId);
  } else {
    markdown = await syncDatabaseToHugo(notionObject.data);
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, markdown, "utf8");

  console.log(`Notion ${notionObject.type} synced to ${outputPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
