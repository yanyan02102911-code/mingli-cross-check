# 四体系命理交叉验证

八字 · 紫微斗数 · 印度占星 · 现代占星——四个 AI 独立分析，自动交叉比对，输出结构化报告。

> **这不是科学预测。** 四个体系的结论是独立符号系统的各自解读，跨体系一致度只反映"叙事复现度"，不代表事实概率。医疗、投资、法律等决策请咨询专业人士。

---

## 为什么要做这个

同一个问题，不同的命理体系给出的答案可能完全不同。

比如「我适合做什么工作」——八字可能说「食神制杀，靠专业能力吃饭」，紫微可能指向「官禄宫天机，适合策划顾问」，印度占星可能显示「AmK 在处女座，工匠型职业路径」，现代占星可能强调「MC 天蝎座，需要深度和转化感的工作」。

**这些答案谁对谁错？** 其实它们不互斥——八字看的是生存策略，紫微看的是社会角色，印占看的是灵魂指向，现代占星看的是心理驱力。但当四个体系在同一维度上得出相似结论时，这个结论就更值得认真对待。当它们打架时，打架本身也说明了一些东西——比如这个维度可能不是你的主线。

这就是交叉验证的价值：**不是找"正确"的答案，而是看四个独立视角看到的是同一幅画面，还是完全不同的四张图。**

## 核心输出原则：先展示，再解释，最后下结论

本项目不希望只返回一句“你适合什么”或“某件事会怎样”。单体系 Skill 和四体系 Workflow 使用同一套三层解释链：

1. **原始盘面**：先展示用户上传的软件盘中实际存在的数据，例如干支、宫位、星曜、行星度数、相位和时间周期。原始数据、脚本校验结果、AI 推导会分开标注。
2. **对应解释**：说明这些数据在所采用学派中通常代表什么，它们之间如何生克、制化、飞化、成相或互相修正；有不同传承或相反证据时并列说明。
3. **得出结论**：先形成能力、需求、压力、资源、关系或行为等中间判断，再回答用户的维度和具体问题，同时写明成立条件、时间条件、证据强度和不能证明什么。

也就是说，报告不会把“一个配置”直接翻译成“一个现实答案”。读者可以从原盘一路对照到规则，再检查结论是怎样形成的。这既方便理解命盘，也方便学习、纠错和复核。

如果用户提出多个候选项，系统只比较用户实际给出的选项，并分别列出支持、反证、成立条件和当前数据无法判断的部分；不会预设价值排序。

---

## Skill 和 Workflow：可以一起用，也可以分开用

本项目包含两层机制，彼此独立：

### 1. Skill（单体系分析引擎）

四个 Skill 各自独立：

| Skill | 体系 | 触发方式 |
|-------|------|----------|
| `mingli-bazi` | 八字（子平法 + 盲派 + 纳音 + 神煞） | 「帮我看八字」「解释这个四柱」 |
| `mingli-ziwei` | 紫微斗数（三合 + 钦天四化 + 飞星 + 河洛） | 「分析紫微十二宫」「看大限四化」 |
| `mingli-vedic` | 印度占星（Parashara / Dasha / Yoga / Nakshatra） | 「分析这张吠陀盘」「看 Dasha」 |
| `mingli-modern` | 现代占星（心理占星 + 进化占星） | 「分析本命盘」「看相位与行运」 |

**Skill 可以单独使用。** 不需要启动交叉验证。你只想问八字的事业怎么样？直接问就行。只想看看紫微的夫妻宫？直接问。AI 会按照对应体系的方法论做完整分析。

Skill 的方法论存放在 `references/` 目录，包含：
- 分析步骤（从数据校验到结论输出的完整流程）
- 古籍依据（如《渊海子平》《滴天髓》《紫微斗数全书》）
- 不同学派判据（子平 vs 盲派、三合 vs 钦天）
- Gotchas（从真实翻车中沉淀的致命错误清单）

### 2. Workflow（四体系交叉验证引擎）

当你需要四个体系同时分析并交叉比对时，启动 Workflow。

**两个模式**：

| 模式 | 做什么 | Token 粗估 |
|------|--------|:--:|
| **Standard**（默认） | 四体系正式报告 + JSON 摘要交叉比对 + 共识评级 | 120k–200k |
| **Deep** | 展开完整方法论 + 全文交叉验证 | 200k–350k |

