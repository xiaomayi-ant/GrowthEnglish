import {
  ArrowUp,
  Check,
  ChevronDown,
  FolderOpen,
  MessageSquare,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings2,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { type ChatState, createConversation, restoreConversations } from "./chat-state";

const STORAGE_KEY = "broca.chat-preview.v1";

function Modal({
  title,
  children,
  onClose,
  className = "",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} className={`bc-dialog ${className}`} aria-label={title} onCancel={onClose}>
      <div className="bc-dialog-heading">
        <h2>{title}</h2>
        <button type="button" className="bc-icon" onClick={onClose} aria-label="关闭">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function ChatWorkspace({ onOpenLibrary }: { onOpenLibrary: () => void }) {
  const [state, setState] = useState<ChatState>(() => {
    try {
      return restoreConversations(localStorage.getItem(STORAGE_KEY));
    } catch {
      return restoreConversations(null);
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [provider, setProvider] = useState<"codex" | "api">("codex");
  const [notice, setNotice] = useState("");
  const [storageError, setStorageError] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const active = state.conversations.find((item) => item.id === state.selectedId) ??
    state.conversations[0] ?? { id: "welcome", draft: "", demo: false };
  const recent = state.conversations.filter((item) => item.demo || item.draft.trim());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [state]);

  useEffect(() => {
    const input = composerRef.current;
    if (input) {
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
    }
  });

  function updateDraft(value: string) {
    setState((current) => ({
      ...current,
      conversations: current.conversations.map((item) =>
        item.id === current.selectedId ? { ...item, draft: value } : item,
      ),
    }));
    setNotice("");
  }

  function startConversation() {
    setState((current) => createConversation(current, crypto.randomUUID()));
    setDrawerOpen(false);
    setNotice("");
    composerRef.current?.focus();
  }

  function openDemo() {
    setState((current) => {
      const existing = current.conversations.find((item) => item.demo);
      if (existing) return { ...current, selectedId: existing.id };
      const id = crypto.randomUUID();
      return {
        ...current,
        selectedId: id,
        conversations: [{ id, draft: "", demo: true }, ...current.conversations],
      };
    });
    setNotice("");
  }

  function submit() {
    if (!active.draft.trim()) return;
    setNotice("AI 对话尚未接通，你的输入已保留。");
  }

  const sidebar = (
    <>
      <div className="bc-brand-row">
        <button
          className="bc-brand"
          type="button"
          onClick={startConversation}
          aria-label="Broca 新对话"
        >
          <img src="/broca-mark.svg" alt="" width={34} height={34} />
          <span>Broca</span>
        </button>
        <button
          className="bc-icon bc-desktop-toggle"
          type="button"
          aria-label="收起侧栏"
          onClick={() => setSidebarOpen(false)}
        >
          <PanelLeftClose size={17} aria-hidden="true" />
        </button>
      </div>
      <button className="bc-new" type="button" onClick={startConversation}>
        <Plus size={18} aria-hidden="true" /> 新对话
      </button>
      <nav className="bc-recents" aria-label="最近会话">
        {recent.length > 0 ? <p>最近</p> : null}
        {recent.map((item) => (
          <button
            type="button"
            key={item.id}
            className="bc-conversation"
            aria-current={active.id === item.id ? "page" : undefined}
            title={item.demo ? "示例 · 从上下文猜词" : item.draft}
            onClick={() => {
              setState((current) => ({ ...current, selectedId: item.id }));
              setDrawerOpen(false);
              setNotice("");
            }}
          >
            <MessageSquare size={15} aria-hidden="true" />
            <span>{item.demo ? "示例 · 从上下文猜词" : item.draft}</span>
            {!item.demo ? <small>草稿</small> : null}
          </button>
        ))}
      </nav>
      <button
        className="bc-settings-button"
        type="button"
        onClick={() => {
          setDrawerOpen(false);
          setSettingsOpen(true);
        }}
      >
        <Settings2 size={17} aria-hidden="true" /> 设置
      </button>
    </>
  );

  return (
    <div className={`bc-app ${sidebarOpen ? "" : "bc-sidebar-collapsed"}`}>
      <aside className="bc-sidebar" aria-label="侧栏">
        {sidebar}
      </aside>
      <main className="bc-main">
        <header className="bc-chat-header">
          <button
            className="bc-icon bc-mobile-toggle"
            type="button"
            aria-label="打开侧栏"
            onClick={() => setDrawerOpen(true)}
          >
            <PanelLeftOpen size={19} aria-hidden="true" />
          </button>
          {!sidebarOpen ? (
            <button
              className="bc-icon bc-desktop-toggle"
              type="button"
              aria-label="展开侧栏"
              onClick={() => setSidebarOpen(true)}
            >
              <PanelLeftOpen size={19} aria-hidden="true" />
            </button>
          ) : null}
          {active.demo ? <span className="bc-demo-label">示例对话 · 非 AI 实时生成</span> : null}
        </header>

        <div className={`bc-reading ${active.demo ? "bc-has-messages" : ""}`}>
          {active.demo ? (
            <div className="bc-messages">
              <article className="bc-user-message" aria-label="示例用户消息">
                从 01 开始，带我根据上下文猜词。
              </article>
              <article className="bc-assistant-message" aria-label="示例 Broca 回复">
                <img src="/broca-mark.svg" alt="Broca" width={28} height={28} />
                <div>
                  <p>好，我们先读这一小段。</p>
                  <blockquote>
                    Three weeks before launch, Maya joined a small team building a meeting assistant
                    for a large <em>corporation</em>.
                  </blockquote>
                  <p>
                    这里的 <em>corporation</em>，你觉得是什么意思？
                  </p>
                  <small>01 · A Launch We Could Trust</small>
                </div>
              </article>
              <article className="bc-user-message" aria-label="示例用户猜测">
                协作？
              </article>
              <article className="bc-assistant-message" aria-label="示例提示">
                <img src="/broca-mark.svg" alt="Broca" width={28} height={28} />
                <div>
                  <p>
                    留意 <em>a large</em>：这里指一个有规模的组织。团队正在为它开发会议助手。
                  </p>
                  <p>你会想到哪一类组织？</p>
                </div>
              </article>
            </div>
          ) : (
            <div className="bc-welcome">
              <img src="/broca-mark.svg" alt="" width={58} height={58} />
              <h1>今天，想聊些什么？</h1>
              <button className="bc-demo-link" type="button" onClick={openDemo}>
                看看对话效果 <span aria-hidden="true">↗</span>
              </button>
            </div>
          )}
        </div>

        <div className="bc-composer-area">
          {storageError ? (
            <p className="bc-input-notice" role="alert">
              暂时无法保存草稿，请先复制输入内容再关闭页面。
            </p>
          ) : null}
          {notice ? (
            <p className="bc-input-notice" role="status">
              {notice}{" "}
              <button type="button" onClick={() => setSettingsOpen(true)}>
                查看接入状态
              </button>
            </p>
          ) : null}
          <form
            className="bc-composer"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <textarea
              ref={composerRef}
              aria-label="发送给 Broca 的消息"
              placeholder="说说你想学什么…"
              value={active.draft}
              rows={1}
              onChange={(event) => updateDraft(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing &&
                  event.keyCode !== 229
                ) {
                  event.preventDefault();
                  submit();
                }
              }}
            />
            <div className="bc-composer-tools">
              <button className="bc-provider" type="button" onClick={() => setSettingsOpen(true)}>
                连接 AI <ChevronDown size={13} aria-hidden="true" />
              </button>
              <div className="bc-send-tools">
                <span title="语音将在后续版本接入">
                  <button
                    type="button"
                    className="bc-icon bc-mic"
                    disabled
                    aria-label="语音输入，尚未接入"
                  >
                    <Mic size={19} aria-hidden="true" />
                  </button>
                </span>
                <button
                  className="bc-send"
                  type="submit"
                  aria-label="发送消息"
                  disabled={!active.draft.trim()}
                >
                  <ArrowUp size={19} aria-hidden="true" />
                </button>
              </div>
            </div>
          </form>
          <p className="bc-composer-caption">界面预览 · AI 与语音待接入</p>
        </div>
      </main>

      {drawerOpen ? (
        <Modal title="Broca" className="bc-drawer" onClose={() => setDrawerOpen(false)}>
          {sidebar}
        </Modal>
      ) : null}
      {settingsOpen ? (
        <Modal title="设置" onClose={() => setSettingsOpen(false)}>
          <section className="bc-settings-section">
            <h3>AI 服务</h3>
            <p>两种接入方式，共用一个对话入口。</p>
            <fieldset className="bc-provider-options" aria-label="服务接入方式预览">
              <button
                type="button"
                aria-pressed={provider === "codex"}
                onClick={() => setProvider("codex")}
              >
                <span>
                  <strong>Codex</strong>
                  <small>通过本机 CLI 连接</small>
                </span>
                {provider === "codex" ? <Check size={17} aria-hidden="true" /> : null}
              </button>
              <button
                type="button"
                aria-pressed={provider === "api"}
                onClick={() => setProvider("api")}
              >
                <span>
                  <strong>API Key</strong>
                  <small>使用自己的模型服务</small>
                </span>
                {provider === "api" ? <Check size={17} aria-hidden="true" /> : null}
              </button>
            </fieldset>
            <p className="bc-settings-note">
              {provider === "codex"
                ? "Codex 的聊天适配将在下一阶段接入。"
                : "API Key 配置将在下一阶段开放，本版不收集密钥。"}
              当前只预览界面。
            </p>
          </section>
          <section className="bc-settings-section">
            <h3>学习资料</h3>
            <button type="button" className="bc-library-link" onClick={onOpenLibrary}>
              <FolderOpen size={17} aria-hidden="true" /> 打开词库与学习记录{" "}
              <span aria-hidden="true">↗</span>
            </button>
            <p>暂时保留原版管理界面，现有词库与记录继续可用。</p>
          </section>
          <p className="bc-settings-footnote">
            本版草稿保存在当前浏览器中。语音、评分和视频能力将逐步接入。
          </p>
        </Modal>
      ) : null}
    </div>
  );
}
