# 参与贡献

欢迎修正安装问题、输出结构、方法论规则和文档。这个项目同时涉及程序契约与传统术数资料，提交修改时请让结论可以复核。

## 提交前

1. 不要提交真实命主的姓名、生日、命盘、报告、聊天记录或 Obsidian 文件。
2. 不要提交 API Key、Token、Cookie、个人路径和本地 Agent 设置。
3. 方法论纠错请注明体系、学派、规则原文或可靠出处，并说明它会改变哪一步推理。
4. 不把不同流派强行合并；有分歧时并列口径，并写明各自适用条件。

## 修改方法论

方法论以四个单体系 Skill 的 references 为源文件：

```text
.claude/skills/mingli-*/references/workflow-standard.md
.claude/skills/mingli-*/references/workflow-deep.md
```

修改后运行：

```bash
node .claude/scripts/sync-workflow-methods.mjs
node .claude/scripts/test-all.mjs
```

不要直接手改 `.claude/workflows/cross-check.js` 中自动生成的方法论常量，否则下次同步会覆盖。

## Pull Request 建议

- 一个 PR 尽量只处理一类问题。
- 标题写清体系和影响，例如：`fix(ziwei): clarify self-transformation direction`。
- 在正文说明修改前后的差异、测试结果和资料来源。
- 如果改动会增加提示词长度，请说明它为何值得占用上下文。

## 本地验证

```bash
node .claude/scripts/sync-workflow-methods.mjs --check
node .claude/scripts/validate-skills.mjs
node .claude/scripts/test-cross-check.mjs
node .claude/skills/mingli-bazi/scripts/test-day-pillar.mjs
node install.mjs --target agents --project ./tmp-install --dry-run
```

这些测试不会调用模型，不产生大规模 Token 消耗。
