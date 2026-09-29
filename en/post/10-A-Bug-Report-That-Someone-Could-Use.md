---
tags: [english, vocabulary, reading]
source: "[[english-words-005]]"
scene: 桌面自动化、故障复现与代码评审
---

# A Bug Report That Someone Could Use

## English

On Monday, a tester could not export a client proposal from a desktop application. She *suspected* a storage *defect*, but her first report said only, “The button does nothing.” Arun asked for *steps to reproduce*. A useful report needed to *surface* the difference between what the tester expected and what the application actually did.

They reduced the case to a document titled “*Simple Business Proposal*.” It contained a short budget prepared with a *spreadsheets skill*. On *macOS*, the automation could find the export button in the *accessibility tree*, but a click did not always trigger the expected event. In *Chrome*, the same flow succeeded. The engineers used *Chrome DevTools MCP* to inspect the browser version, then compared its behavior with the desktop application. They did not assume that a visible label proved an action had completed.

The tester added the operating system, application version, and current commit. *git branch --show-current* identified the branch; *git rev-parse --short HEAD* provided a compact revision identifier. *git status --short* showed local edits, and *git remote -v* helped confirm which repository was under test. A colleague used *git rev-parse HEAD* when an unambiguous full commit hash was needed. These details turned an anecdote into a reproducible case.

Next they rebuilt the environment. The project used *npm ci* for a clean installation matching its lockfile, rather than a casual *npm install* that could change dependency resolution. Another package used *pnpm install --frozen-lockfile* for the same purpose. They checked *go version* for a small helper service and *docker info* for the container environment. When they needed to see stopped containers as well as running ones, they used *docker ps -a --no-trunc*.

The real bug was in a process wrapper. Its *RunOptions* described the command, and its *RunResult* contained the exit status and output. One path called *collectStream* but ignored the final exit code. A check named *requireSuccess* was missing. Another path used *requireExitIn* to accept a documented set of exit codes. The exact names belonged to this example's wrapper, but the principle was general: reading output is not the same as checking success.

Cancellation exposed a second problem. *An asynchronous* handler called *waitForAbort*, yet cleanup did not consistently produce the expected *abortError*. The streaming path also had its own *RunStreamOption*, which needed the same cancellation policy. A *StorageError* was sometimes wrapped as an *AppProcessError*, which hid the useful cause. Nested callbacks formed a *pyramid of doom*. The refactor separated *the primitives* for starting, waiting, collecting, and cancelling, then used *Do-notation* in the chosen effect library to express the sequence more clearly.

Arun checked the *temporal* behavior as well as the return types. A stored callback could retain an old value even when the interface showed a new one. In a teaching example, *savedCallbackNaive* and *programNaive* made that mistake visible. Calling *readInstanceRightNow* was not automatically safe either: reading current state does not guarantee that a later action uses the same state. A helper named *getReferenceUnsafe* deserved particular scrutiny. The word *unsafe* signaled an obligation to understand its assumptions.

The team would not *coerce* an arbitrary value into a trusted identifier. An array named *tenantIds* required validation and authorization checks. A stored *AssistantMessage* included *sanitizedContent*, while a *StorageService* handled persistence. Browser *localStorage* was useful for harmless preferences, not secret credentials. A stable request identifier served as an *anchor* across logs. Instead of an *exhaustive* rewrite, the team fixed one narrow *slice* of the workflow and tested it carefully.

Finally, the reviewer checked event *handlers* and the user's *prefers-reduced-motion* setting. The test document exported correctly even when animations were reduced. Before committing, the author inspected *git diff --cached --stat* and *git diff --cached --check*. The review included a *usage example* and a short explanation of the failure. Arun's favorite *study method* was now part of team practice: reduce a confusing case, explain the mechanism, and verify the result someone actually needs.

## 中文翻译

周一，一位测试人员无法从桌面应用导出客户提案。她怀疑是存储缺陷，但最初的报告只有一句：“按钮没反应。”Arun 请她补充复现步骤。一份有用的报告，需要揭示预期行为与实际行为之间的差异。

他们把案例缩减为一份名为“简单商业提案”的文档，其中包含使用电子表格技能准备的简短预算。在 macOS 上，自动化可以在无障碍树中找到导出按钮，但点击不一定触发预期事件。同样的流程在 Chrome 中却能成功。工程师用 Chrome DevTools MCP 检查浏览器版本，再与桌面应用的行为比较。他们没有把“看得见某个标签”当作“操作已经完成”的证据。

测试人员补充了操作系统、应用版本和当前提交。git branch --show-current 用于确认分支，git rev-parse --short HEAD 提供简短的版本标识。git status --short 显示本地修改，git remote -v 帮助确认测试的是哪个仓库。如果需要没有歧义的完整提交哈希，同事就使用 git rev-parse HEAD。这些细节把一次口头描述变成了可复现的案例。

接着，他们重建环境。项目使用 npm ci，按照锁文件进行干净安装，而不是随手执行可能改变依赖解析结果的 npm install。另一个包使用 pnpm install --frozen-lockfile 达到相同目的。他们用 go version 检查小型辅助服务的环境，用 docker info 检查容器环境。需要同时查看已停止和仍运行的容器时，就使用 docker ps -a --no-trunc。

真正的问题出在进程包装层。RunOptions 描述命令，RunResult 包含退出状态和输出。一条路径调用了 collectStream，却忽略了最终退出码，漏掉了名为 requireSuccess 的检查。另一条路径使用 requireExitIn，接受文档规定的一组退出码。这些具体名称属于本文示例中的包装层，但原则是通用的：读取输出，不等于确认成功。

取消操作暴露了第二个问题。一个异步处理函数调用 waitForAbort，但清理过程没有稳定地产生预期的 abortError。流式路径还有自己的 RunStreamOption，也需要遵循相同的取消策略。StorageError 有时被包装成 AppProcessError，掩盖了有用的原因。嵌套回调形成了“厄运金字塔”。重构把启动、等待、收集和取消拆成基础操作，再用所选 effect 库中的 Do-notation 更清楚地表达执行顺序。

Arun 不仅检查返回类型，也检查与时间顺序有关的行为。即使界面显示了新值，保存的回调仍可能保留旧值。在一个教学示例里，savedCallbackNaive 和 programNaive 把这个错误展示出来。调用 readInstanceRightNow 也不自动意味着安全：读取当前状态，并不能保证后续操作使用的仍是同一状态。名为 getReferenceUnsafe 的辅助函数尤其需要审查。“不安全”这个词意味着调用者有责任理解它依赖的假设。

团队不会把任意值强制转换成可信标识符。名为 tenantIds 的数组需要校验和授权检查。保存的 AssistantMessage 包含 sanitizedContent，由 StorageService 处理持久化。浏览器 localStorage 可以存放无害偏好，却不适合保存秘密凭据。稳定的请求标识符成为串联日志的锚点。团队没有全面重写，而是修复流程中一小段明确范围的问题，并认真测试。

最后，评审者检查了事件处理函数和用户的 prefers-reduced-motion 设置。即使减少动画，测试文档仍能正确导出。提交之前，作者查看了 git diff --cached --stat 和 git diff --cached --check。评审材料包含使用示例，以及对故障的简短说明。Arun 最喜欢的学习方法如今成了团队习惯：缩小令人困惑的案例，解释机制，再验证别人真正需要的结果。
