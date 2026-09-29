# Broca Specification

这里记录 Broca 的产品、交互、视觉和技术规格。文档按审核顺序编号，先记录事实和方向，再记录已经确认的实现决策。早期文档中的 EnPet 为项目旧名。

## 当前文档

当前开发方向以 [Broca V1 开发规划：以对话为入口](008-broca-v1-chat-first-plan.md) 为准。先完成极简聊天界面的删减与重建，再分阶段接入真实对话、教学和语音能力。

| 文档 | 状态 | 作用 |
| --- | --- | --- |
| [008-broca-v1-chat-first-plan](008-broca-v1-chat-first-plan.md) | 产品方向已确认，实施分阶段 | Broca V1 极简聊天入口、服务接入、教学封装和语音/视频扩展规划 |
| [007-broca-brand](007-broca-brand.md) | 名称和当前 Logo 已采用 | Broca 鸣鸟标志、品牌资源和数据兼容方式 |
| [001-product-review-and-visual-direction](001-product-review-and-visual-direction.md) | 早期评审，首页方案已被 008 替代 | 保留项目事实、学习方式、API Key、目录设计和首轮视觉方向供参考 |

## 审核规则

1. 文档中的“现状”来自当前代码和实际运行界面。
2. “建议”表示待审核方向，不代表已经进入实现。
3. “已确认”只记录用户明确认可的决定。
4. 依据用户已确认的方向与当次开发授权实施，不将规划中的后续能力自动计入当前任务。
5. 视频和内置浏览器暂时只保留扩展方向，待对应阶段选型。

## 后续文档预留

以下文档按需细化 008 中的能力；教学流程描述内部策略和对话行为，不再默认要求独立页面。

- `002-learning-flow-and-personalization.md`：猜词学习、提示层级、复习和用户偏好记忆。
- `003-provider-and-api-key.md`：API Key、模型 provider、密钥保存和降级策略。
- `004-storage-and-first-run.md`：默认资料库、外部词库目录和首次启动流程。
- `005-visual-system.md`：颜色 token、字体、间距、组件和明暗主题。
- `006-media-provider.md`：视频或媒体生成 provider，等项目名称和接入方式确认后再写。
