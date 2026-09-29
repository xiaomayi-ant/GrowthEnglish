---
tags: [english, vocabulary, reading]
source: "[[english-words-005]]"
scene: 智能体会话、任务接纳与权限
---

# Who Is Allowed to Continue?

## English

For a design exercise, the team imagined a collaborative assistant that could plan work, launch tools, and recover after interruption. Its *intelligence* was useful, but that was only one *part* of the problem. The harder question was who could authorize an action when several *collaborators* shared a session. A fluent explanation did not establish *effective authority*.

The designer proposed a small *core facade*: one public *interface* through which callers submitted work. An *internal* *service* would check the permissions *supplied* with each request. Missing evidence was treated as *absent*, not as implicit approval. The runtime could *derive* its allowed actions from the intersection of valid grants and current restrictions. A capability that was *advertised* by a tool was not necessarily a capability the current user could exercise.

Requests entered an *admission inbox*. The *admission* controller *admits* a request only when it *satisfies* the required conditions. In the team's vocabulary, an *admission receipt* recorded the decision and its scope. This was not a school document; it was a durable record of accepted work. A *semaphore* limited how many jobs could enter the execution *lanes* at once. An otherwise *eligible* task might still have to wait for capacity.

The next stage was *runtime context assembly*. An *assembler* collected the current request, relevant workspace guidance, and the result of the *preceding* turn. It would *coalesce* duplicate notifications and *prune* outdated material. A stale instruction should not quietly become current policy. The designers called their versioned context snapshots *context epochs*. This label helped them explain when a message belonged to an older view of the session.

Execution took place in a *sandbox*. A worker launched a *subprocess*, and a storage *layer* recorded progress in a *database*. The shell worker's setup code “*mounts the configured* workspace directory,” as the design note put it. That phrase described setup, not unrestricted access to the host. Each execution *node* received only the resources required for its task.

When a worker stopped, the system entered *tool settlement and continuation*. Here, *settlement* meant recording the tool's final outcome and deciding what could happen next. A completed promise could be marked *fulfilled* even if its returned value described a business-level failure. If a worker was *interrupted by SIGTERM*, the runtime needed to record interruption explicitly. It could not pretend the requested operation had succeeded.

Recovery was governed by *session ownership and controls*. A coordinator *reconciles* stored events with live workers before deciding whether to *resume*. A callback from an older context might be *stale*. A missing completion event might indicate a crash rather than unfinished work. The team added a rule: “*Honor optional agent step limits*.” If a user had set a limit, recovery would preserve it instead of silently starting a fresh budget.

The policy button read “*Authorize*,” but the surrounding text explained the exact action. The specification separated *normative* requirements from examples and required explicit checks before *privileged* work. A *proprietary* document had to remain within its permitted boundary. In a shared trace, sensitive passages appeared as *redacted* text, while a *sanitized* event preserved enough structure for debugging. Content that was *omitted* from a public log could still require protected retention elsewhere.

During *post-run maintenance*, the assistant released resources and prepared a short handoff. A reviewer needed *discernment* to distinguish a useful continuation from an unnecessary one, and *diligence* to verify that the state was consistent. The *proposed* design made a *substantial* promise: interruptions should be understandable, not mysterious. Its *executive takeaway* was simple—good automation makes authority and outcomes visible, so people do not have to remain in *suspense* about what the system is doing.

## 中文翻译

在一次设计练习中，团队设想了一个协作助手，它能规划工作、启动工具，并在中断后恢复。它的智能很有用，但这只是问题的一部分。更难的问题是：当多位协作者共享一个会话时，谁有权批准某个操作？解释得流畅，并不能证明真正拥有有效权限。

设计师提出一个小型核心门面层：调用者通过统一的公共接口提交工作。内部服务检查随请求提供的权限依据。如果证据缺失，就视为缺失，而不是默认批准。运行时根据有效授权与当前限制的交集，推导允许执行的操作。工具对外声明拥有某项能力，并不意味着当前用户可以使用它。

请求进入任务接纳收件箱。只有满足必要条件，接纳控制器才会接受请求。按团队的术语，“接纳回执”记录决策及其范围。它不是学校的入学文件，而是一份持久保存的任务接受记录。信号量限制能够同时进入执行通道的任务数量。即使任务符合其他条件，也可能仍需等待空余容量。

下一阶段是运行时上下文组装。组装器收集当前请求、相关工作区指引和前一轮的结果。它合并重复通知，裁剪过期内容。陈旧指令不应悄悄变成现行规则。设计师把带版本的上下文快照称为“上下文纪元”。这个名称帮助他们说明，某条消息属于会话的旧视图。

执行发生在沙盒中。工作进程启动子进程，存储层把进展写入数据库。设计说明写道，shell 工作进程的初始化代码“挂载配置好的工作区目录”。这个短语描述的是初始化操作，并不意味着可以无限制访问宿主机。每个执行节点只获得任务所需的资源。

工作进程停止后，系统进入“工具收尾与继续执行”阶段。这里的 settlement 指记录工具的最终结果，并决定后续能做什么。一个 Promise 正常完成后可以处于 fulfilled 状态，即使它返回的值描述的是业务层面的失败。如果工作进程被 SIGTERM 中断，运行时就必须明确记录中断，不能假装请求的操作已成功。

恢复过程受会话归属和控制规则约束。协调器在决定是否恢复之前，会核对持久化事件和仍在运行的工作进程。来自旧上下文的回调可能已经过期。缺失完成事件也可能意味着进程崩溃，而不是工作尚未结束。团队增加了一条规则：“遵守用户可选设置的智能体步数限制。”如果用户设置过限制，恢复时必须保留，而不是悄悄重新分配一份完整预算。

策略界面上的按钮写着“授权”，周围的文字则说明具体批准什么操作。规范将必须遵守的要求与示例分开，并规定在执行高权限工作前必须明确检查。专有文档必须留在允许的范围内。共享追踪记录中的敏感段落会被遮盖，经过脱敏的事件则保留足够的结构供调试使用。从公开日志中省略的内容，仍可能需要在其他位置受到保护地保存。

在运行后维护阶段，助手释放资源，并准备简短的交接说明。评审者需要判断力，区分有用的继续执行与多余操作，也需要尽责地确认状态一致。这个设计方案作出了一个重要承诺：中断应该能够被理解，而不是变得神秘。给管理者的核心结论很简单——良好的自动化让权限和结果可见，使人不必一直悬着心，猜测系统正在做什么。
