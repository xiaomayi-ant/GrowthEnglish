import { ArrowLeft } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { ChatWorkspace } from "./ChatWorkspace";

const LegacyWorkspace = lazy(() => import("./LegacyWorkspace"));

export default function App() {
  const [libraryOpen, setLibraryOpen] = useState(false);
  if (!libraryOpen) return <ChatWorkspace onOpenLibrary={() => setLibraryOpen(true)} />;
  return (
    <div className="bc-library">
      <button className="bc-library-back" type="button" onClick={() => setLibraryOpen(false)}>
        <ArrowLeft size={16} aria-hidden="true" /> 返回 Broca 对话
      </button>
      <Suspense fallback={<p className="bc-loading">正在打开学习资料…</p>}>
        <LegacyWorkspace />
      </Suspense>
    </div>
  );
}
