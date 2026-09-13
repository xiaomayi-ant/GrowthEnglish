import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const hintLevelSchema = z.enum(["none", "light", "direct"]);
const evidenceTypeSchema = z.enum(["spontaneous", "rephrased", "read-aloud", "transcript-only"]);

export const PracticeRecordSchema = z.object({
  schemaVersion: z.literal(1),
  sessionId: z.string().min(1).max(160),
  occurredAt: z.string().datetime({ offset: true }),
  status: z.enum(["complete", "partial"]),
  courseId: z.string().min(1).max(120),
  unitId: z.string().min(1).max(120),
  focus: z.array(z.string().min(1)).max(20).default([]),
  turns: z.array(z.object({
    prompt: z.string().min(1).max(5000),
    response: z.string().max(10000),
    corrections: z.array(z.object({
      original: z.string().min(1).max(5000),
      corrected: z.string().min(1).max(5000),
      explanation: z.string().max(3000).default(""),
      hintLevel: hintLevelSchema,
      attempts: z.array(z.object({
        response: z.string().max(10000),
        result: z.enum(["recalled", "needs-practice"]),
      })).max(20).default([]),
    })).max(20).default([]),
  })).max(100),
  vocabularyAssessments: z.array(z.object({
    vocabularyId: z.string().min(1).max(200),
    expression: z.string().min(1).max(500),
    result: z.enum(["recalled", "partial", "missed"]),
    evidenceType: evidenceTypeSchema,
    evidence: z.string().min(1).max(5000),
  })).max(100),
  nextFocus: z.array(z.string().min(1)).max(20).default([]),
}).strict();

export type PracticeRecord = z.infer<typeof PracticeRecordSchema>;

export interface PracticeFileError {
  path: string;
  code: "INVALID_RECORD" | "DUPLICATE_SESSION_ID" | "READ_FAILED";
  message: string;
}

export interface PracticeScanResult {
  records: PracticeRecord[];
  recordsByPath: Record<string, PracticeRecord>;
  errors: PracticeFileError[];
  readAt: string;
  filesRead: number;
}

export interface VocabularyPracticeSummary {
  vocabularyId: string;
  status: "unassessed" | "needs-practice" | "mastered";
  latestAt: string | null;
  evidenceCount: number;
  evidence: string[];
  expressions: string[];
  sessions: string[];
}

const startMarker = "<!-- enpet-practice-record:start -->";
const endMarker = "<!-- enpet-practice-record:end -->";

export function renderPracticeRecord(recordInput: unknown): string {
  const record = PracticeRecordSchema.parse(recordInput);
  return [
    `# Practice session — ${record.occurredAt.slice(0, 10)}`,
    "",
    `Course: ${record.courseId} · Unit: ${record.unitId} · Status: ${record.status}`,
    "",
    startMarker,
    "",
    "```json",
    JSON.stringify(record, null, 2),
    "```",
    "",
    endMarker,
    "",
  ].join("\n");
}

export function parsePracticeRecord(markdown: string): PracticeRecord {
  const start = markdown.indexOf(startMarker);
  const end = markdown.indexOf(endMarker);
  if (start < 0 || end < 0 || end <= start) throw new Error("缺少练习记录起止标记");
  const payload = markdown.slice(start + startMarker.length, end);
  const match = payload.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) throw new Error("记录区缺少 JSON 数据块");
  let decoded: unknown;
  try {
    decoded = JSON.parse(match[1]!);
  } catch (cause) {
    throw new Error(`JSON 格式错误：${cause instanceof Error ? cause.message : String(cause)}`);
  }
  return PracticeRecordSchema.parse(decoded);
}

async function collectMarkdownFiles(root: string): Promise<string[]> {
  const output: string[] = [];
  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(target);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) output.push(target);
    }
  }
  await visit(root);
  return output;
}

