# 印度占星 Standard 方法

## 数据检查

记录 Sidereal/Tropical、Ayanamsa（默认 Lahiri）、宫制、度数精度、D-1、D-9、Vimshottari Dasha 和 Shadbala 来源。不同口径不得混用。

## 分析顺序

1. **星盘速览**：上升度数+星座、各行星黄经+星座+Nakshatra+Pada、Charakaraka 序列（只计日月水金火木土七颗实体行星，不含罗计）、当前 Dasha、候选 Yoga 列表。
2. **Charakaraka**：七 Karaka 按各自星座内度数从高到低排列——AK→AmK→BK→MK→PK→GK→DK。AK 分析要点：星座+星宿+宫位+是否受克（燃烧/落陷/被凶星夹制）。DK 分析要点：配偶特征+Navamsa 位置。
3. **宫位分析**：上升判断（命主星状态）→ 功能吉凶星按实际上升逐宫推导（天然吉凶与功能吉凶分开标注）→ 重点宫位群星效应。
4. **Yoga 验证**：每个候选 Yoga 列出参与行星、宫主关系（Kendra/Trikona 及其它）、关联方式（合相/互容/Parashari 相位——不使用现代六分相）、尊贵度、Dasha 触发状态。Raja Yoga 必须 Kendra 主 + Trikona 主关联；Gaja Kesari 必须是 Jupiter 在 Moon 的 Kendra（从月亮起算，非上升）。
5. **D-9 修正**：D-1 的承诺经 D-9 验证——Vargottama 指示稳定性（不写成"翻倍"），D-1 强 D-9 弱降证据强度。
6. **Dasha 时机**：Yoga 定本命承诺 → Dasha 定时机 → 行星力量定结果大小。没有对应 Yoga 时不因行星天然吉性而承诺结果。

## 维度映射

- 自我与方向：Lagna、Lagnesh、Moon、AK
- 事业：10宫/10主、AmK、相关 Yoga；有 D-10 才作细分
- 关系：7宫/7主、Venus、DK、D-9 中 7 宫
- 财富：2/11宫及宫主、Dhana Yoga、相关 Dasha
- 家庭：4/9宫及 Moon、Sun/Jupiter 等自然指示星
- 外地：9/12宫、Rahu/Ketu 轴和相应 Dasha
- 健康：6/8宫、Lagnesh 受克状态
- 灵性：AK+木星+Ketu+9/12宫

每个维度列出本命承诺、修正因素、时间数据状态、限制和证据强度，生成严格 JSON 摘要。

## 三层解释链

所有关键判断按三层输出：

1. **原始盘面**：列出相关行星度数、星座、宫位、Nakshatra、宫主身份、尊贵度和分盘位置。
2. **对应解释**：说明 Parashara/Jaimini 规则、Yoga 条件、破格因素和 D-1/分盘/Dasha 的层级关系。
3. **得出结论**：先形成中间机制，再结合竞争解释、时间触发和数据限制给出结论。

遇到具体选择题时，为用户给出的每个候选项建立“支持证据—反证—成立条件—不可判断项”小表，不预设候选项。先有 D-1 承诺，分盘和 Dasha 才能修正或触发，不可倒推。
