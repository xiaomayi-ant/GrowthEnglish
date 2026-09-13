# Codex Speaking Practice Workflow

This workflow keeps spoken practice in the Codex conversation. EnPet does not capture audio, inspect Codex voice internals, or provide a voice API. Codex writes completed practice units as local Markdown files; EnPet reads those files when opened or refreshed.

## Local folders

- Vocabulary source: the folder configured in EnPet Settings. Source files are read-only to this workflow.
- Practice records: `<EnPet data directory>/learning-records/` (shown in the app). Keep records on this machine.
- The app scans nested `.md` files. Use one file per completed practice unit.

## Start a practice session

1. Read this workflow, the current course plan, and recent session records in the practice records folder. If a record file is invalid, report it; do not silently skip it.
2. Read the configured vocabulary folder and identify expressions by their stable source IDs. Choose a small number of not-yet-assessed or needs-practice expressions. Add a few new, relevant expressions when useful.
3. Check existing session IDs before creating a new record. Do not repeat an existing `sessionId`. A source vocabulary ID is the parser's stable `fNNN-rNNN-cNN` ID; a generated expression uses `generated:<normalized-expression>`.
4. Use the learner's known profile and the current next-focus items to propose one short, natural scenario. Ask one question at a time. Keep corrections selective: usually one to three per unit. Use a light cue before giving a direct correction, then ask for a retry.

## Save each unit

Save immediately after each independently reviewable scenario/unit. Do not wait for the learner to say the conversation is over, and do not assume anything will run after voice mode exits. If a unit is interrupted, save the work completed so far with `status: "partial"`; start a new unique session file for the next unit.

Write Markdown with this exact machine-readable block. Human-readable headings may be added outside the block; keep the JSON block complete and valid.

````markdown
# Practice session — 2026-09-13

<!-- enpet-practice-record:start -->

```json
{
  "schemaVersion": 1,
  "sessionId": "session-2026-09-13-091500-project-update",
  "occurredAt": "2026-09-13T09:15:00-07:00",
  "status": "complete",
  "courseId": "workplace-ai-english",
  "unitId": "project-updates",
  "focus": ["interested in", "work with"],
  "turns": [
    {
      "prompt": "Tell me about an AI project you have contributed to.",
      "response": "I am interested on the project and work with the agent team.",
      "corrections": [
        {
          "original": "interested on",
          "corrected": "interested in",
          "explanation": "Use interested in + noun or gerund.",
          "hintLevel": "light",
          "attempts": [
            {
              "response": "I am interested in the project.",
              "result": "recalled"
            }
          ]
        }
      ]
    }
  ],
  "vocabularyAssessments": [
    {
      "vocabularyId": "f001-r002-c01",
      "expression": "interested in",
      "result": "recalled",
      "evidenceType": "spontaneous",
      "evidence": "I am interested in the project."
    },
    {
      "vocabularyId": "generated:contribute-to",
      "expression": "contribute to",
      "result": "partial",
      "evidenceType": "rephrased",
      "evidence": "I helped with the model evaluation work."
    }
  ],
  "nextFocus": ["I've also contributed to", "work with"]
}
```

<!-- enpet-practice-record:end -->
````

Accepted values:

- `status`: `complete` or `partial`.
- `hintLevel`: `none`, `light`, or `direct`.
- retry `result`: `recalled` or `needs-practice`.
- vocabulary assessment `result`: `recalled`, `partial`, or `missed`.
- `evidenceType`: `spontaneous`, `rephrased`, `read-aloud`, or `transcript-only`.

Record actual user responses and concrete evidence, not reconstructed dialogue. A transcription is evidence about recognized words, not a pronunciation score. Never invent phoneme, accent, stress, or rhythm ratings. Read-aloud evidence by itself does not count toward mastery.

## How the app interprets evidence

EnPet treats Markdown session files as the sole authority for speaking-practice history and assessment evidence. It calculates, rather than stores, the vocabulary practice status:

- **Unassessed**: no valid assessment references the vocabulary ID.
- **Needs practice**: assessed but the mastery rule below has not been met, or the latest result is partial/missed.
- **Mastered**: at least three recalled assessments with spontaneous or rephrased evidence, across at least two distinct `occurredAt` calendar dates, with no later partial/missed result.

A read-aloud or transcript-only result cannot count toward the three positive assessments. Mastered words leave the daily focus list; the vocabulary view can still be used for occasional spot checks. The application derives practice status from records each time it scans. SQLite remains the operational store for the existing vocabulary index and fixed vocabulary review schedule; it is not a second store for speaking-practice state.

## Refresh and failures

The app scans records at startup and through **Refresh local files**. That action also re-imports the configured vocabulary source into SQLite using stable source-location IDs; it does not rewrite source Markdown. Valid records remain visible if another file is malformed. The invalid file path and validation error appear in the app. If a previously valid file becomes malformed while the app is open, its last valid in-memory copy stays visible until the file is repaired or removed. Fix the source file and refresh again.

Files are ordered by `occurredAt`, never by filesystem modification time. Duplicate session IDs are rejected from the view and surfaced as errors; resolve the collision by assigning distinct IDs to genuinely distinct units.
