import {
  BookOpen,
  CalendarDays,
  Check,
  Clipboard,
  Clock3,
  Database,
  FileWarning,
  History,
  RefreshCw,
  Settings as SettingsIcon,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type PracticeOverview, type PracticeVocabularyEntry } from "./api";
import { Settings } from "./Settings";

type Section = "today" | "vocabulary" | "history";

const statusLabels = {
  unassessed: "待练习",
  "needs-practice": "需要复习",
  mastered: "已掌握",
} as const;

function localDateTime(value: string | null): string {
  if (!value) return "尚无有效记录";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("zh-CN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function todayStamp(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (key: string) => parts.find((part) => part.type === key)?.value ?? "00";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function makePracticePrompt(
  overview: PracticeOverview,
  targets: PracticeVocabularyEntry[],
): string {
  const today = todayStamp();
  const targetList = targets.length
    ? targets
        .map((entry) => `- ${entry.word}（ID: ${entry.id}；来源：${entry.sourcePath}）`)
        .join("\n")
    : "- 从今天的实际工作或兴趣话题中选 2–3 个新表达，并用 generated:<lowercase-slug> 作为稳定 ID";
  const previous = overview.records.at(-1);
  const nextFocus = previous?.nextFocus.length
    ? previous.nextFocus.join("、")
    : "interested in、work with、I've also contributed to 等自然表达";
  return `请带我做一轮英语口语练习。我是 Simons，在 ByteDance 做 AI 工程，常做 agent development、harness 和 long-running tasks；我喜欢 Transformer、AI 应用和《Interstellar》。

开始前请先读取：
- 生词来源目录：${overview.vocabDir}
- 本机练习记录目录：${overview.recordsDir}
- 建议 sessionId 前缀：session-${today}-<本地时分秒>-<unit-slug>
- 最近一次重点：${nextFocus}

请从来源词汇中挑少量未掌握或待复习表达，并混入你为本轮情景设计的新短语。围绕我的工作或兴趣进行自然对话；每个单元只挑 1–3 个重点纠错，先给轻提示，再让我换说法重试，不要一次讲一大堆语法。将转写只能当作文本证据；不要声称评过音素、口音、重音或发音分数。

关键记录要求：每完成一个可独立复盘的练习单元，就立即按 docs/CODEX_PRACTICE_WORKFLOW.md 里的格式写一份 Markdown 到记录目录；不要等我说“结束”，也不要等待语音退出。若练习意外中断，在当前单元能判断完成状态时立即保存 status: partial。记录真实练习时间、原回答、修正、提示级别、每次重试、评估证据、下次重点和来源词汇稳定 ID。先检查 sessionId 没有重复；保留词库原文件不动。保存成功后告诉我文件名。

本轮目标表达：
${targetList}

建议从一个短情景开始，不需要一次练完全部词。`;
}

function EmptyNotice({ onSettings }: { onSettings: () => void }) {
  return (
    <div className="practice-empty">
      <Database aria-hidden="true" />
      <div>
        <h2>先连接你的本机词库</h2>
        <p>
          设置词库目录后，应用会导入其中匹配的 Markdown
          生词表，并保留原文件不变。现在不会替你猜一个词库路径。
        </p>
      </div>
      <button type="button" className="primary-button" onClick={onSettings}>
        <SettingsIcon aria-hidden="true" />
        配置来源目录
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: PracticeVocabularyEntry["practice"]["status"] }) {
  return (
    <span className={`practice-status practice-status-${status}`}>{statusLabels[status]}</span>
  );
}

function TodayView({
  overview,
  onCopy,
}: {
  overview: PracticeOverview;
  onCopy: (text: string) => void;
}) {
  const targets = overview.vocabulary
    .filter((entry) => entry.practice.status !== "mastered")
    .sort((left, right) => {
      const rank = { "needs-practice": 0, unassessed: 1, mastered: 2 };
      return (
        rank[left.practice.status] - rank[right.practice.status] ||
        (left.practice.latestAt ?? "").localeCompare(right.practice.latestAt ?? "") ||
        left.word.localeCompare(right.word)
      );
    })
    .slice(0, 6);
  const prompt = makePracticePrompt(overview, targets);
  const lastRecord = overview.records.at(-1);
  const sections = [
    { title: "工作更新", detail: "贡献、协作、影响与反思", id: "project-updates" },
    { title: "技术观点", detail: "解释 agent、harness 与模型选择", id: "technical-opinions" },
    {
      title: "研究与兴趣",
      detail: "Transformer、AI 应用与《Interstellar》",
      id: "research-and-interests",
    },
  ];

  return (
    <div className="practice-page">
      <section className="today-intro">
        <div>
          <p className="practice-date">
            <CalendarDays aria-hidden="true" />
            {new Intl.DateTimeFormat("zh-CN", { dateStyle: "full" }).format(new Date())}
          </p>
          <h2>今天练习什么</h2>
          <p>在 Codex 里继续口语对话；每完成一个练习单元，就把结果保存到本机记录目录。</p>
        </div>
        <div className="today-count">
          <strong>{targets.length}</strong>
          <span>待练表达</span>
        </div>
      </section>

      {overview.vocabulary.length === 0 ? (
        <EmptyNotice onSettings={() => window.dispatchEvent(new Event("enpet:open-settings"))} />
      ) : null}

      <section className="practice-section">
        <div className="practice-section-heading">
          <div>
            <h2>建议情景</h2>
            <p>课程路径是建议；完成情况只根据已保存的练习记录显示。</p>
          </div>
          {lastRecord ? (
            <span className="practice-muted">上次练习：{localDateTime(lastRecord.occurredAt)}</span>
          ) : null}
        </div>
        <div className="suggestion-list">
          {sections.map((section, index) => (
            <article
              key={section.id}
              className={`suggestion-row ${index === 0 ? "suggestion-current" : ""}`}
            >
              <span className="suggestion-marker">
                {index === 0 ? <Sparkles aria-hidden="true" /> : <span />}
              </span>
              <div>
                <strong>{section.title}</strong>
                <span>{section.detail}</span>
              </div>
              <small>
                {lastRecord?.unitId === section.id
                  ? "最近练习"
                  : index === 0
                    ? "建议先从这里开始"
                    : "后续单元"}
              </small>
            </article>
          ))}
        </div>
      </section>

      <section className="practice-section">
        <div className="practice-section-heading">
          <div>
            <h2>今天的重点表达</h2>
            <p>优先复习薄弱项；已掌握表达退出日常列表，之后可偶尔抽查。</p>
          </div>
        </div>
        {targets.length ? (
          <ul className="focus-list">
            {targets.map((entry) => (
              <li key={entry.id}>
                <div>
                  <strong>{entry.word}</strong>
                  <span>{entry.meaning}</span>
                </div>
                <StatusBadge status={entry.practice.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="quiet-empty">
            当前没有已导入的待练表达。可以先在词库页刷新，或让 Codex 为本轮情景提出新短语。
          </p>
        )}
      </section>

      <section className="practice-section prompt-section">
        <div className="practice-section-heading">
          <div>
            <h2>
              <Volume2 aria-hidden="true" />
              复制本轮 Codex 练习指令
            </h2>
            <p>指令会附上实际目录、待练词和最近一次重点；练习仍在 Codex 中进行。</p>
          </div>
        </div>
        <div className="prompt-preview">
          <pre>{prompt}</pre>
        </div>
        <div className="prompt-actions">
          <span>
            记录将写入 <code>{overview.recordsDir}</code>
          </span>
          <button type="button" className="primary-button" onClick={() => onCopy(prompt)}>
            <Clipboard aria-hidden="true" />
            复制指令
          </button>
        </div>
      </section>
    </div>
  );
}

function VocabularyView({ entries }: { entries: PracticeVocabularyEntry[] }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const filtered = entries.filter((entry) => {
    const matchesStatus = filter === "all" || entry.practice.status === filter;
    const searchable =
      `${entry.word} ${entry.meaning} ${entry.sourcePath} ${entry.id}`.toLowerCase();
    return matchesStatus && searchable.includes(query.toLowerCase());
  });
  return (
    <div className="practice-page">
      <div className="practice-page-title">
        <div>
          <h2>词汇追踪</h2>
          <p>保留来源与稳定 ID；掌握状态来自跨日期的练习证据，不是单次跟读。</p>
        </div>
        <span>
          {filtered.length} / {entries.length} 条
        </span>
      </div>
      <div className="vocabulary-controls">
        <input
          aria-label="搜索词汇"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索表达、释义、来源或 ID"
        />
        <fieldset className="filter-tabs">
          <legend className="visually-hidden">按练习状态筛选</legend>
          {["all", "unassessed", "needs-practice", "mastered"].map((value) => (
            <button
              type="button"
              key={value}
              className={filter === value ? "active" : ""}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {value === "all" ? "全部" : statusLabels[value as keyof typeof statusLabels]}
            </button>
          ))}
        </fieldset>
      </div>
      {filtered.length ? (
        <div className="vocabulary-table-wrap">
          <table className="vocabulary-table">
            <thead>
              <tr>
                <th>表达</th>
                <th>释义</th>
                <th>练习状态</th>
                <th>最近测评</th>
                <th>证据</th>
                <th>来源</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <strong>{entry.word}</strong>
                    <small>{entry.id}</small>
                  </td>
                  <td>{entry.meaning || "—"}</td>
                  <td>
                    <StatusBadge status={entry.practice.status} />
                  </td>
                  <td>
                    {entry.practice.latestAt ? localDateTime(entry.practice.latestAt) : "尚未测评"}
                  </td>
                  <td>
                    {entry.practice.evidenceCount
                      ? `${entry.practice.evidenceCount} 条 · ${entry.practice.evidence[0]}`
                      : "—"}
                  </td>
                  <td title={entry.sourcePath}>
                    {entry.origin === "generated"
                      ? "Codex 新表达"
                      : entry.sourcePath.split(/[\\/]/).at(-1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="quiet-empty">没有符合条件的词条。检查搜索词，或先刷新词库。</p>
      )}
    </div>
  );
}

function HistoryView({ overview }: { overview: PracticeOverview }) {
  const records = [...overview.records].sort((left, right) =>
    right.occurredAt.localeCompare(left.occurredAt),
  );
  return (
    <div className="practice-page">
      <div className="practice-page-title">
        <div>
          <h2>练习历史</h2>
          <p>按记录中的真实练习时间排序，不使用文件修改时间。</p>
        </div>
        <span>{records.length} 个练习单元</span>
      </div>
      {records.length ? (
        <div className="practice-history">
          {records.map((record) => (
            <article key={record.sessionId} className="history-record">
              <div className="history-record-date">
                <CalendarDays aria-hidden="true" />
                <span>{localDateTime(record.occurredAt)}</span>
                <small>{record.status === "complete" ? "已完成" : "部分完成"}</small>
              </div>
              <div className="history-record-content">
                <h3>
                  {record.courseId} <span>/</span> {record.unitId}
                </h3>
                <p>重点：{record.focus.join("、") || "本轮未指定"}</p>
                {record.turns.map((turn) => (
                  <div
                    key={`${record.sessionId}-${turn.prompt}-${turn.response}`}
                    className="history-turn"
                  >
                    <strong>{turn.prompt}</strong>
                    <p>你的回答：{turn.response || "（未作答）"}</p>
                    {turn.corrections.map((correction) => (
                      <div
                        key={`${correction.original}-${correction.corrected}`}
                        className="correction-row"
                      >
                        <span>{correction.original}</span>
                        <b aria-hidden="true">→</b>
                        <strong>{correction.corrected}</strong>
                        <small>
                          {correction.explanation} · 提示：{correction.hintLevel}
                        </small>
                        {correction.attempts.map((attempt) => (
                          <em key={`${attempt.result}-${attempt.response}`}>
                            重试：{attempt.response}（
                            {attempt.result === "recalled" ? "回忆正确" : "仍需练习"}）
                          </em>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
                {record.vocabularyAssessments.length ? (
                  <div className="assessment-evidence">
                    <strong>词汇测评证据</strong>
                    {record.vocabularyAssessments.map((assessment) => (
                      <p key={assessment.vocabularyId}>
                        <b>{assessment.expression}</b> · {assessment.result} ·{" "}
                        {assessment.evidenceType}：{assessment.evidence}
                      </p>
                    ))}
                    <small>此处是口语转写与回答证据，不代表发音评分。</small>
                  </div>
                ) : null}
                <footer>
                  <span>下次重点：{record.nextFocus.join("、") || "未指定"}</span>
                  <small>{record.vocabularyAssessments.length} 项词汇测评</small>
                </footer>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <History aria-hidden="true" />
          <h3>还没有练习记录</h3>
          <p>复制今日练习指令，在 Codex 完成一个单元后保存记录；刷新后会出现在这里。</p>
        </div>
      )}
    </div>
  );
}

export function PracticeWorkspace({ onOpenCards }: { onOpenCards: () => void }) {
  const [section, setSection] = useState<Section>("today");
  const [overview, setOverview] = useState<PracticeOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await api.practiceOverview());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "读取本机数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    const openSettings = () => setSettingsOpen(true);
    window.addEventListener("enpet:open-settings", openSettings);
    return () => window.removeEventListener("enpet:open-settings", openSettings);
  }, []);

  async function syncLocalFiles() {
    setRefreshing(true);
    setError(null);
    try {
      const result = await api.refreshPractice();
      setOverview(result);
      setNotice(`已读取 ${result.imported.parsed} 个词条、${result.records.length} 条练习记录`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "同步本机文件失败");
    } finally {
      setRefreshing(false);
    }
  }

  async function copyPrompt(prompt: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      setNotice("练习指令已复制；在 Codex 中粘贴并开始对话即可。");
    } catch {
      setNotice("无法访问剪贴板，请选中指令预览并手动复制。");
    }
  }

  const currentTitle = useMemo(
    () => ({ today: "今日学习", vocabulary: "词库", history: "练习历史" })[section],
    [section],
  );
  const pendingCount =
    overview?.vocabulary.filter((entry) => entry.practice.status !== "mastered").length ?? 0;

  return (
    <>
      {settingsOpen ? (
        <Settings
          onClose={() => {
            setSettingsOpen(false);
            void refresh();
          }}
        />
      ) : null}
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand-block">
            <div className="brand-mark">EN</div>
            <div>
              <strong>EnPet</strong>
              <span>学习追踪</span>
            </div>
          </div>
          <nav className="primary-nav" aria-label="学习追踪导航">
            <button
              type="button"
              className={section === "today" ? "active" : ""}
              onClick={() => setSection("today")}
            >
              <BookOpen aria-hidden="true" />
              今日学习
            </button>
            <button
              type="button"
              className={section === "vocabulary" ? "active" : ""}
              onClick={() => setSection("vocabulary")}
            >
              <Database aria-hidden="true" />
              词库<span className="nav-count">{overview?.vocabulary.length ?? 0}</span>
            </button>
            <button
              type="button"
              className={section === "history" ? "active" : ""}
              onClick={() => setSection("history")}
            >
              <History aria-hidden="true" />
              练习历史
            </button>
          </nav>
          <div className="workspace-sidebar-footer">
            <span>练习在 Codex 中进行</span>
            <button type="button" onClick={onOpenCards}>
              打开词卡复习
            </button>
          </div>
          <div className="sidebar-status">
            <span className={`status-dot ${overview ? "online" : "offline"}`} />
            <div>
              <strong>
                {overview ? `${overview.vocabulary.length} 个来源表达` : "本机记录未连接"}
              </strong>
              <span>{overview ? `${pendingCount} 个待练` : "等待刷新"}</span>
            </div>
          </div>
        </aside>
        <main className="main-content">
          <header className="topbar">
            <div>
              <span>
                {new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(new Date())}
              </span>
              <h1>{currentTitle}</h1>
            </div>
            <div className="topbar-actions">
              <button
                type="button"
                className="secondary-button"
                disabled={refreshing}
                onClick={() => void syncLocalFiles()}
              >
                {refreshing ? (
                  <RefreshCw className="spin" aria-hidden="true" />
                ) : (
                  <RefreshCw aria-hidden="true" />
                )}
                {refreshing ? "读取中" : "刷新本机文件"}
              </button>
              <button
                type="button"
                className="icon-button bordered"
                title="配置词库目录"
                onClick={() => setSettingsOpen(true)}
              >
                <SettingsIcon aria-hidden="true" />
              </button>
            </div>
          </header>
          {error ? (
            <div className="error-banner" role="alert">
              <FileWarning aria-hidden="true" />
              <span>{error}</span>
              <button type="button" onClick={() => void refresh()}>
                重试
              </button>
            </div>
          ) : null}
          {notice ? (
            <div className="setup-banner" role="status">
              <Check aria-hidden="true" />
              <span>{notice}</span>
              <button
                type="button"
                className="icon-button"
                onClick={() => setNotice(null)}
                aria-label="关闭提示"
              >
                ×
              </button>
            </div>
          ) : null}
          {overview?.errors.length ? (
            <div className="record-warning" role="status">
              <FileWarning aria-hidden="true" />
              <div>
                <strong>{overview.errors.length} 个记录文件需要检查</strong>
                {overview.errors.map((item) => (
                  <span key={`${item.path}-${item.code}`}>
                    {item.path}: {item.message}
                  </span>
                ))}
                <small>有效记录仍可查看；损坏文件上次成功读取的版本会暂时保留。</small>
              </div>
            </div>
          ) : null}
          <div className="read-status">
            <span>
              <Clock3 aria-hidden="true" />
              最近读取：{localDateTime(overview?.readAt ?? null)}
              {overview?.lastCleanReadAt
                ? ` · 最近完整读取：${localDateTime(overview.lastCleanReadAt)}`
                : ""}
            </span>
            <small>
              词库来源：{overview?.vocabDir ?? "读取中"} · 练习记录：
              {overview?.recordsDir ?? "读取中"}
            </small>
          </div>
          {loading || !overview ? (
            <div className="loading-state">
              <span>正在读取本机学习资料…</span>
            </div>
          ) : (
            <div className="view-content">
              {section === "today" ? (
                <TodayView overview={overview} onCopy={copyPrompt} />
              ) : section === "vocabulary" ? (
                <VocabularyView entries={overview.vocabulary} />
              ) : (
                <HistoryView overview={overview} />
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
