# 交叉分析契约

## 1. 单体系报告契约

每份报告依次包含：

1. 数据与排盘状态
2. 核心结构
3. 逐维度分析
4. 有上游时间数据时的时间窗口
5. 三条体系内总结
6. 结构化摘要

每个维度必须给出：

- `claim`：可比较的核心主张
- `direction`：`supportive`、`challenging`、`mixed` 或 `insufficient`
- `data_quality`：`complete`、`limited` 或 `insufficient`
- `evidence_strength`：`strong`、`medium` 或 `weak`
- `basis`：1–3 条本体系盘面依据
- `limitations`：反例、冲突或缺失数据
- `time_window`：只有上游数据支持时填写，否则为 `null`

## 2. JSON 摘要契约

报告末尾只放一个摘要区块：

```text
<!-- CROSS_DIGEST_START -->
{"system":"bazi","dimensions":[{"dimension":"事业方向与职业路径","claim":"示例主张","direction":"mixed","data_quality":"complete","evidence_strength":"medium","basis":["依据一"],"limitations":["限制一"],"time_window":null}]}
<!-- CROSS_DIGEST_END -->
```

区块内必须是严格 JSON：双引号、无 Markdown、无注释、无尾逗号。`system` 使用 `bazi`、`ziwei`、`vedic` 或 `modern`。

摘要缺失、JSON 无法解析、体系代码不符或维度结构不完整时：

- 保留正文报告；
- 将该报告标记为 `digest_invalid`；
- Standard 模式不把它送入交叉比较；
- Deep 模式可读取正文，但必须同时披露摘要失效。

## 3. 证据口径

- `strong`：上游数据完整，同一体系内至少两条相互独立的盘面指标同向，且没有同等级反证。
- `medium`：数据基本可用，但只有一条核心指标，或存在可解释的内部冲突。
- `weak`：数据边界、口径不明、指标稀少、依赖辅助规则或存在明显反证。

这些等级只描述符号体系内部的推理条件，不代表现实世界概率。

## 4. 跨体系比较

只比较语义对象一致、时间尺度一致的主张。输出：

- `comparable_systems`：实际可比体系数
- `agreement_count`：方向相容的体系数
- `consistency`：高 / 中 / 低 / 不可比较
- `direct_conflict`：有 / 无
- `conflict_type`：时间尺度、观察角度、方法边界或直接矛盾
- `data_quality_cap`：任一关键体系数据不足时，不得给“高”一致度

一致度建议：全部相容且至少三个体系为高；多数相容为中；方向对立或不足半数为低；少于两个可比体系为不可比较。直接矛盾单独显示，不用它覆盖数据质量。

## 5. 六文件

固定交付：

- `00-总览.md`
- `01-八字分析.md`
- `02-紫微斗数分析.md`
- `03-印度占星分析.md`
- `04-现代占星分析.md`
- `05-交叉验证.md`

未运行、失败或摘要无效的体系仍生成对应文件，并清楚写出状态，不填充虚构分析。

## 6. 失败隔离

- 单体系失败不阻断其他体系。
- 交叉阶段失败时保留四份单体系报告，并生成失败说明。
- 总览阶段失败时，从交叉结果提取有限回退摘要，不重新推导命理结论。
- 组装阶段必须验证目录边界、六文件存在、非空、失败标记和摘要状态。
