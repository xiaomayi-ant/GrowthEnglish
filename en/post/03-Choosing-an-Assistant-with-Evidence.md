---
tags: [english, vocabulary, reading]
source: "[[english-words-002]]"
scene: AI 评测、模型选型与系统接入
---

# Choosing an Assistant with Evidence

## English

The team had two assistants to evaluate: an *incumbent* service and a cheaper candidate. Switching immediately might create operational *nightmares*, but staying forever could deepen vendor *lock-in*. Elena proposed a *repeatable* *assessment*. Before anyone discussed price, she would *draft* an *explicit* *rubric* and ask colleagues to *critique* it. A quick *glimpse* of a fluent answer was not enough.

They built a *curated* dataset from support *sessions*. Each example included *ground truth*, source documents, and a record of data *lineage*. The rubric measured *correctness*, *coverage*, *groundedness*, and *minimality*: was the answer right, did it address the request, was it supported by evidence, and did it avoid unnecessary content? An evaluator who rewards length often *overlooks* repetition. Their *mitigation* was to *tighten* the scoring guidance and perform careful *vetting* of examples.

*Pointwise* scoring judged each answer independently, *whereas* *pairwise* evaluation asked which of two answers was better. Neither method answered every question. For a direct *comparison* with human rankings, the team calculated *Spearman correlation* and *Kendall tau*. For categorical judgments, they examined *Cohen's kappa* alongside raw *pairwise agreement*. A *confusion matrix* revealed a problem hidden by the average score: the candidate frequently marked unsupported claims as supported.

Because generation was *stochastic*, scores showed noticeable *fluctuations*. The analysts reported uncertainty *intervals* rather than a single impressive number. A Bayesian analysis updated a *posterior* estimate of the failure rate as new labels arrived. The team did not assume that customer behavior would remain *stationary*. *Rigor* meant checking both repeated runs and changes in the kinds of questions people asked.

They also examined the training *curriculum*. A model could learn to repeat phrases that pleased the judge without becoming more useful. This was a form of *reward hacking*. The team treated *curriculum stabilization* as the process of making the training task mixture less erratic; that *stabilization* did not prove real-world reliability. A *meticulous* reviewer compared scores with practical *utility*. She refused to *speculate* that a small benchmark improvement would *dramatically* reduce support costs.

Only then did the engineers *tackle* the *implementation*. Their old service was *monolithic*. The replacement needed *portability* and a *platform-aware* adapter. A small *facade* would hide provider details, while a *capability bridge* would connect supported tools. Temporary *scaffolding* helped them *wire* the components together. A *generic* interface accepted an *opaque* session handle, so callers did not depend on its internal format.

Several *invariants* had to hold: one user's request could not read another user's history, cancellation had to stop new work, and temporary resources had to be released. In the chosen runtime, a lightweight task called a *fiber* could wait without blocking the main thread. The wrapper would *catch* failures and *dispose* of resources after completion. Type *erasure* meant that compile-time types alone could not validate external input. An *extension* to the *Skill API* therefore checked tool arguments at runtime, including those passed to a *deferred tool* loaded only when needed.

Localization brought a smaller but revealing test. The *request locale* could differ from the *skill locale*. A confirmation *dialog* had to use language the user understood, and tool *registration* had to preserve that information. The team would *poll* a background job until completion, but an expired *lease* must stop further access. Even a brief *lapse* in cleanup could leave resources behind. Good operational *hygiene* was not *trivial*.

Elena ended the review with *condensed* *guidance*: *omit* duplicated examples, *archive* outdated runs, and write a short *recap* of each decision. Their *posture* was cautiously optimistic. The new assistant won a limited trial, not a permanent endorsement. The useful *takeaway* was that a careful evaluation connects model behavior, human judgment, and engineering reality.

## 中文翻译

团队要评估两个助手：现有服务和一个更便宜的候选方案。立即切换可能造成运维噩梦，但永远不换又会加深对供应商的依赖。Elena 提议开展一项可重复的评估。在讨论价格之前，她先起草明确的评分标准，并请同事提出批评意见。只看一眼流畅的回答，远远不够。

他们从支持会话中整理出经过筛选的数据集。每个示例都包含基准答案、来源文档和数据血缘记录。评分标准衡量正确性、覆盖程度、事实依据和精简程度：答案是否正确，是否回应了请求，是否有证据支持，以及是否避免了不必要的内容。奖励长答案的评估者往往会忽略重复。团队的缓解措施是收紧评分指导，并仔细核验示例。

逐项评分独立评价每个答案，成对评估则比较两个答案哪个更好。两种方法都无法回答所有问题。为了直接对比模型排序与人工排序，团队计算了斯皮尔曼相关系数和肯德尔秩相关系数。对于类别判断，他们在查看原始成对一致率的同时，也考察科恩 κ 系数。混淆矩阵揭示了平均分掩盖的问题：候选模型经常把缺少依据的说法判为有依据。

由于生成具有随机性，分数会明显波动。分析人员报告了不确定性区间，而不是只给出一个漂亮的数字。随着新标注加入，贝叶斯分析不断更新失败率的后验估计。团队也没有假设客户行为会保持稳定。严谨的评估，既要检查重复运行的结果，也要关注用户提问类型的变化。

他们还检查了训练任务序列。模型可能只是学会重复评判者喜欢的措辞，却没有变得更有用。这是一种奖励投机。团队将“训练课程稳定化”理解为让训练任务的配比不再剧烈波动；这种稳定并不证明现实中的可靠性。一位细致的评审者把分数与实际效用进行了比较。她拒绝凭空推测，认为基准测试上的小幅提升就能显著降低支持成本。

之后，工程师才开始处理实现问题。旧服务是单体结构，而替代方案需要具备可移植性，并配有能识别平台差异的适配器。一个小型门面层隐藏服务提供商的细节，能力桥接层连接支持的工具。临时脚手架帮助他们连接各组件。通用接口接收一个不透明的会话句柄，使调用者不必依赖其内部格式。

有几个不变量必须成立：某个用户的请求不能读取其他用户的历史，取消操作必须阻止后续工作，临时资源必须得到释放。在所选运行时中，名为 fiber 的轻量任务可以等待，而不阻塞主线程。包装层负责捕获失败，并在完成后释放资源。类型擦除意味着，仅靠编译期类型无法校验外部输入。因此，技能 API 的一个扩展会在运行时检查工具参数，包括那些仅在需要时才加载的延后工具所接收的参数。

本地化带来了一个规模较小但很能说明问题的测试。请求使用的语言区域，可能与技能的语言环境不同。确认对话框必须使用用户能理解的语言，工具注册时也必须保留这些信息。团队会轮询后台任务直至完成，但租约一旦过期，就必须停止后续访问。清理工作哪怕短暂疏漏，也可能留下资源。良好的运维维护习惯绝不是小事。

Elena 用精简的指导结束了评审：省略重复示例，归档过期运行，并为每项决策写一段简短回顾。团队的态度是谨慎乐观。新助手赢得的是一次有限范围的试用，而非永久认可。真正的收获是：细致的评估会把模型行为、人的判断和工程现实联系起来。
