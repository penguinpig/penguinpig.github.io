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

// 讀取必要環境變數；若不存在就直接中止，避免後續請求出現難追的錯誤。
function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// 讀取一般環境變數，沒有設定時回傳預設值。
function getEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

// 移除 Notion id 中的 `-`，方便後續做格式統一。
function normalizeId(value) {
  return value.replace(/-/g, "");
}

// 將 32 碼的 Notion id 補回標準破折號格式，供 API 使用。
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

// 統一封裝對 Notion API 的呼叫，包含驗證標頭、版本與錯誤處理。
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

// 將 Notion rich text 陣列轉成純文字。
function richTextToPlain(richText = []) {
  return richText.map((item) => item.plain_text ?? "").join("");
}

// 將 Notion rich text 轉成 Markdown，保留連結與基本文字樣式。
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

// 把單一 Notion block 轉成對應的 Markdown 片段。
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

// 將 Notion table row 的每個儲存格轉成 Markdown 可用內容。
function renderTableRowCells(row) {
  return (row.table_row?.cells ?? []).map((cell) =>
    richTextToMarkdown(cell).replace(/\|/g, "\\|").replace(/\n/g, " ").trim()
  );
}

// 將整個 Notion table 的 rows 組裝成 Markdown table。
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

// 將一段 Markdown 每行前面補上 `>`，用來巢狀呈現 callout 內容。
function prefixQuotedMarkdown(markdown, depth = 0) {
  const indent = "  ".repeat(depth);
  return markdown
    .trim()
    .split("\n")
    .map((line) => (line.trim() ? `${indent}> ${line}` : `${indent}>`))
    .join("\n");
}

// 分頁抓取指定 block 的所有子區塊。
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

// 遞迴渲染單一 block；若有 children 會一併展開。
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

// 將一組 blocks 依序轉成完整 Markdown 內容。
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

// 從 Notion page properties 中找出 title 欄位並回傳標題。
function extractPageTitle(properties = {}) {
  for (const property of Object.values(properties)) {
    if (property.type === "title") {
      return richTextToPlain(property.title) || "Untitled";
    }
  }

  return "Untitled";
}

// 讀取單一 page，專門用來取得頁面標題。
async function fetchPageTitle(pageId) {
  const page = await notionRequest(`/pages/${pageId}`);
  return extractPageTitle(page.properties ?? {});
}

// 將各種 Notion property 型別轉成單一純文字值。
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

// 將適合陣列表示的 Notion property 轉成字串陣列。
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

// 分頁查詢整個 Notion database，拿到全部頁面資料。
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

// 統一解析 checkbox 或 boolean formula 的布林值。
function getCheckboxValue(property) {
  if (!property) return false;
  if (property.type === "checkbox") return property.checkbox;
  if (property.type === "formula" && property.formula?.type === "boolean") {
    return Boolean(property.formula.boolean);
  }
  return false;
}

// 依欄位名稱安全取得 page property。
function getProperty(page, name) {
  return page.properties?.[name];
}

// 將標題或自訂 slug 清洗成適合 Hugo 檔名與網址的格式。
function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "untitled";
}

// 將字串轉成 YAML 安全字面值，避免引號或反斜線破壞 front matter。
function yamlEscape(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

// 將字串陣列格式化成 YAML array。
function yamlArray(values = []) {
  if (!values.length) return "[]";
  return `[${values.map((value) => yamlEscape(value)).join(", ")}]`;
}

// 產生可為 null 的 YAML 欄位值。
function yamlNullable(value) {
  return value ? yamlEscape(value) : "null";
}

// 將 Notion 的分類字串正規化成支援的 archive type。
function normalizeArchiveType(value) {
  const normalized = value.trim().toLowerCase();
  if (ARCHIVE_SECTION_MAP[normalized]) {
    return normalized;
  }
  return "";
}

// 從頁面欄位讀出 HugoArchives，決定文章要放進哪個 section。
function getArchiveType(page) {
  return normalizeArchiveType(propertyToPlainText(getProperty(page, "HugoArchives")));
}

// 決定頁面的最終 slug，優先使用自訂欄位，否則退回 title。
function getPageSlug(page, title) {
  const slugProperty =
    propertyToPlainText(getProperty(page, "Slug")) ||
    propertyToPlainText(getProperty(page, "slug"));

  return slugify(slugProperty || title);
}

// 去除空值與重複值，避免 front matter 產生重複標籤。
function uniqueValues(values = []) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
}