**Standard 和 Deep 的区别不在输出长度**——都在架构层面。Standard 的交叉 Agent 只读各体系的 JSON 摘要，Deep 才读全文。两者都由交叉 Agent 直接输出总览段。

**Workflow 里可以选择体系。** 不用每次都跑四个——选「八字+紫微」就只跑两个，交叉验证在两体系间比对。维度同样可选，只关心婚姻就只跑婚姻。

### 3. 小结

| 使用场景 | 用什么 |
|----------|--------|
| 「帮我看看八字的事业」 | 单体系 Skill |
| 「用紫微分析婚姻，详细点」 | 单体系 Skill（深度模式） |
| 「四体系全跑，只看事业和婚姻」 | Workflow（Standard，2 维度） |
| 「四体系全维度 Deep 研究」 | Workflow（Deep，当前默认 10 维度） |

---

## 快速开始

### 兼容范围

| 宿主 | 单体系 Skill | 四体系交叉验证 | 安装位置 |
|------|:--:|:--:|------|
| Claude Code | ✅ | ✅ 原生 Workflow，可并行 | 项目的 `.claude/` |
| Codex | ✅ | ✅ Skill + 跨平台脚本 | `~/.codex/skills/` 或 `CODEX_HOME/skills/` |
| 兼容 SKILL.md 的其他 Agent | ✅ | ✅ 顺序或宿主并行执行 | 项目的 `.agents/skills/` |
| 不支持 Skill 的终端 AI | 手动读取提示 | ✅ `cross_check_anywhere.py` | 无固定位置 |

不同宿主的命令系统并不相同，所以 `/cross-check` 不是跨平台标准命令。最通用的入口是直接说：

```text
请使用 mingli-cross-check，对我上传的八字、紫微、印度占星和现代占星软件盘做 Deep 交叉验证。
```

项目不绑定模型，也不会在内部切换供应商；分析始终使用用户当前会话选择的模型。开发过程主要在 Claude Code 框架接入 DeepSeek V4 Flash 正式版的环境中验证，也可换成其他具备长上下文和较强推理能力的模型。

### 你需要什么

- **Node.js ≥ 18**：用于安装、Claude Workflow 同步和本地测试。
- **Python ≥ 3.10（可选）**：只有非 Claude Code 的跨平台脚本路径需要。
- **用户从排盘软件导出的命盘**：不建议让 AI 凭出生信息自行排紫微、印占或现代星盘。

### 1. 下载仓库

```bash
git clone https://github.com/yanyan02102911-code/mingli-cross-check.git
cd mingli-cross-check
node --version
```

项目没有 npm 依赖，不需要运行 `npm install`。

### 2. 按宿主安装

Claude Code：在本仓库直接启动即可；如果要装到另一个项目：

```bash
node install.mjs --target claude --project /path/to/your-project
```

Codex：安装到用户级 Skill 目录，安装后重启 Codex：

```bash
node install.mjs --target codex
```

其他兼容 `.agents/skills` 的 Agent：

```bash
node install.mjs --target agents --project /path/to/your-project
```

想先确认会写入哪些位置，可在命令末尾添加 `--dry-run`。安装器只覆盖五个 `mingli-*` Skill 和必要脚本，不删除其他 Skill。

### 运行

**第一步：准备命盘数据。** 在爱占星中分别导出以下四项并保存为文本文件：

- 八字排盘（八字）
- 紫微斗数命盘（紫微）
- 印度占星星盘（印占）
- 现代占星星盘（现占）

> 详细导出步骤见 [数据准备教程](docs/data-guide.md)。

**第二步：在已安装 Skill 的 Agent 中启动。**

```bash
claude
```

**单体系分析**——直接说你要什么：

```
帮我看八字的事业
用紫微分析婚姻
```

Skill 自动加载，按对应体系方法论做完整分析。

**交叉验证**——说「做四体系交叉验证」；在支持该 Workflow 命令的 Claude Code 环境中也可输入 `/cross-check`。系统会展示启动引导：

1. 提供命盘数据（文件路径或直接粘贴）
2. 选择体系（如「全跑」或「八字+紫微」）和维度（如「全维度」或「事业+婚姻」）
3. 如有具体追问，一次列成问题清单；它们会保留原顺序逐题回答
4. 选择深度（Standard 默认 / Deep 深度研究）

系统回显数据后，确认无误回复「跑」即开始分析。详见上方「Skill 和 Workflow」章节。