export async function scanPracticeRecords(root: string): Promise<PracticeScanResult> {
  const readAt = new Date().toISOString();
  let files: string[];
  try {
    const info = await stat(root);
    if (!info.isDirectory()) throw new Error("路径不是目录");
    files = await collectMarkdownFiles(root);
  } catch (cause) {
    const code = (cause as NodeJS.ErrnoException).code;
    return {
      records: [],
      recordsByPath: {},
      errors: [{
        path: root,
        code: "READ_FAILED",
        message: code === "ENOENT" ? "记录目录不存在" : cause instanceof Error ? cause.message : String(cause),
      }],
      readAt,
      filesRead: 0,
    };
  }

  const errors: PracticeFileError[] = [];
  const parsed: Array<{ path: string; record: PracticeRecord }> = [];
  for (const file of files) {
    try {
      parsed.push({ path: file, record: parsePracticeRecord(await readFile(file, "utf8")) });
    } catch (cause) {
      errors.push({
        path: file,
        code: "INVALID_RECORD",
        message: cause instanceof Error ? cause.message : String(cause),
      });
    }
  }

  const occurrences = new Map<string, string[]>();
  for (const item of parsed) occurrences.set(item.record.sessionId, [...(occurrences.get(item.record.sessionId) ?? []), item.path]);
  const duplicateIds = new Set<string>();
  for (const [sessionId, paths] of occurrences) {
    if (paths.length < 2) continue;
    duplicateIds.add(sessionId);
    for (const file of paths) errors.push({
      path: file,
      code: "DUPLICATE_SESSION_ID",
      message: `sessionId ${sessionId} 同时出现在 ${paths.length} 个文件中；这些记录已排除，避免重复计数`,
    });
  }

  const usable = parsed.filter(({ record }) => !duplicateIds.has(record.sessionId));
  return {
    records: usable.map(({ record }) => record)
      .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt) || left.sessionId.localeCompare(right.sessionId)),
    recordsByPath: Object.fromEntries(usable.map(({ path: file, record }) => [file, record])),
    errors,
    readAt,
    filesRead: files.length,
  };
}

export function summarizeVocabulary(records: PracticeRecord[]): Map<string, VocabularyPracticeSummary> {
  const grouped = new Map<string, Array<{ record: PracticeRecord; assessment: PracticeRecord["vocabularyAssessments"][number] }>>();
  for (const record of records) {
    for (const assessment of record.vocabularyAssessments) {
      grouped.set(assessment.vocabularyId, [...(grouped.get(assessment.vocabularyId) ?? []), { record, assessment }]);
    }
  }

  const result = new Map<string, VocabularyPracticeSummary>();
  for (const [vocabularyId, evidence] of grouped) {
    const ordered = [...evidence].sort((left, right) => left.record.occurredAt.localeCompare(right.record.occurredAt));
    const positive = ordered.filter(({ record, assessment }) =>
      record.status === "complete" && assessment.result === "recalled" &&
      (assessment.evidenceType === "spontaneous" || assessment.evidenceType === "rephrased"),
    );
    const positiveDays = new Set(positive.map(({ record }) => record.occurredAt.slice(0, 10)));
    const latest = ordered.at(-1);
    const latestIsNegative = latest?.assessment.result !== "recalled";
    const mastered = !latestIsNegative && positive.length >= 3 && positiveDays.size >= 2;
    result.set(vocabularyId, {
      vocabularyId,
      status: mastered ? "mastered" : "needs-practice",
      latestAt: latest?.record.occurredAt ?? null,
      evidenceCount: evidence.length,
      evidence: ordered.map(({ assessment }) => assessment.evidence),
      expressions: [...new Set(ordered.map(({ assessment }) => assessment.expression))],
      sessions: [...new Set(ordered.map(({ record }) => record.sessionId))],
    });
  }
  return result;
}

export function generatedExpressionId(expression: string): string {
  const slug = expression.normalize("NFKC").trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
  if (!slug) throw new Error("表达不能为空，无法生成稳定 ID");
  return `generated:${slug}`;
}