// 將狀態字串轉成小寫，方便後續比對 draft / published。
function normalizeStatus(status) {
  return status.trim().toLowerCase();
}

// 根據 Status 欄位推導 Hugo 的 draft 布林值。
function resolveDraft(status) {
  if (!status) return false;
  if (PUBLISHED_STATUS.has(status)) return false;
  if (DRAFT_STATUS.has(status)) return true;
  return false;
}

// 依照 Notion page 資料組出 Hugo front matter。
function buildFrontMatter(page, title, archiveType, slug) {
  const createdAt = page.created_time ?? "";
  const author = uniqueValues(propertyToArray(getProperty(page, "Author")));
  const description = propertyToPlainText(getProperty(page, "摘要")).trim();
  const summary = propertyToPlainText(getProperty(page, "摘要")).trim();
  const tags = uniqueValues(propertyToArray(getProperty(page, "Tag")));
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
    `date: ${yamlNullable(createdAt)}`,
    `description: ${yamlNullable(description)}`,
    `summary: ${yamlNullable(summary)}`,
    `tags: ${yamlArray(tags)}`,
    `categories: ${yamlArray(categories)}`,
    `series: ${yamlArray(series)}`,
    "ShowToc: true",
    "TocOpen: true",
    `draft: ${resolveDraft(status) ? "true" : "false"}`,
    `notion_id: ${yamlEscape(page.id)}`,
    "---",
    "",
  ];

  return lines.join("\n");
}

// 將單篇 Notion 頁面轉成 Hugo markdown 並寫入對應目錄。
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

// 同步整個 Notion database 到 Hugo content，回傳寫入與略過摘要。
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

  return {
    databaseId: database.id,
    databaseTitle,
    written,
    skipped,
  };
}

// 判斷傳入的 Notion id 是 page 還是 database。
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

// 針對單一 Notion page 產生 Markdown 檔內容。
async function buildPageMarkdown(pageId) {
  const title = await fetchPageTitle(pageId);
  const blocks = await fetchBlockChildren(pageId);
  const content = await renderBlocks(blocks);
  return `# ${title}\n\n<!-- Generated from Notion page ${pageId} -->\n\n${content}`.trimEnd() + "\n";
}

// 程式進入點：依 id 類型決定要同步單頁 Markdown 或整個資料庫。
async function main() {
  const rawId = getEnv("NOTION_ID") || getEnv("NOTION_PAGE_ID");
  if (!rawId) {
    throw new Error("Missing required environment variable: NOTION_ID or NOTION_PAGE_ID");
  }

  const notionId = insertIdDashes(rawId);
  const notionObject = await detectNotionObject(notionId);

  if (notionObject.type === "page") {
    const outputPath = process.env.OUTPUT_PATH || "synced/notion-sync-report.md";
    const markdown = await buildPageMarkdown(notionId);

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, markdown, "utf8");

    console.log(`Notion page synced to ${outputPath}`);
    return;
  }

  const summary = await syncDatabaseToHugo(notionObject.data);
  console.log(`Notion database synced: ${summary.databaseTitle}`);
  console.log(`Written: ${summary.written.length}`);
  console.log(`Skipped: ${summary.skipped.length}`);
}

// 集中處理未捕捉錯誤，讓 CLI 以非 0 狀態結束。
main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