### 3. 没有 Workflow API 时

Codex 或其他 Agent 安装后，可以直接让 Agent 使用 `mingli-cross-check`；Skill 会按宿主能力选择并行或顺序执行。也可以显式生成一个合并任务文件：

```bash
python .claude/scripts/cross_check_anywhere.py \
  --name "示例命主" \
  --birth "1990-01-01 12:00" \
  --gender "女" \
  --chart-dir charts/example \
  --mode standard \
  --run-mode consolidated
```

其中 `charts/example/` 使用固定文件名：

```text
bazi.txt
ziwei.txt
vedic.txt
modern.txt
```

脚本不会调用外部模型 API；它只把最新版 Skill references 组装成任务文件，并在分析完成后把结果整理为六份 Markdown。全部结果写好后运行：

```bash
python .claude/scripts/cross_check_anywhere.py \
  --run-mode assemble \
  --prompt-dir output/prompts-示例命主-YYYY-MM-DD
```

> **⚠️ Token 成本提示**：Standard 模式四体系全维度约 180k tokens，Deep 模式约 300k tokens。本项目通过 Claude Code 框架接入模型，具体费用取决于你配置的模型和 API 价格。

**第四步：查看结果。** 分析完成后，报告写入 `output/<姓名>-<日期>/` 目录：

```
output/Steve-Jobs-2026-08-03/
├── 00-总览.md           ← 一页核心摘要
├── 01-八字分析.md        ← 子平法 + 盲派
├── 02-紫微斗数分析.md    ← 三合 + 钦天四化 + 飞星
├── 03-印度占星分析.md    ← Parashara + Dasha + Yoga
├── 04-现代占星分析.md    ← 心理占星 + 进化占星
└── 05-交叉验证.md        ← 逐维度比对 + 一致度评级
```

---

## 输出长什么样

以 Steve Jobs（1955-02-24 19:15, San Francisco）为例，交叉验证 `## 总览` 段节选：

> 四体系在结构性结论上达到高度一致。事业方向全部指向"智力/创新/表达型路径"；婚姻主题被反复标记为"务实但疏离"；健康主题在三体系中触发疾病宫/生死宫的警示信号。
>
> 跨体系一致度：性格结构=高、事业方向=高、财富模式=中（收入来源的模式分歧）、婚姻时机=高（均指向延迟或不稳定的亲密关系）、健康=高（警示信号一致）。
> 直接矛盾：无。所有分歧属于观察角度差异或时间尺度差异。

完整示例见 [examples/Steve-Jobs/](examples/Steve-Jobs/)。

---

## 架构

四个 Skill 各自独立加载，体系间禁止术语交叉。Workflow 负责编排：

```
命盘数据确认 → 四个 Agent 按三层解释链并行分析 → JSON 摘要校验 → 推理审计与交叉比对 → 总览 → 六文件交付
```

每个 Skill 的方法论存放在 `references/` 目录，由 `sync-workflow-methods.mjs` 自动嵌入 Workflow。Workflow 不做外部 API 调用，所有分析继承当前会话模型。

---

## 目录

```
.claude/
├── skills/
│   ├── mingli-bazi/             # 八字——子平法 / 盲派 / 纳音 / 神煞
│   ├── mingli-ziwei/            # 紫微——三合 / 钦天四化 / 飞星 / 河洛
│   ├── mingli-vedic/            # 印度占星——Parashara / Dasha / Yoga
│   ├── mingli-modern/           # 现代占星——心理占星 / 进化占星
│   └── mingli-cross-check/      # 交叉编排
├── workflows/
│   └── cross-check.js           # 四体系交叉验证 Workflow
└── scripts/
    ├── sync-workflow-methods.mjs # 从 references/ 同步方法论到 Workflow
    ├── assemble-results.mjs      # 确定性写入 + 校验六文件
    ├── cross_check_anywhere.py   # Codex / 通用 Agent 的跨平台路径
    └── test-all.mjs              # 本地测试入口
```

仓库根目录的 `install.mjs` 负责把这套文件复制到不同宿主能够发现的位置；`.github/workflows/ci.yml` 会在每次推送和 PR 时自动检查 references 与 Workflow 是否同步，并运行无模型 smoke tests。

---

## 已知限制

