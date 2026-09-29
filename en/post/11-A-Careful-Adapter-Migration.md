---
tags: [english, vocabulary, reading]
source: "[[english-words-006]]"
carry_from: "[[english-words-005]]"
scene: 适配器接入、兼容层与发布验证
---

# A Careful Adapter Migration

## English

In a fictional desktop project called *WorkHub*, an engineer named Nina had to connect two search tools to a new provider interface. The old integration had been *retrofitted* several times. A recent design had *superseded* it, but existing users still depended on the previous behavior. Nina created a *dedicated* migration branch and made the transition *deliberately* small.

She began with a *snapshot* of the working application. *git status* showed whether the checkout was clean, while *git branch -vv* showed local branches and their upstream relationships. After *git fetch origin dev*, she used *git switch dev* to inspect the current development base. For comparison with the beta release, she ran *git fetch origin beta* and checked a separate working copy. This *discipline* kept unrelated local changes out of the investigation.

The project contained a Go helper and a JavaScript front end. Nina used *go mod download* to obtain the Go dependencies and *bun install --frozen-lockfile* to install the front-end dependencies without changing the lockfile. She read the setup notes before running project-specific scripts. A command that worked in one repository was not automatically the right command in another.

The design introduced a *ProviderAdapter*. In the example code, *anthropicAdapter* implemented that interface for one provider. A temporary *shim* preserved the old call signature while the callers migrated. A simple *stub* returned a fixed response; an *echo-stub* returned the input so that tests could inspect the request path. These substitutes made failures easier to isolate, but they were not evidence that the real integration worked.

The two tools, *style-search* and *fabric-search*, needed different request fields. Nina made both pass through *requireSession* before execution. A *MessagesQuery* selected relevant conversation history, while *resolvePromptParts* combined the permitted prompt components. The configuration document was represented by *ConfigMarkdown*. She used consistent *camelCase* for local identifiers so that *statusSvc* and similar names were easy to recognize. The names described this example's design, not a universal framework contract.

At the transport boundary, a *StdioClientTransport* exchanged messages with a child process. On the desktop side, a helper named *registerIpc* registered the allowed communication channels. Nina made each boundary *observable*: a request had a trace identifier, a clear start event, and a recorded outcome. *Defects* could then be traced to a layer instead of being dismissed as “the model acting strangely.”

The *UI* also needed attention. A design token labeled “*Tertiary input field-border*” had been copied into the implementation without explanation. Nina clarified that it referred to the border styling for a tertiary input variant. She verified focus visibility and disabled states, rather than assuming that a token name was a complete design specification. A small visual inconsistency could reveal a larger gap between design and code.

Near the end, another change caused a rebase conflict. Nina used *git rebase --abort* when she decided to return to the state before the rebase. She used *git stash* only after checking which edits she needed to preserve. When the migration was ready, she chose specific files with *git add* and reviewed the staged patch. Although *git add -A* was available, it would also stage unrelated changes if the working tree contained them.

The limited *rollout* began with internal users. The old adapter remained available until the new path passed real integration checks. Nina's handoff *distills* the work into three *takeaways*: keep compatibility temporary, make boundaries visible, and test the real provider before removing the substitute. From that point *onward*, the team could expand the migration with evidence instead of hope.

## 中文翻译

在一个名为 WorkHub 的虚构桌面项目中，工程师 Nina 需要把两个搜索工具接入新的服务提供商接口。旧集成已经被多次改装。最近的新设计取代了它，但现有用户仍依赖原先的行为。Nina 创建了专门的迁移分支，并有意把这次过渡控制在很小的范围。

她先记录可正常运行的应用快照。git status 用来确认工作区是否干净，git branch -vv 则显示本地分支及其上游关系。执行 git fetch origin dev 后，她用 git switch dev 检查当前开发基线。为了与 beta 版本比较，她运行 git fetch origin beta，并查看独立的工作副本。这样的纪律避免无关本地修改混入排查过程。

项目包含一个 Go 辅助程序和一个 JavaScript 前端。Nina 用 go mod download 获取 Go 依赖，用 bun install --frozen-lockfile 安装前端依赖而不修改锁文件。运行项目专用脚本前，她先阅读初始化说明。在一个仓库里适用的命令，并不自动适用于另一个仓库。

设计引入了 ProviderAdapter。在示例代码里，anthropicAdapter 为某个提供商实现该接口。一个临时兼容层保留旧的调用形式，供调用方逐步迁移。简单的存根返回固定响应，echo-stub 则原样返回输入，让测试能检查请求链路。这些替代物便于隔离故障，却不能证明真实集成已经正常工作。

style-search 和 fabric-search 两个工具需要不同的请求字段。Nina 要求它们在执行前都经过 requireSession。MessagesQuery 选择相关会话历史，resolvePromptParts 则组合允许使用的提示词片段。配置文档由 ConfigMarkdown 表示。她对局部标识符统一使用驼峰命名，让 statusSvc 等名称容易辨认。这些名称描述的是本文示例设计，而不是某个通用框架的约定。

在传输边界，StdioClientTransport 与子进程交换消息。桌面端则由名为 registerIpc 的辅助函数注册允许使用的通信通道。Nina 让每个边界都具备可观测性：请求带有追踪标识、明确的开始事件和已记录的结果。这样，缺陷就能被定位到某一层，而不是笼统地归因于“模型表现奇怪”。

用户界面也需要检查。一个名为“Tertiary input field-border”的设计令牌未经解释就被复制到实现中。Nina 澄清，它指的是第三级输入框变体的边框样式。她验证了聚焦时的可见性和禁用状态，而没有把令牌名称当成完整的设计规范。一个小小的视觉不一致，也可能暴露设计与代码之间更大的理解差距。

接近完成时，另一项变更造成了变基冲突。Nina 决定回到变基之前的状态，于是使用 git rebase --abort。使用 git stash 前，她先确认哪些修改需要保存。迁移准备好后，她用 git add 选择具体文件，并审核暂存的补丁。虽然也可以使用 git add -A，但如果工作区有无关变更，它也会把那些内容一并暂存。

有限范围的发布先面向内部用户。新链路通过真实集成检查之前，旧适配器仍然可用。Nina 的交接说明把工作提炼为三个要点：兼容层应是临时的，边界应当可见，移除替代物之前应验证真实提供商。从此以后，团队就能依靠证据而非希望，扩大迁移范围。
