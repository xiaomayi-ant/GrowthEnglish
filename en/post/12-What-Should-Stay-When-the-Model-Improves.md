---
tags: [english, vocabulary, reading]
source: "[[english-words-006]]"
scene: AI 架构取舍、评测与责任边界
---

# What Should Stay When the Model Improves?

## English

When a stronger model became available, the team expected their assistant to improve immediately. Instead, the new model spent much of its time following old routing rules. The application contained *elaborate* decision trees, deep *hierarchies*, and dozens of *hand-tuned* exceptions. Each rule had once solved a real problem. Together, they now prevented the model from using its newer capabilities.

At the architecture review, Mei introduced *the Bitter Lesson*, an argument associated with AI researcher Richard Sutton: general methods that benefit from computation have often outperformed approaches built around extensive human-designed knowledge. It was a *bitter* observation for engineers who had spent months crafting special cases. But it was not a claim that every product rule should disappear.

Mei separated *compensatory* mechanisms from lasting constraints. A compensatory mechanism *makes up for* a model's current *weaknesses*. For example, a script might *pre-chew* a document into a narrow template because an older model struggled with long input. As a newer model *absorbs* more of that work, the script may become unnecessary. *Rigid* routing can then reduce quality by forcing a capable model down an outdated path.

The team's first experiment removed one such template. The new model *improved on* the old system in most of their test cases, but it also missed a few important details. *Repairing* that problem did not automatically require restoring the entire template. A *clever* engineer proposed a smaller check that verified required evidence. The team tested the proposal instead of assuming that less code was always better.

Their measurements needed to *reflect* the *reality* of customer work. A *ground-truth* answer set helped, but one rigid reference answer could penalize a different valid response. The *eval suite* therefore combined factual checks, task outcomes, and human review. More model *cognition*, or simply *thinking harder*, did not guarantee improvement if the evaluation rewarded the wrong behavior.

Some constraints remained essential. *Authority* and *accountability* did not disappear when the model became smarter. Access *credentials* still belonged behind an enforced boundary. The model could propose an action, but permission checking *lives* in the execution path. That distinction had to be *wired in* from the beginning. A check *wired* only into a prompt could be forgotten, misread, or bypassed by a different route.

One colleague compared the permission document to a team's *Magna Carta*. Mei accepted the image carefully. *Magna* means “great” and *carta* means “charter” in Latin; these are parts of a historical title, not ordinary English technical terms. The useful analogy was a durable statement of limits on power. The document mattered only if the system enforced those limits when actions occurred.

The review changed how the team thought about complexity. Better models do not make all engineering vanish. They change which work belongs where. A stronger model may take over a brittle planning routine, while execution checks remain explicit. In that sense, progress *relocates* complexity and sometimes *shrinks* it. The rules that *age fastest* are often those designed around a temporary limitation of one model.

For a new routing heuristic, Mei suggested: “*Put it behind flags*.” Feature flags would let the team compare behavior and withdraw the heuristic without a large rewrite. Every extra rule should justify its cost in the evaluation; that is how it *earns its place*. The goal was not the smallest possible codebase, but a system whose remaining complexity had a clear purpose.

Mei ended with a *closing analogy*. Training wheels can help someone learn to ride, but brakes remain useful after the rider improves. The engineering task is to tell those two kinds of support apart. As the model gets stronger, remove the supports it no longer needs, test what changes, and preserve the controls that make its actions dependable.

## 中文翻译

一个更强的模型发布后，团队原以为助手会立刻变好。实际情况却是，新模型的大量时间仍花在遵循旧路由规则上。应用里有复杂的决策树、深层结构，以及几十条手工调整的例外规则。每条规则都曾解决过真实问题，但组合起来后，它们反而阻止模型发挥新能力。

架构评审时，Mei 介绍了人工智能研究者 Richard Sutton 提出的“苦涩的教训”：能够从计算规模中获益的通用方法，往往会胜过大量依赖人类预先设计知识的方法。对于花了数月精心设计特殊规则的工程师来说，这个观察令人苦涩。但它并不意味着所有产品规则都应该消失。

Mei 区分了补偿性机制和长期需要的约束。补偿性机制用来弥补模型当前的弱点。例如，旧模型不擅长处理长输入，于是脚本先把文档加工成狭窄的固定模板。随着新模型吸收了更多此类工作，这个脚本可能不再必要。死板的路由此时反而会降低质量，因为它迫使更有能力的模型沿着过时路径行动。

团队的第一个实验移除了一个这样的模板。新模型在大多数测试案例里超过了旧系统，但也漏掉了一些重要细节。修复这个问题，不一定要把整套模板恢复。一位聪明的工程师提出增加一个更小的检查，验证必要证据是否齐全。团队测试了这个方案，而没有假定代码越少就一定越好。

他们的测量必须反映客户工作的实际情况。基准答案集很有帮助，但唯一且僵硬的参考答案，也可能让另一种有效回答被误判。因此，评估套件结合了事实检查、任务结果和人工审核。如果评估奖励的是错误行为，那么更多的模型认知能力，或者仅仅“更努力地思考”，都不能保证进步。

有些约束仍然不可或缺。模型变聪明之后，权限与责任并不会消失。访问凭据仍须受到强制边界的保护。模型可以建议操作，但权限检查必须存在于实际执行链路中。这种区分要从一开始就接入系统。如果检查只写进提示词，就可能被遗忘、误解，或被另一条路径绕过。

一位同事把权限文档比作团队的“大宪章”。Mei 谨慎地接受了这个比喻。Magna 和 carta 在拉丁语中分别意为“大”和“宪章”；它们是历史名称的组成部分，不是普通英语技术术语。这个类比的有用之处，在于强调一份持久约束权力的声明。只有系统在执行操作时落实这些限制，文档才真正有意义。

这次评审改变了团队对复杂度的看法。更好的模型不会让所有工程工作消失，而会改变不同工作应当放在哪里。更强的模型可能接管脆弱的规划流程，但执行检查仍应保持明确。就这个意义而言，进步重新分配复杂度，有时也缩小复杂度。最容易过时的规则，往往是围绕某个模型暂时的局限设计出来的。

对于一条新的路由启发式规则，Mei 建议：“把它放到功能开关后面。”功能开关使团队能够比较行为，也能在不大幅重写的情况下撤回这条规则。每一条额外规则都应该在评估中证明其成本合理，这才算赢得保留的位置。目标不是让代码库尽可能小，而是让剩下的复杂度都有明确作用。

Mei 用一个类比作结：辅助轮能帮助人学会骑车，但骑得熟练以后，刹车仍然有用。工程工作的任务，是分辨这两种支持。随着模型变强，移除它不再需要的辅助措施，测试变化，并保留那些使行动可靠的控制机制。