- **跨宿主能力不完全相同**。Claude Code 可以使用原生 Workflow 并行 Agent；其他宿主是否并行取决于自身能力，最保守的兼容路径是 `cross_check_anywhere.py` 顺序任务。
- **Skill 发现机制不是统一标准**。本项目覆盖 Claude Code 的 `.claude/skills`、Codex 的用户级 skills 目录和常见的 `.agents/skills`；完全不支持 `SKILL.md` 的 Agent 需要手动发送合并任务文件。
- **不是即插即用的 Web 服务**。没有 GUI、没有 API 端点、没有在线 Demo。一切在终端里完成。
- **模型质量影响输出**。不同模型对命理方法论的理解能力差异很大。建议使用推理能力较强的模型（Claude Sonnet 4+ / Opus 4+ / DeepSeek V3+）。
- **Token 消耗不低**。Standard 全维度约 180k tokens，Deep 约 300k。部分模型按 token 计费，费用自负。
- **命理规则未经人工全面审计**。各体系方法论来自公开命理教材和社区共识，未经过专业命理师逐条校订。紫微安星公式已移除（以软件盘为准），但八字排盘中节气月柱、真太阳时等边界情况仍依赖 AI 判断。
- **四体系一致不代表"正确"**。四个 AI Agent 共享同一次出生资料、同一套维度定义、同一类输出模板——它们不是统计独立的。交叉验证的"高一致度"只说明符号叙事自洽，不增加事实概率。

## FAQ

### 为什么不能只给出生日期自动排盘？

AI Agent 没有星历表。紫微斗数的级联计算（命宫→五行局→紫微星→十四主星）任何上游错误都会改变全盘；印度占星需要恒星黄道精确度数；现代占星需要行星黄经。八字日柱可以用内置脚本单项校验（`calculate-day-pillar.mjs`），但这只覆盖日柱，不能替代完整排盘。

**简单说：用软件导出命盘。爱占星一个 App 四个盘全出。**

### 四个体系结论打架了信哪个？

哪个都别"信"。四个体系是不同的符号系统，用各自的方法论描述同一张出生星图。当它们一致时，说明"不同方法论在这一点上碰巧同向"；当它们分歧时，交叉验证报告会标注分歧类型（角度差异/时间尺度/方法论边界/真实矛盾），而不是强行调和。

**跨体系一致度不是正确率。**

### 分析说我会发财 / 离婚 / 生病，真的吗？

这些是传统文化符号系统的解读，是古人观察经验的归纳框架，不是现代科学的因果推断。所有结论都应作为自我反思的参考起点，而不是预测或宿命。

### 怎么只分析婚姻不分析别的？

在启动引导中指定维度：回复「全跑，婚姻」即只分析婚姻维度。也可以组合：「全跑，事业+婚姻+财富」。

### 系统报错了怎么办？

1. 检查命盘数据是否通过门槛（至少需要有可识别的内容格式）
2. 运行 `node .claude/scripts/test-all.mjs` 确认本地环境正常
3. 提 Issue 附上错误日志（脱敏后）

### 为什么提示 Unknown command: /cross-check？

因为斜杠命令由宿主实现，不是 Skill 的通用标准。请先按上面的宿主方式安装，然后直接用自然语言说「使用 mingli-cross-check 做四体系交叉验证」。Claude Code 中还应确认仓库的 `.claude/workflows/cross-check.js` 已安装。

### 如何更新？

在仓库目录执行 `git pull`，然后重复对应的 `node install.mjs --target ...` 命令。安装器只更新五个命理 Skill，不碰其他 Agent 配置。

### 会不会上传我的命盘？

不会自动上传。本项目没有遥测和外部模型 API 调用；但你所使用的 AI 宿主本身如何处理会话内容，取决于其服务条款。仓库已忽略 `charts/`、`命例/`、`output/` 和本地设置。提交 Issue 前仍应人工删除姓名、出生资料、文件路径、API Key 和报告正文。

### 想修改方法论怎么办？

1. 编辑对应 Skill 的 `references/workflow-standard.md` 或 `references/workflow-deep.md`
2. 运行 `node .claude/scripts/sync-workflow-methods.mjs`
3. 运行 `node .claude/scripts/test-all.mjs` 验证

---

## 贡献

欢迎提交 Issue 或 PR，尤其欢迎提供有明确学派与出处的方法论纠错。请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。修改方法论请遵循 `references/` → `sync` → `test` 的工作流；提交前务必移除真实命盘和个人信息。

## 许可证

[MIT](LICENSE)
