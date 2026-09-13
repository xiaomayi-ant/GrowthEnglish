import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  type PracticeRecord,
  parsePracticeRecord,
  scanPracticeRecords,
  summarizeVocabulary,
} from "./index.js";

const roots: string[] = [];
const record: PracticeRecord = {
  schemaVersion: 1,
  sessionId: "session-2026-09-13-a",
  occurredAt: "2026-09-13T09:00:00-07:00",
  status: "complete",
  courseId: "workplace-english",
  unitId: "project-updates",
  focus: ["interested in", "work with"],
  turns: [
    {
      prompt: "Tell me about your project.",
      response: "I am interested on the project.",
      corrections: [
        {
          original: "interested on",
          corrected: "interested in",
          explanation: "Use interested in.",
          hintLevel: "light",
          attempts: [{ response: "I am interested in the project.", result: "recalled" }],
        },
      ],
    },
  ],
  vocabularyAssessments: [
    {
      vocabularyId: "f001-r001-c01",
      expression: "interested in",
      result: "recalled",
      evidenceType: "spontaneous",
      evidence: "I am interested in the project.",
    },
  ],
  nextFocus: ["interested in"],
};

async function tempRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), "enpet-practice-"));
  roots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("practice records", () => {
  it("parses the documented markdown payload and preserves real exercise evidence", () => {
    const markdown = `# Session\n\n<!-- enpet-practice-record:start -->\n\n\`\`\`json\n${JSON.stringify(record)}\n\`\`\`\n\n<!-- enpet-practice-record:end -->`;
    expect(parsePracticeRecord(markdown)).toEqual(record);
  });

  it("derives mastered only after repeated retrieval on separate days, never from read-aloud", () => {
    const baseAssessment = record.vocabularyAssessments[0];
    if (!baseAssessment) throw new Error("fixture assessment is missing");
    const records: PracticeRecord[] = [
      record,
      { ...record, sessionId: "session-b", occurredAt: "2026-09-14T09:00:00-07:00" },
      {
        ...record,
        sessionId: "session-c",
        occurredAt: "2026-09-15T09:00:00-07:00",
        vocabularyAssessments: [{ ...baseAssessment, evidenceType: "read-aloud" }],
      },
    ];
    expect(summarizeVocabulary(records).get("f001-r001-c01")?.status).toBe("needs-practice");
    const lastRecord = records[2];
    if (!lastRecord) throw new Error("fixture session is missing");
    records[2] = { ...lastRecord, vocabularyAssessments: [baseAssessment] };
    expect(summarizeVocabulary(records).get("f001-r001-c01")?.status).toBe("mastered");
  });

  it("reports malformed and duplicate records without hiding valid records", async () => {
    const root = await tempRoot();
    const markdown = `# Session\n<!-- enpet-practice-record:start -->\n\n\`\`\`json\n${JSON.stringify(record)}\n\`\`\`\n\n<!-- enpet-practice-record:end -->`;
    await mkdir(root, { recursive: true });
    await writeFile(path.join(root, "one.md"), markdown);
    await writeFile(path.join(root, "two.md"), markdown);
    await writeFile(path.join(root, "bad.md"), "# broken");
    const result = await scanPracticeRecords(root);
    expect(result.records).toHaveLength(0);
    expect(result.errors).toHaveLength(3);
    expect(result.errors.map((error) => error.code)).toContain("DUPLICATE_SESSION_ID");
    expect(result.errors.map((error) => error.code)).toContain("INVALID_RECORD");
    expect(result.readAt).toMatch(/^\d{4}-/);
  });

  it("keeps valid records available when another file is invalid", async () => {
    const root = await tempRoot();
    await mkdir(root, { recursive: true });
    await writeFile(
      path.join(root, "valid.md"),
      `<!-- enpet-practice-record:start -->\n\n\`\`\`json\n${JSON.stringify(record)}\n\`\`\`\n\n<!-- enpet-practice-record:end -->`,
    );
    await writeFile(path.join(root, "bad.md"), "# broken");
    const result = await scanPracticeRecords(root);
    expect(result.records).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
  });
});
